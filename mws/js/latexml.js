var last_latex = '';
var last_request_counter = 0;
var $math_output = $('#' + settings.latexml_display_math_id);

/**
 * @callback errorCallback
 * @param {string} error_msg error message
 */

/**
 * @callback contentCallback
 * @param {string} content
 * @param mws_query_callback
 * @param error_callback
 */

/**
 * @param {string} latex
 * @param {contentCallback} content_callback
 * @param {errorCallback} error_callback
 */
function update_latex_input(latex, content_callback, error_callback) {
  if (latex.trim() != '' && latex != last_latex) {
    last_latex = latex;
    var counter = ++last_request_counter;
    latexml_request(latex,
        function (presentation, content) {
          if (last_request_counter == counter) {
            // Display presentation MathML and render via MathJAX
            $math_output.html(
                "<math xmlns='http://www.w3.org/1998/Math/MathML' display='inline'>" + presentation + "</math>"
            );
            MathJax.Hub.Queue(['Typeset',MathJax.Hub]);
            // Deliver content
            content_callback(content);
          }
        },
        function (latexml_error) {
          if (last_request_counter == counter) {
            error_callback(latexml_error);
          }
        });
  }
}


/**
 * @param {string} latexml_response
 * @returns {string} Content MathML
 */
function get_content_mathml(latexml_response) {
  var hasContent = /\"MathML-Content\"[^>]*>([\s\S]*)<\/annotation-xml>/;
  var m = hasContent.exec(latexml_response);
  var content = null;
  if (m!= null) {
    content = m[1];
    content = content.replace(/<csymbol(\s+)cd=\"mws\"(\s+)name=\"qvar\"[^>]*>(\s*)([a-zA-Z0-9]*)(\s*)<\/csymbol>/g, "<mws:qvar>$4</mws:qvar>");
    content = content.replace(/<csymbol(\s+)cd=\"mws\"(\s+)name=\"qvar\"[^>]*\/>/g, "<mws:qvar/>");
    content = content.replace(/^\s+|\s+$/g,'');
  }

  return content;
}

/**
 * @param {string} latexml_response
 * @returns {string} Presentation MathML
 */
function get_presentation_mathml(latexml_response) {
  var hasPresentation = /semantics[^>]*>([\s\S]*)<annotation-xml/;
  var m = hasPresentation.exec(latexml_response);
  var presentation = null;
  if (m!= null) {
    presentation = m[1];
  }

  return presentation;
}

/**
 * @callback latexmlResultCallback
 *
 * @param {string} presentation Presentation Math ML
 * @param {string} content Content Math ML
 */

/**
 *
 * @param {string} latex LaTeX string
 * @param {latexmlResultCallback} result_callback
 * @param {latexmlErrorCallback} error_callback
 */
function latexml_request(latex, result_callback, error_callback) {
  var latexml_error = '';
  $.post(settings.latexml_proxy_url, {
    profile: 'math',
    tex: latex
  }, function (data) {
    if (data.status_code == 0) {
      var content = get_content_mathml(data.result);
      var presentation = get_presentation_mathml(data.result);
      if (content && presentation) {
        result_callback(presentation, content);
        return;
      } else {
        latexml_error = 'No MathML';
      }
    } else {
      latexml_error = data.status;
    }
    error_callback(latexml_error);
  });
}