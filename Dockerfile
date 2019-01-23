# The frontend needs php for the configuration
FROM kwarc/apache-php

# Add all the files
ADD css /var/www/html/css
ADD img /var/www/html/img
ADD js /var/www/html/js
ADD libs /var/www/html/libs
ADD php /var/www/html/php
ADD index.html /var/www/html/index.html
ADD main.css /var/www/html/main.css

# Environment variables
ENV MWS_MODE "mws"
ENV MWS_URL "http://mws:8080/"
ENV TEMA_URL "http://tema:8080/"
ENV LATEXML_URL "http://latexml:8080/convert"
