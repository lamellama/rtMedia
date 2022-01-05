#!/usr/bin/env bash

set -ex

######################################################
######################## VARS ########################
SITE_NAME='automation.rtmedia.me'
SITE_ROOT="/var/www/$SITE_NAME/htdocs"
SITE_URL="http://$SITE_NAME/"

function ee() { wo "$@"; }
#####################################################

#!/bin/sh

# # PATH TO YOUR HOSTS FILE
# ETC_HOSTS=/etc/hosts

#   #sed -i '/^127.0.0.1/ s/$/ automation.rtmedia.me/' /etc/hosts
#   echo "$(sed 's/127.0.0.11/8.8.8.8/g' /etc/hosts)" > /etc/hosts

# Start required services for site creation
function start_services() {
    echo "Starting services"
    git config --global user.email "nobody@example.com"
    git config --global user.name "nobody"
    rm /etc/nginx/conf.d/stub_status.conf /etc/nginx/sites-available/22222 /etc/nginx/sites-enabled/22222
    rm -rf /var/www/22222
    ee stack start --nginx --mysql --php74
    ee stack status --nginx --mysql --php74
}

# Remove cache plugins
function remove_cache_plugins () {
    rm -rf "$GITHUB_WORKSPACE/plugins/wp-redis"
    rm -rf "$GITHUB_WORKSPACE/base/plugins/wp-redis"
}

# Create, setup and populate rtmedia base site
function create_and_configure_base_site () {
    ee site create $SITE_NAME --wp --php74
    cd $SITE_ROOT
    rsync -azh $GITHUB_WORKSPACE/ $SITE_ROOT/wp-content/
    echo "127.0.0.1 $SITE_NAME" >> /etc/hosts
    wp user create admin admin@example.com --role=administrator --user_pass=admin --allow-root
    wp plugin install buddypress --allow-root
    wp plugin activate buddypress --allow-root
    wp plugin install buddypress-media --allow-root
    wp plugin activate buddypress-media --allow-root
    cd $GITHUB_WORKSPACE/
}

function setup_composers(){
    echo "before install"
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    php -r "if (hash_file('sha384', 'composer-setup.php') === '906a84df04cea2aa72f40b5f787e49f22d4c2f19492ac310e8cba5b96ac8b64115ac402c8cd292b8a03482574915d1a8') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
    php composer-setup.php
    php -r "unlink('composer-setup.php');"
    mv composer.phar /usr/local/bin/composer
    composer --version
}

# Install codeception dependancy 
function install_codeception_package () {
    cd $GITHUB_WORKSPACE/tests/codeception
    composer install | composer update
}

# # Run chrome driver 
# function runChromeDriver () {
#     cd $GITHUB_WORKSPACE/.github/ci
#     #unzip chromedriver_linux64.zip
#     #chmod +x chromedriver
#     #./chromedriver
#     # unzip BrowserStackLocal-linux-x64.zip 
#     # chmod +x BrowserStackLocal
#     #./BrowserStackLocal --key 5aD5jpbRfo9RFnrbPGYE --only-automate	
#     #nohup ./BrowserStackLocal --key 5aD5jpbRfo9RFnrbPGYE --local-identifier A_UNIQUE_IDENTIFIER_STRING --enable-logging-for-api
#     # nohup ./BrowserStackLocal --key 5aD5jpbRfo9RFnrbPGYE --local-identifier A_UNIQUE_IDENTIFIER_STRING --enable-logging-for-api


# }


# Run test for new deployed site
function run_codeception_tests () {
    cd $GITHUB_WORKSPACE/tests/codeception
    composer require --dev codeception/module-webdriver:^1.0
    composer require codeception/module-phpbrowser:^2.0 
    #nohup $Browser/chromedriver --url-base=/wd/hub /dev/null 2>&1 &
    php vendor/bin/codecept run 
}

function main() {
    start_services
    remove_cache_plugins
    create_and_configure_base_site
    setup_composers
    install_codeception_package
    run_codeception_tests
}

main