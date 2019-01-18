const STATES = {
  DATA: 0,
  CDATA: 1,
  TAG_OPEN: 2,
  TAG_NAME: 3,
  TAG_END: 4,
  ATTRIBUTE_NAME_START: 5,
  ATTRIBUTE_NAME: 6,
  ATTRIBUTE_NAME_END: 7,
  ATTRIBUTE_VALUE_BEGIN: 8,
  ATTRIBUTE_VALUE: 9,
  COMMENT: 10,
};

const ACTIONS = {
  lt: 'action-lt',
  gt: 'action-gt',
  space: 'action-space',
  equal: 'action-equal',
  quote: 'action-quote',
  slash: 'action-slash',
  char: 'action-char',
  bang: 'action-bang'
};

const TYPES = {
  text: 'text',
  comment: 'comment',
  openTag: 'open-tag',
  closeTag: 'close-tag',
  attributeName: 'attribute-name',
  attributeValue: 'attribute-value',
};

const charToAction = {
  ' ': ACTIONS.space,
  '\t': ACTIONS.space,
  '\n': ACTIONS.space,
  '\r': ACTIONS.space,
  '<': ACTIONS.lt,
  '>': ACTIONS.gt,
  '"': ACTIONS.quote,
  "'": ACTIONS.quote,
  '=': ACTIONS.equal,
  '/': ACTIONS.slash,
  '!': ACTIONS.bang,
};

