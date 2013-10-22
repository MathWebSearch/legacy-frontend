<?php

  define('MWS_URL', 'http://212.201.49.178:9097');

  $session = curl_init(MWS_URL);
  curl_setopt($session, CURLOPT_POST, true);
  curl_setopt($session, CURLOPT_POSTFIELDS, $HTTP_RAW_POST_DATA);
  curl_setopt($session, CURLOPT_HEADER, null);
  curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
  $response = curl_exec($session);

  // HACK to remove :8000
  $response = str_replace('opal.eecs.jacobs-university.de:8000/', 'search.mathweb.org/', $response);
  $response = str_replace('/./', '/', $response);

  header('Content-Type: text/xml');
  echo $response;
?>
