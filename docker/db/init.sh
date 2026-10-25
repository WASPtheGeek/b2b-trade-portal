#!/bin/sh
# Runs once, on the first start of an empty volume (docker-entrypoint-initdb.d).
# Applies the base schema, then every migration in filename (= date) order.
set -e

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /schema/b2b_ecommerce_schema.sql

for f in /schema/migrations/*.sql; do
    [ -e "$f" ] || continue
    echo "Applying migration $f"
    psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$f"
done
