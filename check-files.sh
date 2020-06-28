#!/bin/sh

MUST_NOT_CHANGE=$(find src/main/resources/config/liquibase \( -name "*csv" -o -name "*xml" ! -name "master.xml" \))


# Redirect output to stderr.
exec 1>&2

# go through all of the files.
for OUTPUT in $MUST_NOT_CHANGE
do
    if ! git diff staging --cached --exit-code $OUTPUT; then
        echo "has been changed $OUTPUT"
        echo "Cannot commit because forbidden files have been changed"
        exit 1
    fi
done

exit 0
