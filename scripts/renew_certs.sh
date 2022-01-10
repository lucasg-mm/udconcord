#!/bin/bash

# This is a script to renew the SSL certificates in the project.
# You can run this manually each year (365 days),
# or set it up as a cron job.

# gets the root directory of the project
root_path="$(dirname $(dirname $(realpath $0)))"

# stops containers
/usr/local/bin/docker-compose -f $root_path/docker-compose.yml down

# renews proxy certificate
openssl req -newkey rsa:2048 -nodes -keyout $root_path/nginx/my-site.com.key -x509 -days 365 -out $root_path/nginx/my-site.com.crt < $root_path/scripts/cert-template.txt

# starts containers again
/usr/local/bin/docker-compose -f $root_path/docker-compose.yml up
