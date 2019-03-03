FROM openjdk:8

# alpine version of openjdk wont work because GRPC under TLS cannot work on minified version of glibc library

ENV SPRING_OUTPUT_ANSI_ENABLED=ALWAYS \
    JAVA_OPTS="" \
    JHIPSTER_SLEEP=0

VOLUME /tmp
EXPOSE 80

CMD echo "The application will start in ${JHIPSTER_SLEEP}s..." && \
    sleep ${JHIPSTER_SLEEP} && \
    java ${JAVA_OPTS} -Djava.security.egd=file:/dev/./urandom -jar app.war


ADD ssl/keystore/flairbi-keystore.p12 /keystore.p12
ADD ssl/keystore/flairbi-truststore.p12 /truststore.p12
ADD ssl/cert/ca/ca.pem /ca.crt

# add directly the war
ADD *.war /app.war
