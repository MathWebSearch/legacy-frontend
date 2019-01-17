<?php

define('LATEXML_URL', getenv('LATEXML_URL', true) ?: 'https://latexml.mathweb.org/convert');

$data = array(
  'profile' => @$_REQUEST['profile'],
  'tex' => @$_REQUEST['tex']
);

$session = curl_init(LATEXML_URL);
curl_setopt($session, CURLOPT_POST, true);
curl_setopt($session, CURLOPT_POSTFIELDS, $data);
curl_setopt($session, CURLOPT_HEADER, false);
curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($session);
curl_close($session);

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type:application/json');
header('Content-attributes: application/json; charset=ISO-8859-15');
header('Access-Control-Allow-Origin: *');

echo $response;
exit();
?>