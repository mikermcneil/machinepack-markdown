module.exports = {


  friendlyName: 'Compile to HTML file from MD file',


  description: 'Load a markdown file from disk, compile to HTML, then save it back to disk.',


  extendedDescription:
  '\n'+
  'Here\'s how this method works:\n'+
  '\n'+
  ' Steps:\n'+
  ' ======\n'+
  '\n'+
  ' + stream bytes from disk\n'+
  '\n'+
  ' + when all bytes are in RAM, call the `beforeConvert()` lifecycle\n'+
  '   hook (if one exists) to perform an optional transformation of the\n'+
  '   markdown string.\n'+
  '\n'+
  ' + convert the (possibly now-transformed) markdown to HTML\n'+
  '\n'+
  ' + call the `afterConvert()` lifecycle hook (if one exists) to perform\n'+
  '   an optional transformation of the HTML string.\n'+
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

    // beforeConvert: {
    //   description: 'An optional lifecycle hook that is called to transform source Markdown before converting.',
    //   example: '->',
    //   contract: {
    //     // ...TODO
    //   }
    // },

    // afterConvert: {
    //   description: 'An optional lifecycle hook that is called to transform compiled HTML before it is returned.',
    //   example: '->',
    //   contract: {
    //     // ...TODO
    //   }
    // },

  },


  exits: {

    success: {
      outputFriendlyName: 'Parsed metadata',
      outputDescription: 'The metadata parsed from <docmeta> tags in the source markdown.',
      example: [
        {
          name: 'foo',
          value: 'bar'
        }
      ]
    },

    couldNotRead: {
      description: 'Could not read source file from disk'
    },

    couldNotWrite: {
      description: 'Could not write file back to disk'
    },

    couldNotCompile: {
      description: 'Could not compile markdown to HTML'
    },

    couldNotParse: {
      description: 'Could not parse "docmeta" tags'
    }

  },


  fn: function(inputs, exits) {

    var fsx = require ('fs-extra');
    var async = require('async');
    var M = require('machine');

    fsx.readFile(inputs.src, 'utf8', function(err, mdString) {
      if (err) { return exits.couldNotRead(err); }

      async.auto({
        htmlString: function (cb) {
          M.build(require('./compile-to-html'))
          .configure({mdString:mdString})
          .exec(function (err, htmlString) {
            if (err) {
              return cb({
                output: err,
                exit: exits.couldNotCompile
              });
            }
            return cb(null, htmlString);
          });
        },
        metadata: function (cb) {
          M.build(require('./parse-docmeta-tags'))
          .configure({mdString: mdString})
          .exec(function (err, metadata) {
            if (err) {
              return cb({
                output: err,
                exit: exits.couldNotParse
              });
            }

            return cb(null, metadata);
          });
        }
      }, function (err, async_data) {
        if (err && err.output && err.exit) { return err.exit(err.output); }
        else if (err) { return exits.error(err); }

        fsx.outputFile(inputs.dest, async_data.htmlString, function(err) {
          if (err) { return exits.couldNotWrite(err); }
          return exits.success(async_data.metadata);
        });
      });
    });
  }


};
