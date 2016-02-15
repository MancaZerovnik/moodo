# modoo

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.11.1.

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.

## Deploy

### Deploy on our own server

When deploying first time install sshpass:

`apt-get install sshpass`

Run script for deploy:

`./deploy.sh *username* *password*`

### Deploy on any other server

Run build:

`grunt build`

Then copy content form *dist* directory to your server