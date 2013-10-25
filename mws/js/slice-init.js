// These functions are adapted from Sentido:
// http://www.matracas.org/sentido/
// Sentido is distributed under the General Public Licence, version 2 or,
// at your option, any later version.
// See the project web site for details.

var mws_settings = {
  // url: 'http://opal.eecs.jacobs-university.de:9090',
  url: 'mws-proxy.php',
  structure: { // provide document.querySelector compatible strings. These fields will be replaced by document.querySelector(value)
    language_selector: '#sentido-embedded-input-editor-syntax'
  },
  // !! The following elements will be attached to the global window object
  elements: { // provide document.querySelector compatible strings strings
    form: '#editor',
    formula_input: '#sentido-embedded-input-editor-textarea',
    editor: '#editor',
    results: '#results',
    results_display: '#results-display'
  },
  transformers: {
    //query_translator_om_to_cmml: 'sentido/om_to_cmml.xsl',
    //query_translator_om_to_cmml: 'sentido/om_to_cmml_mws_query.xsl',
    //query_translator_cmml_to_om: 'sentido/cmml_to_om_mws_query.xsl',
    //formula_transformer: 'sentido/om_to_pmml.xsl',
    results_transformer: 'results_to_pmml.xsl',
    result_cmml_transformer: 'sentido/cmml_to_pmml.xsl'
  }
};

var formula_editor;
formula_editor = null;
var formula_omobj;
formula_omobj = null;

var form, formula_input, editor, results, results_display;
var query_translator_om_to_cmml, query_translator_cmml_to_om;
var formula_transformer, results_transformer, result_cmml_transformer;

var domLoaded = function (callback) {
    /* Internet Explorer */
    /*@cc_on
    @if (@_win32 || @_win64)
        document.write('<script id="ieScriptLoad" defer src="//:"><\/script>');
        document.getElementById('ieScriptLoad').onreadystatechange = function() {
            if (this.readyState == 'complete') {
                callback();
            }
        };
    @end @*/
    /* Mozilla, Chrome, Opera */
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', callback, false);
    }
    /* Safari, iCab, Konqueror */
    if (/KHTML|WebKit|iCab/i.test(navigator.userAgent)) {
        var DOMLoadTimer = setInterval(function () {
            if (/loaded|complete/i.test(document.readyState)) {
                callback();
                clearInterval(DOMLoadTimer);
            }
        }, 10);
    }
    /* Other web browsers */
    window.onload = callback;
};

window.onload = function () {
  for (var name in mws_settings.structure) {
    mws_settings.structure[name] = document.querySelector(mws_settings.structure[name]);
  }
  for (var name in mws_settings.elements) {
    window[name] = document.querySelector(mws_settings.elements[name]);
  }
  for (var name in mws_settings.transformers) {
    window[name] = build_transformer(mws_settings.transformers[name]);
  }
  init();
};