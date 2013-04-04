<?php
if (isset($_GET["formula-url"])) {
  $ch = curl_init($_GET["formula-url"]);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  header('Content-Type: text/xml');
  $result = curl_exec($ch);
  curl_close($ch);
  header('Access-Control-Allow-Origin: *');
  print($result);
}
?>
