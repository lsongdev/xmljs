(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.xml2 = {}));
}(this, function (exports) { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var STATES = {
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
    COMMENT: 10
  };
  var ACTIONS = {
    lt: 'action-lt',
    gt: 'action-gt',
    space: 'action-space',
    equal: 'action-equal',
    quote: 'action-quote',
    slash: 'action-slash',
    char: 'action-char',
    bang: 'action-bang'
  };
  var TYPES = {
    text: 'text',
    comment: 'comment',
    openTag: 'open-tag',
    closeTag: 'close-tag',
    attributeName: 'attribute-name',
    attributeValue: 'attribute-value'
  };
  var charToAction = {
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
    '!': ACTIONS.bang
  };

  var noop = function noop() {};

  var parser = function parser(emit) {
    var _STATES$DATA, _STATES$TAG_OPEN, _STATES$COMMENT, _STATES$TAG_NAME, _STATES$TAG_END, _STATES$ATTRIBUTE_NAM, _STATES$ATTRIBUTE_NAM2, _STATES$ATTRIBUTE_NAM3, _STATES$ATTRIBUTE_VAL, _STATES$ATTRIBUTE_VAL2, _stateMachine;

    var data = '';
    var tagName = '';
    var attrName = '';
    var attrValue = '';
    var isClosing = false;
    var openingQuote = '';
    var comment = '';
    var state = STATES.DATA;
    var stateMachine = (_stateMachine = {}, _defineProperty(_stateMachine, STATES.DATA, (_STATES$DATA = {}, _defineProperty(_STATES$DATA, ACTIONS.lt, function () {
      if (data.trim()) {
        emit(TYPES.text, data);
      }

      tagName = '';
      isClosing = false;
      state = STATES.TAG_OPEN;
    }), _defineProperty(_STATES$DATA, ACTIONS.char, function (char) {
      data += char;
    }), _STATES$DATA)), _defineProperty(_stateMachine, STATES.CDATA, _defineProperty({}, ACTIONS.char, function (char) {
      data += char;

      if (data.substr(-3) === ']]>') {
        emit(TYPES.text, data.slice(0, -3));
        data = '';
        state = STATES.DATA;
      }
    })), _defineProperty(_stateMachine, STATES.TAG_OPEN, (_STATES$TAG_OPEN = {}, _defineProperty(_STATES$TAG_OPEN, ACTIONS.space, noop), _defineProperty(_STATES$TAG_OPEN, ACTIONS.bang, function () {
      comment = '';
      state = STATES.COMMENT;
    }), _defineProperty(_STATES$TAG_OPEN, ACTIONS.char, function (char) {
      tagName = char;
      state = STATES.TAG_NAME;
    }), _defineProperty(_STATES$TAG_OPEN, ACTIONS.slash, function () {
      tagName = '';
      isClosing = true;
    }), _STATES$TAG_OPEN)), _defineProperty(_stateMachine, STATES.COMMENT, (_STATES$COMMENT = {}, _defineProperty(_STATES$COMMENT, ACTIONS.char, function (char) {
      comment += char;
    }), _defineProperty(_STATES$COMMENT, ACTIONS.gt, function () {
      if (/^\x2D\x2D([\0-\uFFFF]+)\x2D\x2D$/.test(comment)) {
        emit(TYPES.comment, RegExp.$1);
        state = STATES.DATA;
      }
    }), _STATES$COMMENT)), _defineProperty(_stateMachine, STATES.TAG_NAME, (_STATES$TAG_NAME = {}, _defineProperty(_STATES$TAG_NAME, ACTIONS.space, function () {
      if (isClosing) {
        state = STATES.TAG_END;
      } else {
        state = STATES.ATTRIBUTE_NAME_START;
        emit(TYPES.openTag, tagName);
      }
    }), _defineProperty(_STATES$TAG_NAME, ACTIONS.gt, function () {
      if (isClosing) {
        emit(TYPES.closeTag, tagName);
      } else {
        emit(TYPES.openTag, tagName);
      }

      data = '';
      state = STATES.DATA;
    }), _defineProperty(_STATES$TAG_NAME, ACTIONS.slash, function () {
      state = STATES.TAG_END;
      emit(TYPES.openTag, tagName);
    }), _defineProperty(_STATES$TAG_NAME, ACTIONS.char, function (char) {
      tagName += char;

      if (tagName === '![CDATA[') {
        state = STATES.CDATA;
        data = '';
        tagName = '';
      }
    }), _STATES$TAG_NAME)), _defineProperty(_stateMachine, STATES.TAG_END, (_STATES$TAG_END = {}, _defineProperty(_STATES$TAG_END, ACTIONS.gt, function () {
      emit(TYPES.closeTag, tagName);
      data = '';
      state = STATES.DATA;
    }), _defineProperty(_STATES$TAG_END, ACTIONS.char, noop), _STATES$TAG_END)), _defineProperty(_stateMachine, STATES.ATTRIBUTE_NAME_START, (_STATES$ATTRIBUTE_NAM = {}, _defineProperty(_STATES$ATTRIBUTE_NAM, ACTIONS.char, function (char) {
      attrName = char;
      state = STATES.ATTRIBUTE_NAME;
    }), _defineProperty(_STATES$ATTRIBUTE_NAM, ACTIONS.gt, function () {
      data = '';
      state = STATES.DATA;
    }), _defineProperty(_STATES$ATTRIBUTE_NAM, ACTIONS.space, noop), _defineProperty(_STATES$ATTRIBUTE_NAM, ACTIONS.slash, function () {
      isClosing = true;
      state = STATES.TAG_END;
    }), _STATES$ATTRIBUTE_NAM)), _defineProperty(_stateMachine, STATES.ATTRIBUTE_NAME, (_STATES$ATTRIBUTE_NAM2 = {}, _defineProperty(_STATES$ATTRIBUTE_NAM2, ACTIONS.space, function () {
      emit(TYPES.attributeName, attrName);
      state = STATES.ATTRIBUTE_NAME_END;
    }), _defineProperty(_STATES$ATTRIBUTE_NAM2, ACTIONS.equal, function () {
      emit(TYPES.attributeName, attrName);
      state = STATES.ATTRIBUTE_VALUE_BEGIN;
    }), _defineProperty(_STATES$ATTRIBUTE_NAM2, ACTIONS.gt, function () {
      attrValue = '';
      emit(TYPES.attributeName, attrName);
      emit(TYPES.attributeValue, attrValue);
      data = '';
      state = STATES.DATA;
    }), _defineProperty(_STATES$ATTRIBUTE_NAM2, ACTIONS.slash, function () {
      isClosing = true;
      attrValue = '';
      emit(TYPES.attributeName, attrName);
      emit(TYPES.attributeValue, attrValue);
      state = STATES.TAG_END;
    }), _defineProperty(_STATES$ATTRIBUTE_NAM2, ACTIONS.char, function (char) {
      attrName += char;
    }), _STATES$ATTRIBUTE_NAM2)), _defineProperty(_stateMachine, STATES.ATTRIBUTE_NAME_END, (_STATES$ATTRIBUTE_NAM3 = {}, _defineProperty(_STATES$ATTRIBUTE_NAM3, ACTIONS.space, noop), _defineProperty(_STATES$ATTRIBUTE_NAM3, ACTIONS.equal, function () {
      state = STATES.ATTRIBUTE_VALUE_BEGIN;
    }), _defineProperty(_STATES$ATTRIBUTE_NAM3, ACTIONS.gt, function () {
      attrValue = '';
      data = '';
      state = STATES.DATA;
    }), _defineProperty(_STATES$ATTRIBUTE_NAM3, ACTIONS.char, function (char) {
      attrValue = '';
      attrName = char;
      state = STATES.ATTRIBUTE_NAME;
    }), _STATES$ATTRIBUTE_NAM3)), _defineProperty(_stateMachine, STATES.ATTRIBUTE_VALUE_BEGIN, (_STATES$ATTRIBUTE_VAL = {}, _defineProperty(_STATES$ATTRIBUTE_VAL, ACTIONS.space, noop), _defineProperty(_STATES$ATTRIBUTE_VAL, ACTIONS.quote, function (char) {
      openingQuote = char;
      attrValue = '';
      state = STATES.ATTRIBUTE_VALUE;
    }), _defineProperty(_STATES$ATTRIBUTE_VAL, ACTIONS.gt, function () {
      attrValue = '';
      emit(TYPES.attributeValue, attrValue);
      data = '';
      state = STATES.DATA;
    }), _defineProperty(_STATES$ATTRIBUTE_VAL, ACTIONS.char, function (char) {
      openingQuote = '';
      attrValue = char;
      state = STATES.ATTRIBUTE_VALUE;
    }), _STATES$ATTRIBUTE_VAL)), _defineProperty(_stateMachine, STATES.ATTRIBUTE_VALUE, (_STATES$ATTRIBUTE_VAL2 = {}, _defineProperty(_STATES$ATTRIBUTE_VAL2, ACTIONS.space, function (char) {
      if (openingQuote) {
        attrValue += char;
      } else {
        emit(TYPES.attributeValue, attrValue);
        state = STATES.ATTRIBUTE_NAME_START;
      }
    }), _defineProperty(_STATES$ATTRIBUTE_VAL2, ACTIONS.quote, function (char) {
      if (openingQuote === char) {
        emit(TYPES.attributeValue, attrValue);
        state = STATES.ATTRIBUTE_NAME_START;
      } else {
        attrValue += char;
      }
    }), _defineProperty(_STATES$ATTRIBUTE_VAL2, ACTIONS.gt, function (char) {
      if (openingQuote) {
        attrValue += char;
      } else {
        emit(TYPES.attributeValue, attrValue);
        data = '';
        state = STATES.DATA;
      }
    }), _defineProperty(_STATES$ATTRIBUTE_VAL2, ACTIONS.slash, function (char) {
      if (openingQuote) {
        attrValue += char;
      } else {
        emit(TYPES.attributeValue, attrValue);
        isClosing = true;
        state = STATES.TAG_END;
      }
    }), _defineProperty(_STATES$ATTRIBUTE_VAL2, ACTIONS.char, function (char) {
      attrValue += char;
    }), _STATES$ATTRIBUTE_VAL2)), _stateMachine);
    return function (str) {
      for (var i = 0; i < str.length; i++) {
        var char = str[i];
        var actions = stateMachine[state];
        var action = charToAction[char] || ACTIONS.char;
        (actions[action] || actions[ACTIONS.char])(char);
      }
    };
  };

  var createNode = function createNode(node) {
    return Object.assign({
      attributes: {},
      children: []
    }, node);
  };

  var reader = function reader(done) {
    var current, attrname;
    return parser(function (type, value) {
      switch (type) {
        case 'open-tag':
          var node = createNode({
            type: 'element',
            name: value,
            parent: current
          });
          current && current.children.push(node);
          current = node;
          break;

        case 'attribute-name':
          attrname = value;
          current.attributes[value] = void 0;
          break;

        case 'attribute-value':
          current.attributes[attrname] = value;
          break;

        case 'text':
          current.children.push(createNode({
            type: type,
            value: value,
            parent: current
          }));
          break;

        case 'close-tag':
          var _current = current,
              parent = _current.parent;
          delete current.parent;
          !parent && done(current);
          current = parent;
          break;
      }
    });
  };

  reader.parser = parser;
  var reader_1 = reader;

  exports.createParser = parser;
  exports.createReader = reader_1;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
