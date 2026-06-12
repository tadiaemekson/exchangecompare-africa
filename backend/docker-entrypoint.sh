#!/bin/sh
set -e

# Set the port dynamically for Nginx
PORT=${PORT:-80}
echo "Configuring Nginx to listen on port $PORT"
sed -i "s/LISTEN_PORT/${PORT}/g" /etc/nginx/nginx.conf

# Execute the CMD passed to the docker container
exec "$@"
