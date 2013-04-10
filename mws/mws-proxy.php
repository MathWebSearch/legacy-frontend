<?php

  define('MWS_URL', 'http://opal.eecs.jacobs-university.de:9097');

  $session = curl_init(MWS_URL);
  curl_setopt($session, CURLOPT_POST, true);
  curl_setopt($session, CURLOPT_POSTFIELDS, $HTTP_RAW_POST_DATA);
  curl_setopt($session, CURLOPT_HEADER, null);
  curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
  $response = curl_exec($session);

  header('Content-Type: text/xml');
  echo $response;
?>
