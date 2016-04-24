module.exports = {


  friendlyName: 'Parse <docmeta> tags',


  description: 'Parse data encoded via <docmeta> tags in a Markdown string.',


  sideEffects: 'cacheable',


  sync: true,


  inputs: {

    mdString: {
      description: 'Markdown string to parse',
      example: '# hello world\n it\'s me, <docmeta name="foo" value="bar"/> \n some string \n\n',
      required: true
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'Parsed metadata',
      outputDescription: 'The metadata parsed from <docmeta> tags in the source markdown.',
      extendedDescription: 'The `name` is the key (left-hand side) and the `value` is the value (right-hand side).  The values are always strings.',
      example: {}
    }

  },


  fn: function(inputs, exits) {
    var reduce = require('lodash.reduce');

    var metadata = reduce(inputs.mdString.match(/<docmeta[^>]*>/igm)||[], function (memo, tag) {
      var name = tag.match(/name="([^">]+)"/i)[1];
      var value = tag.match(/value="([^">]+)"/i)[1];
      memo[name] = value;
      return memo;
    }, {});

    return exits.success(metadata);
  }


};
