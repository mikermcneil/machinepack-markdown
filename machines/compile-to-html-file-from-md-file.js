module.exports = {

  identity: 'compile-to-html-file-from-md-file',
  friendlyName: 'compile to html file from md file',
  description: 'Load a markdown file from disk, compile to HTML, then save it back to disk.',
  cacheable: true,

  //
  // Steps:
  // ======
  //
  // • stream bytes from disk
  //
  // • when all bytes are in RAM, call the `beforeConvert()` lifecycle
  //   hook (if one exists) to perform an optional transformation of the
  //   markdown string.
  //
  // • convert the (possibly now-transformed) markdown to HTML
  //
  // • call the `afterConvert()` lifecycle hook (if one exists) to perform
  //   an optional transformation of the HTML string.
  //
  // • send the bytes of the (possibly now-transformed) HTML to the path on
  //   disk specified by `dest.html` as a write stream.  When the stream
  //   finishes, call the async callback to signal that this markdown file
  //   has been compiled to HTML and written to disk successfully.
  //
  // • if any error occurs, bail out of trying to compile/write this particular
  //   template file and push it to an error stack for this build step which is
  //   available in closure scope.  It will be handled later, but shouldn't prevent
  //   the other template files from being compiled/written.
  //
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
    }
  },

  defaultExit: 'success',
  catchallExit: 'error',

  exits: {
    error: {},
    errorInBeforeConvert: {},
    errorInAfterConvert: {},
    couldNotRead: {},
    couldNotWrite: {},
    couldNotCompile: {},
    couldNotParse: {},
    success: {
      example: {
        uniqueID: 'sailssocketsunsubscribeFromFirehose999488',
        displayName: 'sails.sockets.unsubscribeFromFirehose()'
      }
    }
  },

  fn: function(inputs, exits) {

    var fsx = require ('fs-extra');
    var async = require('async');
    var M = require('node-machine');

    fsx.readFile(inputs.src, 'utf8', function(err, mdString) {
      if (err) return exits.couldNotRead(err);

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
          M.build(require('../lib/parse-docmeta-tags'))
          .configure({haystack: mdString})
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
        if (err && err.output && err.exit) return err.exit(err.output);
        if (err) return exits.error(err);

        fsx.outputFile(inputs.dest, async_data.htmlString, function(err) {
          if (err) return exits.couldNotWrite(err);
          return exits.success(async_data.metadata);
        });
      });
    });
  }
};
