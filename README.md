## xml2 [![xml2](https://img.shields.io/npm/v/xml2.svg)](https://npmjs.org/xml2)

> simple xml reader and parser

### Installation

```bash
$ npm install xml2
```

### Example

```js
const XML = require('xml2');

const xml = new XML();

xml.on('open-tag', name => {
  console.log('tag name: ', name);
});

fs.createReadStream('/tmp/demo.xml').pipe(xml)

```

### Contributing
- Fork this Repo first
- Clone your Repo
- Install dependencies by `$ npm install`
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Publish your local branch, Open a pull request
- Enjoy hacking <3

### MIT

This work is licensed under the [MIT license](./LICENSE).

---