const noop = () => {};
module.exports = emit => {
  var data = '';
  var tagName = '';
  var attrName = '';
  var attrValue = '';
  var isClosing = false;
  var openingQuote = '';
  var comment = '';
  var state = STATES.DATA;
  const stateMachine = {
    [STATES.DATA]: {
      [ACTIONS.lt]: () => {
        if (data.trim()) {
          emit(TYPES.text, data);
        }
        tagName = '';
        isClosing = false;
        state = STATES.TAG_OPEN;
      },
      [ACTIONS.char]: (char) => {
        data += char;
      },
    },
    [STATES.CDATA]: {
      [ACTIONS.char]: (char) => {
        data += char;
        if (data.substr(-3) === ']]>') {
          emit(TYPES.text, data.slice(0, -3));
          data = '';
          state = STATES.DATA;
        }
      },
    },
    [STATES.TAG_OPEN]: {
      [ACTIONS.space]: noop,
      [ACTIONS.bang]: () => {
        comment = '';
        state = STATES.COMMENT;
      },
      [ACTIONS.char]: (char) => {
        tagName = char;
        state = STATES.TAG_NAME;
      },
      [ACTIONS.slash]: () => {
        tagName = '';
        isClosing = true;
      },
    },
    [STATES.COMMENT]: {
      [ACTIONS.char]: char => {
        comment += char;
      },
      [ACTIONS.gt]: () => {
        if(/^--(.+)--$/s.test(comment)){
          emit(TYPES.comment, RegExp.$1);
          state = STATES.DATA;
        }
      }
    },
    [STATES.TAG_NAME]: {
      [ACTIONS.space]: () => {
        if (isClosing) {
          state = STATES.TAG_END;
        } else {
          state = STATES.ATTRIBUTE_NAME_START;
          emit(TYPES.openTag, tagName);
        }
      },
      [ACTIONS.gt]: () => {
        if (isClosing) {
          emit(TYPES.closeTag, tagName);
        } else {
          emit(TYPES.openTag, tagName);
        }
        data = '';
        state = STATES.DATA;
      },
      [ACTIONS.slash]: () => {
        state = STATES.TAG_END;
        emit(TYPES.openTag, tagName);
      },
      [ACTIONS.char]: (char) => {
        tagName += char;
        if (tagName === '![CDATA[') {
          state = STATES.CDATA;
          data = '';
          tagName = '';
        }
      },
    },
    [STATES.TAG_END]: {
      [ACTIONS.gt]: () => {
        emit(TYPES.closeTag, tagName);
        data = '';
        state = STATES.DATA;
      },
      [ACTIONS.char]: noop,
    },
    [STATES.ATTRIBUTE_NAME_START]: {
      [ACTIONS.char]: (char) => {
        attrName = char;
        state = STATES.ATTRIBUTE_NAME;
      },
      [ACTIONS.gt]: () => {
        data = '';
        state = STATES.DATA;
      },
      [ACTIONS.space]: noop,
      [ACTIONS.slash]: () => {
        isClosing = true;
        state = STATES.TAG_END;
      },
    },
    [STATES.ATTRIBUTE_NAME]: {
      [ACTIONS.space]: () => {
        emit(TYPES.attributeName, attrName);
        state = STATES.ATTRIBUTE_NAME_END;
      },
      [ACTIONS.equal]: () => {
        emit(TYPES.attributeName, attrName);
        state = STATES.ATTRIBUTE_VALUE_BEGIN;
      },
      [ACTIONS.gt]: () => {
        attrValue = '';
        emit(TYPES.attributeName, attrName);
        emit(TYPES.attributeValue, attrValue);
        data = '';
        state = STATES.DATA;
      },
      [ACTIONS.slash]: () => {
        isClosing = true;
        attrValue = '';
        emit(TYPES.attributeName, attrName);
        emit(TYPES.attributeValue, attrValue);
        state = STATES.TAG_END;
      },
      [ACTIONS.char]: (char) => {
        attrName += char;
      },
    },
    [STATES.ATTRIBUTE_NAME_END]: {
      [ACTIONS.space]: noop,
      [ACTIONS.equal]: () => {
        state = STATES.ATTRIBUTE_VALUE_BEGIN;
      },
      [ACTIONS.gt]: () => {
        attrValue = '';
        data = '';
        state = STATES.DATA;
      },
      [ACTIONS.char]: (char) => {
        attrValue = '';
        attrName = char;
        state = STATES.ATTRIBUTE_NAME;
      },
    },
    [STATES.ATTRIBUTE_VALUE_BEGIN]: {
      [ACTIONS.space]: noop,
      [ACTIONS.quote]: (char) => {
        openingQuote = char;
        attrValue = '';
        state = STATES.ATTRIBUTE_VALUE;
      },
      [ACTIONS.gt]: () => {
        attrValue = '';
        emit(TYPES.attributeValue, attrValue);
        data = '';
        state = STATES.DATA;
      },
      [ACTIONS.char]: (char) => {
        openingQuote = '';
        attrValue = char;
        state = STATES.ATTRIBUTE_VALUE;
      },
    },
    [STATES.ATTRIBUTE_VALUE]: {
      [ACTIONS.space]: (char) => {
        if (openingQuote) {
          attrValue += char;
        } else {
          emit(TYPES.attributeValue, attrValue);
          state = STATES.ATTRIBUTE_NAME_START;
        }
      },
      [ACTIONS.quote]: (char) => {
        if (openingQuote === char) {
          emit(TYPES.attributeValue, attrValue);
          state = STATES.ATTRIBUTE_NAME_START;
        } else {
          attrValue += char;
        }
      },
      [ACTIONS.gt]: (char) => {
        if (openingQuote) {
          attrValue += char;
        } else {
          emit(TYPES.attributeValue, attrValue);
          data = '';
          state = STATES.DATA;
        }
      },
      [ACTIONS.slash]: (char) => {
        if (openingQuote) {
          attrValue += char;
        } else {
          emit(TYPES.attributeValue, attrValue);
          isClosing = true;
          state = STATES.TAG_END;
        }
      },
      [ACTIONS.char]: (char) => {
        attrValue += char;
      },
    },
  };
  return str => {
    for (let i = 0; i < str.length; i++) {
      var char = str[i];
      var actions = stateMachine[state];
      var action = charToAction[char] || ACTIONS.char;
      (actions[action] || actions[ACTIONS.char])(char);
    }
  };
};