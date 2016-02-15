#!/bin/bash

grunt build 
sshpass -p $2 scp -r dist/* $1@212.235.189.228:/var/www/moodo/