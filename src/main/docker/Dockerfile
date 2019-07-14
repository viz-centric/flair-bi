FROM openjdk:12

# alpine version of openjdk wont work because GRPC under TLS cannot work on minified version of glibc library

LABEL maintainer="admin@vizcentric.com"
LABEL name="Vizcentric"

RUN groupadd -g 999 flairuser && \
    useradd --shell /bin/bash --create-home --home /home/flairuser -r -u 999 -g flairuser flairuser
WORKDIR /app

ENV SPRING_OUTPUT_ANSI_ENABLED=ALWAYS \
    JAVA_OPTS="" \
    JHIPSTER_SLEEP=0

EXPOSE 80

COPY classes/config/ssl/ssl-oss.properties /app/ssl.properties
COPY ssl/keystore/flairbi-keystore.p12 /app/keystore.p12
COPY ssl/keystore/flairbi-truststore.p12 /app/truststore.p12
COPY ssl/cert/ca/ca.pem /app/ca.crt
COPY ssl/certsgen/client.crt /app/clientCertChainFile.crt
COPY ssl/certsgen/client.pem /app/clientPrivateKeyFile.pem
COPY ssl/certsgen/ca.crt /app/trustCertCollectionFile.crt
COPY ssl/notificationscertsgen/client.crt /app/notificationsClientCertChainFile.crt
COPY ssl/notificationscertsgen/client.pem /app/notificationsClientPrivateKeyFile.pem
COPY ssl/notificationscertsgen/ca.crt /app/notificationsTrustCertCollectionFile.crt

COPY *.war /app/app.war

RUN chown -R flairuser:flairuser /app
RUN chmod -R 755 /app

USER flairuser

CMD echo "The application will start in ${JHIPSTER_SLEEP}s..." && \
    sleep ${JHIPSTER_SLEEP} && \
    java ${JAVA_OPTS} -Djava.security.egd=file:/dev/./urandom -jar /app/app.war
