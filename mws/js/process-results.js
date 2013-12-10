function process_results(mws_response)
{
  var $results_display = $('#results-display');
  try
  {
      $results_display.html("");
      var $answset = $(mws_response).children('mws\\:answset');
      var answ_nodes = $answset.children("mws\\:answ");
      for (var i = 0; i < answ_nodes.length; i++) {
        var answ = answ_nodes[i];
        var xpath = answ.getAttribute('xpath');
        var uri = answ.getAttribute('uri');
        var $data = $($.parseXML($(answ).children('data').text()));
        var $math = $($data).children('m\\:math');
        var elem = FHL.getPresentation(xpath, $math[0]);
        elem.setAttribute("mathcolor", "blue");
        $results_display.append($('<div style="width:800px; margin-left:auto; margin-right:auto; text-align:center;"/>').append($math));
      }

      MathJax.Hub.Queue(['Typeset',MathJax.Hub]);
  } catch (e) {
      console.log(e.message);
  }
}