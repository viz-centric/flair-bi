FROM openjdk:8

# alpine version of openjdk wont work because GRPC under TLS cannot work on minified version of glibc library

LABEL maintainer="admin@vizcentric.com"
LABEL name="Vizcentric"

RUN groupadd -g 999 flairuser && \
    useradd -r -u 999 -g flairuser flairuser
USER flairuser
WORKDIR /usr/local/bin/flairuser

ENV SPRING_OUTPUT_ANSI_ENABLED=ALWAYS \
    JAVA_OPTS="" \
    JHIPSTER_SLEEP=0

VOLUME /tmp
EXPOSE 80

COPY ssl/keystore/flairbi-keystore.p12 /keystore.p12
COPY ssl/keystore/flairbi-truststore.p12 /truststore.p12
COPY ssl/cert/ca/ca.pem /ca.crt

COPY *.war /app.war

CMD echo "The application will start in ${JHIPSTER_SLEEP}s..." && \
    sleep ${JHIPSTER_SLEEP} && \
    java ${JAVA_OPTS} -Djava.security.egd=file:/dev/./urandom -jar app.war
