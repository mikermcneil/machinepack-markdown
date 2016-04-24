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



  describe('with `escapeHtml` enabled', function() {

    describe('given simple, boring markdown', function (){
      given({
        mdString: '# hello',
        escapeHtml: true
      }).expect({
        outcome: 'success',
        output: '<h1 id="hello">hello</h1>\n'
      });
    });

    describe('given markdown with inline HTML and with an HTML code block', function (){
      given({
        mdString: '# hello\n\nCheck out this <strong>cool</strong> HTML:\n\n```html\n<strong>pretty neat right?</strong>\n```',
        escapeHtml: true
      }).expect({
        outcome: 'success',
        output: '<h1 id="hello">hello</h1>\n<p>Check out this &lt;strong&gt;cool&lt;/strong&gt; HTML:</p>\n<pre><code class="lang-html">&lt;strong&gt;pretty neat right?&lt;/strong&gt;\n</code></pre>\n'
      });
    });

  });//</with `escapeHtml` enabled>


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

});
