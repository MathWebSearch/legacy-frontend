/**
 * @callback mwsResultCallback
 *
 * @param {string} mws_response MWS response
 */

/**
 *
 * @param {string} query MWS XML query
 * @param {mwsResultCallback} result_callback
 * @param {errorCallback} error_callback
 */
function mws_request(query, result_callback, error_callback) {
  console.log("search for " + query);
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState==4) {
      if (request.status == 200) {
        result_callback(request.responseXML);
      } else {
        error_callback(request.responseXML);
      }
    }
  };
  request.open("POST", settings.mws_proxy_url, false);
  request.send(query);
}

/**
 *
 * @param {string} content Content Math ML
 * @param {number} page
 * @param {number} size
 * @returns {string} MWS XML query
 */
function mws_query_from_content(content, page, size) {
  page = page || 1;
  size = size || settings.mws_results_per_page;
  var mwsQuery =
      '<mws:query ' +
        'limitmin="' + ((page - 1) * size) + '" ' +
        'answsize="' + size +
        '"><mws:expr>' + content + '</mws:expr></mws:query>';
  return mwsQuery;
}