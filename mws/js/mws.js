
function mws_search(query) {
  console.log("search for " + query);
  $result.empty().html(
      $(document.createElement('div')).
          css('text-align', 'center').
          append(
              $(document.createElement('img')).attr('src', ajax_loader_url)
          )
  );
  var request = new XMLHttpRequest();
  request.onreadystatechange=function() {
    if (request.readyState==4) {
      $result.empty();
      results_loaded(request, request.responseXML);
    }
  };
  request.open("POST", settings.mws_proxy_url, false);
  request.send(query);
}