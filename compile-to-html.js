/**
 * Module dependencies
 */

var _ = require('lodash');
var marked = require('marked');


module.exports = {

  id: 'compile-to-html',
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
    marked($i.mdString, {
      gfm: true,
      tables: true,
      langPrefix: 'lang-'
    }, function(err, htmlString) {
      if (err) return $x.error(err);
      return $x.success(htmlString);
    });
  }
};
