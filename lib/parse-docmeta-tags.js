module.exports = {

  identity: 'parse-docmeta-tags',
  friendlyName: 'Parse docmeta tags',
  description: 'Parse <docmeta/> tags in a string (TODO: pull out somewhere else- doesn\'t belong in this machinepack)',
  cacheable: true,

  inputs: {
    haystack: {
      example: '# hello world\n it\'s me, <docmeta name="foo" value="bar"/> \n some string \n\n'
    }
  },

  defaultExit: 'success',
  catchallExit: 'error',

  exits: {
    error: {},
    success: {
      example: {
        foo: 'bar'
      }
    }
  },

  fn: function(inputs, exits) {

    var _ = require('lodash');

    exits.success(_.reduce(inputs.haystack.match(/<docmeta[^>]*>/igm)||[], function (m, tag) {
      try {
        m[tag.match(/name="([^">]+)"/i)[1]] = tag.match(/value="([^">]+)"/i)[1];
      } catch(e) {}
      return m;
    }, {}));
  }
};
