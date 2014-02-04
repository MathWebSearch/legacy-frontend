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
  ]
};