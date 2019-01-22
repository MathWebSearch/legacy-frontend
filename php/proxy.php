<?php

DEFINE('MWS_MODE', getenv('MWS_MODE') == 'tema' ? 'tema' : 'mws');

include MWS_MODE . '_proxy.php';
?>