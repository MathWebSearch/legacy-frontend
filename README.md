mws-frontend
============
Web frontend for MathWebSearch

Dockerfile
==========

Can be found as the automated build [kwarc/mws-frontend](https://hub.docker.com/r/kwarc/mws-frontend) on DockerHub. Run it as:

    docker run -t -i -p 8081:80 -e MWS_URL="http://mws.url:8080/" -e LATEXML_URL="http://ltxml.url/convert" kwarc/mws-frontend