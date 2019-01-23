mws-frontend
============
Web frontend for MathWebSearch


Frontend Dockerfile
===================

This repository contains a Dockerfile for the frontend container. This can be found as the automated build [kwarc/mws-frontend](https://hub.docker.com/r/mathwebsearch/frontend) on DockerHub. 
Run it as:

    docker run -t -i -p 8081:80 -e MWS_URL="http://mws.url:8080/" -e LATEXML_URL="http://ltxml.url/convert" mathwebsearch/frontend

As can be seen from the example above, the Dockerfile takes several environment variables. In particular it takes the following values:

- `LATEXML_URL` The conainter-reachable URL to the LaTeXML backend that parses math queries. 
- `MWS_MODE` The mode to run the frontend in. Should be either 'tema' (to run in tema-search mode) or 'mws' (to run in mws-search mode). 
- `MWS_URL` The container-reachable URL to the MWS backend. Only relevant if running in mws mode. 
- `TEMA_URL` The container-reachable URL to the TEMA backend. Only relevant if running in tema mode. 
