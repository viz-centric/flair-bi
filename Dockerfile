FROM openjdk:8-jre-slim
LABEL maintainer Manoj<Manoj.Horcrux@gmail.com>

COPY src/main/resources/ssl/keystore/flairbi-keystore.p12 /var/flairbi-keystore.p12
COPY src/main/resources/ssl/grpc/cloud/ca.crt /var/ca.crt
COPY src/main/resources/ssl/keystore/flairbi-truststore.p12 /var/flairbi-truststore.p12
COPY target/*.war /var/app.war
COPY Docker/button.sh /var/button.sh

RUN chmod +x /var/button.sh

VOLUME [ "/var/images" ]

WORKDIR /var 

EXPOSE 80

CMD [ "/bin/bash", "button.sh" ]