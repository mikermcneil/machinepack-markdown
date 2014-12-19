module.exports = {

  friendlyName: 'Parse <docmeta> tags',
  description: 'Parse data encoded via <docmeta> tags in a Markdown string',
  cacheable: true,

  inputs: {
    mdString: {
      description: 'Markdown string to parse',
      example: '# hello world\n it\'s me, <docmeta name="foo" value="bar"/> \n some string \n\n',
      required: true
    }
  },

  defaultExit: 'success',

  exits: {
    error: {},
    success: {
      example: [
        {
          name: 'foo',
          value: 'bar'
        }
      ]
    }
  },

  fn: function(inputs, exits) {

    var _ = require('lodash');

    var results = _.reduce(inputs.mdString.match(/<docmeta[^>]*>/igm)||[], function (m, tag) {
      try {
        m.push({
          name: tag.match(/name="([^">]+)"/i)[1],
          value: tag.match(/value="([^">]+)"/i)[1]
        });
      } catch(e) {}
      return m;
    }, {});

    return exits.success(results);
  }
};
