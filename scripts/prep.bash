#!/bin/bash

# gets the root directory of the project
root_path="$(dirname $(dirname $(realpath $0)))"

# prep work for the client
cp $root_path/client/.env.production.template $root_path/client/.env.production

# creates self signed SSL certificate
openssl req -newkey rsa:2048 -nodes -keyout $root_path/nginx/my-site.com.key -x509 -days 365 -out nginx/my-site.com.crt < $root_path/scripts/cert-template.txt