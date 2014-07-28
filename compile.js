/**
 * Module dependencies
 */

var _ = require('lodash');
var marked = require('marked');


module.exports = {

  id: 'compile',
  moduleName: 'machinepack-markdown',
  description: 'Compile some markdown to HTML.',
  inputs: {
    mdString: {
      example: '# hello world\n it\'s me, some markdown string \n\n ```js\n//but maybe i have code snippets too...\n```'
    }
  },
  exits: {
    error: {},
    success: {
      example: '<h1 id="hello-world">hello world</h1>\n<p> it&#39;s me, some markdown string </p>\n<pre><code class="lang-js">//but maybe i have code snippets too...</code></pre>\n'
    }
  },

  fn: function($i, $x) {

    /**
     * Contants
     * @type {Object}
     */
    var MARKED_OPTS = {
      gfm: true,
      tables: true,
      langPrefix: 'lang-'
    };

    // Parse metadata
    var metadata = _.reduce(mdString.match(/<docmeta[^>]*>/igm)||[], function (m, tag) {
      try {
        m[tag.match(/name="([^">]+)"/i)[1]] = tag.match(/value="([^">]+)"/i)[1];
      } catch(e) {}
      return m;
    }, {});

    marked($i.mdString, MARKED_OPTS, function(err, htmlString) {
      if (err) return $x.error(err);
      return $x.success(htmlString);
    });
  }
};
