FROM couchdb

## Copy all SSL materials and change owner to couchdb:couchdb and chmod to 0600
RUN mkdir /etc/pki \
    && mkdir /etc/pki/tls \
    && mkdir /etc/pki/tls/certs \
    && mkdir /etc/pki/tls/private

COPY ./ca.pem /etc/pki/tls/certs/ca.pem

RUN chown -R couchdb:couchdb /etc/pki/tls/certs/ca.pem \
    && chmod 0600 /etc/pki/tls/certs/ca.pem

COPY ./flairbi-couchdb.key /etc/pki/tls/private/flairbi-couchdb.key

RUN chown -R couchdb:couchdb /etc/pki/tls/private/flairbi-couchdb.key \
    && chmod 0600 /etc/pki/tls/private/flairbi-couchdb.key

COPY ./flairbi-couchdb.pem /etc/pki/tls/certs/flairbi-couchdb.pem

RUN chown -R couchdb:couchdb /etc/pki/tls/certs/flairbi-couchdb.pem \
    && chmod 0600 /etc/pki/tls/certs/flairbi-couchdb.pem


COPY ./local.ini /opt/couchdb/etc/local.ini

RUN chown -R couchdb:couchdb /opt/couchdb/etc/local.ini \
    && chmod 0600 /opt/couchdb/etc/local.ini
