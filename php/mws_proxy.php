<?php

define('MWS_URL', getenv('MWS_URL', true) ?: 'http://localhost:9090');

$mws_query = '<mws:query'.
    ' limitmin="'.$_GET["from"].'"'.
    ' answsize="'.$_GET["size"].'"'.
    ' totalreq="true"'.
    ' output="json"'.
    '><mws:expr>'.
    $_GET["math"].
    '</mws:expr></mws:query>';

$session = curl_init(MWS_URL);
curl_setopt($session, CURLOPT_POST, true);
curl_setopt($session, CURLOPT_POSTFIELDS, $mws_query);
curl_setopt($session, CURLOPT_HEADER, null);
curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($session);

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type:application/json');
header('Content-attributes: application/json; charset=ISO-8859-15');
header('Access-Control-Allow-Origin: *');

echo $response;
exit();
?>
