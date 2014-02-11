<?php

define ('TEMA_URL', 'http://212.201.49.178:8889');

$session = curl_init(TEMA_URL.'/?'.$_SERVER['QUERY_STRING']);
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
