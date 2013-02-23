<?php
if (isset($_GET["formula-url"])) {
$ch = curl_init($_GET["formula-url"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
//curl_setopt($ch, CURLOPT_POST, true);
//curl_setopt($ch, CURLOPT_POSTFIELDS, '<mws:query xmlns:m="http://www.w3.org/1998/Math/MathML" xmlns:mws="http://www.mathweb.org/mws/ns" limitmin="0" answsize="30"><mws:expr><mws:qvar>x</mws:qvar></mws:expr></mws:query>');
header('Content-Type: text/xml');
}
else {
$ch = curl_init("http://arxivdemo.mathweb.org/convert.php");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, array('mathml' => '<math xmlns="http://www.w3.org/1998/Math/MathML"><ci>HELLO</ci></math>', 'notex' => '\cos\pi', 'profile' => 'math'));
}
$result = curl_exec($ch);
curl_close($ch);
header('Access-Control-Allow-Origin: *');
print($result);
?>
