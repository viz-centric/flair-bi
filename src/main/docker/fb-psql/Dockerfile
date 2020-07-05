FROM postgres:11.8-alpine


## COpy all SSL materials and change owner to postgres:postgres and chmod to 0600
COPY ./ca.pem /etc/pki/tls/certs/ca.pem

RUN chown -R postgres:postgres /etc/pki/tls/certs/ca.pem \
    && chmod 0600 /etc/pki/tls/certs/ca.pem

COPY ./flairbi-psql.key /etc/pki/tls/private/flairbi-psql.key

RUN chown -R postgres:postgres /etc/pki/tls/private/flairbi-psql.key \
    && chmod 0600 /etc/pki/tls/private/flairbi-psql.key


COPY ./flairbi-psql.pem /etc/pki/tls/certs/flairbi-psql.pem

RUN chown -R postgres:postgres /etc/pki/tls/certs/flairbi-psql.pem \
    && chmod 0600 /etc/pki/tls/certs/flairbi-psql.pem


COPY ./postgresql.conf /var/lib/pgsql/9.4/data/postgresql.conf

RUN chown -R postgres:postgres /var/lib/pgsql/9.4/data/postgresql.conf \
    && chmod 0600 /var/lib/pgsql/9.4/data/postgresql.conf
