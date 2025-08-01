const assert = require('assert');
const helloWorld = require('../helloWorld');

describe('Hello World', function() {
  it('should print Hello, world!', function() {
    assert.equal(helloWorld(), 'Hello, world!');
  });
});
