module.exports = {


  friendlyName: 'Compile to HTML',


  description: 'Compile a Markdown string into an HTML string.',


  sideEffects: 'cacheable',


  inputs: {

    mdString: {
      description: 'Markdown string to convert',
      example: '# hello world\n it\'s me, some markdown string \n\n ```js\n//but maybe i have code snippets too...\n```',
      required: true
    },

    ignoreHtml: {
      description: 'Ignore any inline HTML in the markdown (i.e. don\'t include it in the converted HTML output).  Defaults to `false`.',
      example: true
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'html',
      example: '<h1 id="hello-world">hello world</h1>\n<p> it&#39;s me, some markdown string </p>\n<pre><code class="lang-js">//but maybe i have code snippets too...</code></pre>\n'
    }

  },


  fn: function(inputs, exits) {

    var marked = require('marked');

    marked(inputs.mdString, {
      gfm: true,
      tables: true,
      sanitize: inputs.ignoreHtml,
      langPrefix: 'lang-'
    }, function(err, htmlString) {
      if (err) { return exits.error(err); }
      return exits.success(htmlString);
    });
  }

};
