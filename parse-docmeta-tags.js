/**
 * Module dependencies
 */

var _ = require('lodash');

module.exports = {

  id: 'parse-docmeta-tags',
  moduleName: 'machinepack-markdown',
  description: 'Parse <docmeta/> tags in a string (TODO: pull out somewhere else- doesn\'t belong in this machinepack)',

  synchronous: true,
  noSideEffects: true,
  idempotent: {},

  inputs: {
    haystack: {
      example: '# hello world\n it\'s me, <docmeta name="foo" value="bar"/> \n some string \n\n'
    }
  },
  exits: {
    error: {},
    success: {
      example: {
        foo: 'bar'
      }
    }
  },

  fn: function($i, $x) {
    $x.success(_.reduce($i.haystack.match(/<docmeta[^>]*>/igm)||[], function (m, tag) {
      try {
        m[tag.match(/name="([^">]+)"/i)[1]] = tag.match(/value="([^">]+)"/i)[1];
      } catch(e) {}
      return m;
    }, {}));
  }
};
