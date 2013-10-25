var settings = {
  mws_proxy_url : 'mws-proxy.php',
  mws_results_per_page : 5,

  latexml_proxy_url : 'latexml-proxy.php',
  latexml_display_math_id : 'math-output',

  search_box_placeholder : 'Type LaTeX input',
  search_box_example_queries : [
    ['\\int_?a^?b |?f(x)?g(x)| dx \\leq ?r', 'Schauder Approximations'],
    ['\\int_?a^?b (?f(x))^2 dx=?r', 'Energy of a signal'],
    ['\\lim_{?a\\rightarrow 0} ?x', 'Limit'],
    ['?a^?n + ?b^?n=?c^?n', 'Fermat\'s Theorem'],
    ['?a=_\\alpha ?b', 'Alpha-equality'],
    ['0\\leq ?i\\leq ?n', 'Inequality chain']
  ],

  // !! The following elements will be attached to the global window object
  elements: { // provide document.querySelector compatible strings strings
    form: '#editor',
    formula_input: '#sentido-embedded-input-editor-textarea',
    editor: '#editor',
    results: '#results',
    results_display: '#results-display'
  },

  transformers: {
    query_translator_om_to_cmml: 'sentido/om_to_cmml_mws_query.xsl',
    query_translator_cmml_to_om: 'sentido/cmml_to_om_mws_query.xsl',
    formula_transformer: 'sentido/om_to_pmml.xsl',
    results_transformer: 'results_to_pmml.xsl',
    result_cmml_transformer: 'sentido/cmml_to_pmml.xsl'
  }
};