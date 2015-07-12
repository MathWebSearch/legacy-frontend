<?php

$data = file_get_contents("php://input");
$session = curl_init('localhost:8080/:tema-oeis');
curl_setopt($session, CURLOPT_POST, true);
curl_setopt($session, CURLOPT_POSTFIELDS, $data);
curl_setopt($session, CURLOPT_HEADER, false);
curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
curl_setopt($session, CURLOPT_HTTPHEADER, array(                                                                          
    'Content-Type: text/plain',                                                                                
    'Content-Length: ' . strlen($data))                                                                       
);
$response = curl_exec($session);
curl_close($session);

header('Cache-Control: no-cache, must-revalidate');
header('Content-type:text/plain');
header('Content-attributes: text/plain; charset=ISO-8859-15');
header('Access-Control-Allow-Origin: *');

echo $response;
exit();
?>