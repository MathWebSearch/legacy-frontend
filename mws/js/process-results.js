function onMwsAnswer($results_display, mws_answer) {
    var xpath = mws_answer.getAttribute('xpath');
    var uri = mws_answer.getAttribute('uri');
    var $data = $($.parseXML($(mws_answer).children('data').text()));
    var $math = $($data).children('m\\:math');
    var elem = FHL.getPresentation(xpath, $math[0]);
    if (elem) elem.setAttribute("mathcolor", "blue");
    $results_display.append(
        $('<div style="width:800px; margin-left:auto; margin-right:auto; text-align:center;"/>').append($math));
}

function beforeMwsAnswers($results_display) {
    $results_display.html("");
}

function afterMwsAnswers($results_display) {
    MathJax.Hub.Queue(['Typeset',MathJax.Hub]);
}