module.exports = {


  friendlyName: 'Compile to HTML',


  description: 'Compile a Markdown string into an HTML string.',


  extendedDescription:
    'Expects GitHub-flavored Markdown syntax.  Uses [`marked`](https://github.com/chjj/marked).',


  moreInfoUrl: 'https://help.github.com/articles/basic-writing-and-formatting-syntax/',


  sideEffects: 'cacheable',


  inputs: {

    mdString: {
      description: 'Markdown string to convert',
      example: '# hello world\n it\'s me, some markdown string \n\n ```js\n//but maybe i have code snippets too...\n```',
      required: true
    },

    escapeHtml: {
      description: 'If enabled, any inline HTML in the source Markdown will be escaped instead of injected literally in the HTML output.',
      example: false,
      defaultsTo: false
    },

    compileCodeBlock: {
      description: 'An optional lifecycle callback useful for adding syntax highlighting to code blocks, or to perform custom HTML-escaping on them.',
      extendedDescription: 'This callback is called once for each code block in the source Markdown, and expected to return compiled HTML.',
      example: '->',
      contract: {
        sideEffects: 'cacheable',
        inputs: {
          codeBlockContents: {
            description: 'The raw (unescaped) contents of the code block.',
            example: '\nconsole.log("hello");\n'
          },
          programmingLanguage: {
            description: 'The programming language of the code block.',
            extendedDescription:
              'Be warned that this is not normalized. In other words, if one code block in the source Markdown indicates `js`, and another indicates `javascript`, then this function will be called with `js` for the first one, and with `javascript` for the second.',
            example: 'javascript'
          }
        },
        exits: {
          success: {
            outputDescription: 'The compiled, _escaped_ HTML representing the contents of the code block.',
            extendedDescription: 'The compiled HTML output returned here will be wrapped in `<pre>` and `<code>` tags automatically.',
            example: 'console.<span class="function call">log</span>(<span class="string">\'hello\'</span>);'
          }
        }
      }//</inputs.compileCodeBlock.contract>
    }//</inputs.compileCodeBlock>

  },


  exits: {

    success: {
      outputFriendlyName: 'HTML',
      example: '<h1 id="hello-world">hello world</h1>\n<p> it&#39;s me, some markdown string </p>\n<pre><code class="lang-js">//but maybe i have code snippets too...</code></pre>\n'
    }

  },


  fn: function(inputs, exits) {
    var marked = require('marked');

    // For full list of options, see:
    //  • https://github.com/chjj/marked
    var markedOpts = {
      sanitize: inputs.escapeHtml,
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      smartLists: true,
      smartypants: false,
    };

    // If `compileCodeBlock` lifecycle callback was provided, attach the `highlight` option.
    if (inputs.compileCodeBlock) {
      /**
       * A lifecycle callback provided by `marked` to perform syntax highlighting on code blocks.
       *
       * Here's where marked actually makes the call:
       *  • https://github.com/chjj/marked/blob/v0.3.5/lib/marked.js#L766
       *
       * @param  {String}   code [the section of code to pass to the highlighter]
       * @param  {String}   lang [the programming language specified in the code block; e.g. 'javascript']
       * @param  {Function} next
       */
      markedOpts.highlight = function (code, lang, next) {
        inputs.compileCodeBlock({
          codeBlockContents: code,
          programmingLanguage: lang
        }).exec(next);
      };
    }

    // Now actually compile the markdown to HTML.
    marked(inputs.mdString, markedOpts, function afterwards (err, htmlString) {
      if (err) { return exits.error(err); }
      return exits.success(htmlString);
    });
  }


};
