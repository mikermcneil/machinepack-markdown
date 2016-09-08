/**
 * Module dependencies
 */

var assert = require('assert');
var testMachineWithMocha = require('test-machinepack-mocha').testMachineWithMocha;
var Markdown = require('../');



describe('compileToHtml()', function() {
  var given = function(opts) { return testMachineWithMocha().machine(Markdown.compileToHtml).use(opts); };

  describe('with basic usage', function() {

    describe('given simple, boring markdown', function (){
      given({
        mdString: '# hello'
      }).expect({
        outcome: 'success',
        output: '<h1 id="hello">hello</h1>\n'
      });
    });

    describe('given markdown with inline HTML and with an HTML code block', function (){
      given({
        mdString: '# hello\n\nCheck out this <strong>cool</strong> HTML:\n\n```html\n<strong>pretty neat right?</strong>\n```',
      }).expect({
        outcome: 'success',
        output: '<h1 id="hello">hello</h1>\n<p>Check out this <strong>cool</strong> HTML:</p>\n<pre><code class="lang-html">&lt;strong&gt;pretty neat right?&lt;/strong&gt;\n</code></pre>\n'
      });
    });

  });//</with basic usage>

  describe('with addIdsToHeadings set to `false`', function() {

    describe('given simple, boring markdown', function (){
      given({
        mdString: '# hello',
        addIdsToHeadings: false
      }).expect({
        outcome: 'success',
        output: '<h1>hello</h1>'
      });
    });

  });//</with addIdsToHeadings set to `false`>

  describe('with allowHtml set to false', function() {

    describe('given simple, boring markdown', function (){
      given({
        mdString: '# hello',
        allowHtml: false
      }).expect({
        outcome: 'success',
        output: '<h1 id="hello">hello</h1>\n'
      });
    });

    describe('given a markdown-style link', function (){
      given({
        mdString: '# hello\n[google](http://google.com)',
        allowHtml: false
      }).expect({
        outcome: 'success',
        output: '<h1 id="hello">hello</h1>\n<p><a href="http://google.com">google</a></p>\n'
      });
    });

    describe('given markdown with inline HTML and with an HTML code block', function (){
      given({
        mdString: '# hello\n\nCheck out this <strong>cool</strong> HTML:\n\n```html\n<strong>pretty neat right?</strong>\n```',
        allowHtml: false
      }).expect({
        outcome: 'unsafeMarkdown'
      });
    });

    describe('given markdown with a javacript: link', function (){
      given({
        mdString: '# hello\n\nCheck out this [terrible link](javascript:alert(\'foo\');)\n```',
        allowHtml: false
      }).expect({
        outcome: 'unsafeMarkdown'
      });
    });


  });//</with basic usage>

  describe('when providing a custom lifecycle callback for `compileCodeBlock`', function() {

    describe('given simple, boring markdown', function (){
      given({
        mdString: '# hello',
        compileCodeBlock: function (inputs, exits){
          return exits.success(inputs.codeBlockContents);
        }
      }).expect({
        outcome: 'success',
        output: '<h1 id="hello">hello</h1>\n'
      });
    });

    describe('given markdown with inline HTML and with an HTML code block', function (){
      given({
        mdString: '# hello\n\nCheck out this <strong>cool</strong> HTML:\n\n```html\n<strong>pretty neat right?</strong>\n```',
        compileCodeBlock: function (inputs, exits){
          return exits.success(inputs.codeBlockContents);
        }
      }).expect({
        outcome: 'success',
        output: '<h1 id="hello">hello</h1>\n<p>Check out this <strong>cool</strong> HTML:</p>\n<pre><code class="lang-html">&lt;strong&gt;pretty neat right?&lt;/strong&gt;\n</code></pre>\n'
      });

      describe('with more complex logic in the lifecycle callback', function (){
        given({
          mdString: '# hello\n\nCheck out this <strong>cool</strong> HTML:\n\n```html\n<strong>pretty neat right?</strong>\n```',
          compileCodeBlock: function (inputs, exits){
            setTimeout(function(){
              return exits.success('<span class="some-code-and-stuff">'+inputs.codeBlockContents+'</span>');
            }, 150);
          }
        }).expect({
          outcome: 'success',
          output: '<h1 id="hello">hello</h1>\n<p>Check out this <strong>cool</strong> HTML:</p>\n<pre><code class="lang-html"><span class="some-code-and-stuff"><strong>pretty neat right?</strong></span>\n</code></pre>\n'
        });
      });
    });

  });//</when providing a custom lifecycle callback for `compileCodeBlock`>

});//<compileToHtml()>
