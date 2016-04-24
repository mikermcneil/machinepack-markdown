module.exports = {


  friendlyName: 'Compile to HTML file from MD file',


  description: 'Load a markdown file from disk, compile to HTML, then save it back to disk.',


  extendedDescription:
  'Expects GitHub-flavored Markdown syntax.  Uses [`marked`](https://github.com/chjj/marked). '+
  'Specifically, here\'s how this method works:\n'+
  '\n'+
  ' Steps:\n'+
  ' ======\n'+
  '\n'+
  ' + stream bytes from disk\n'+
  '\n'+
  ' + when all bytes are in RAM, convert the source markdown to HTML\n'+
  '\n'+
  ' + send the bytes of the (possibly now-transformed) HTML to the path on\n'+
  '   disk specified by `dest.html` as a write stream.  When the stream\n'+
  '   finishes, call the async callback to signal that this markdown file\n'+
  '   has been compiled to HTML and written to disk successfully.\n'+
  '\n',


  sideEffects: 'idempotent',


  inputs: {

    src: {
      description: 'Path (relative or absolute) to the Markdown file to convert.',
      example: '.tmp/compile-markdown-tree/some/markdown/file.md',
      required: true
    },

    dest: {
      description: 'Path (relative or absolute) to the HTML file to create.',
      example: '.tmp/public/templates/documentation/reference',
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
    },//</inputs.compileCodeBlock>

  },


  exits: {

    success: {
      outputFriendlyName: 'Parsed metadata',
      outputDescription: 'The metadata parsed from <docmeta> tags in the source markdown.',
      extendedDescription: 'The `name` is the key (left-hand side) and the `value` is the value (right-hand side).  The values are always strings.',
      example: {}
    },

    couldNotRead: {
      description: 'Could not read source file from disk.'
    },

    couldNotWrite: {
      description: 'Could not write file back to disk.'
    },

    couldNotCompile: {
      description: 'Could not compile markdown to HTML.'
    },

    couldNotParse: {
      description: 'Could not parse "docmeta" tags.'
    }

  },


  fn: function(inputs, exits) {
    var async = require('async');
    var Filesystem = require('machinepack-fs');
    var Markdown = require('../');


    Filesystem.read({ source: inputs.src }).exec(function (err, mdString) {
      if (err) { return exits.couldNotRead(err); }

      async.auto({

        htmlString: function (next) {
          Markdown.compileToHtml({
            mdString: mdString,
            escapeHtml: inputs.escapeHtml,
            compileCodeBlock: inputs.compileCodeBlock
          }).exec(function (err, htmlString) {
            if (err) { return next({ output: err, exit: 'couldNotCompile' }); }
            else { return next(undefined, htmlString); }
          });
        },//</async.auto::htmlString>

        metadata: function (next) {
          Markdown.parseDocmetaTags({
            mdString: mdString
          }).exec(function (err, metadata) {
            if (err) { return next({ output: err, exit: 'couldNotParse' }); }
            else { return next(undefined, metadata); }
          });
        }//</async.auto::metadata>

      }, function afterwards (err, asyncAutoResults) {
        if (err && err.exit==='couldNotCompile') { return exits.couldNotCompile(err.output); }
        else if (err && err.exit==='couldNotParse') { return exits.couldNotParse(err.output); }
        else if (err) { return exits.error(err); }

        Filesystem.write({
          destination: inputs.dest,
          string: asyncAutoResults.htmlString,
          force: true
        }).exec(function(err) {
          if (err) { return exits.couldNotWrite(err); }
          return exits.success(asyncAutoResults.metadata);
        });//</Filesystem.write()>
      });//</afterwards from async.auto()>
    });//</Filesystem.readFile()>
  }


};
