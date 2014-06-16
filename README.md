# img.bi
[img.bi](https://img.bi/) is a secure image hosting. Images are encrypted using AES-256 with random key in browser before upload.

## About this repo
There is only static content. For work you need also [img.bi-api](https://github.com/imgbi/img.bi-api) which will be process POST- and GET- requests.

## Localization
For localization img.bi uses [gettext](https://en.wikipedia.org/wiki/Gettext) format. Language files located in ``src/locales``. You can edit it with your text editor or gettext editor like [Poedit](https://poedit.net/).

If you want to add new language, run ``grunt extract``. It will create file ``src/locales/template.pot`` which you can use as a template for your language file.

Also you need to update ``config.json``. Make sure it's a valid json, you can test it with ``grunt jsonlint``.

## Build

    npm install
    bower install
    grunt
    
## Build dependencies
* [Grunt](http://gruntjs.com)
* [Bower](http://bower.io)
* [NPM](https://npmjs.org)

## Donate
Bitcoin: [1imgbioAKhqeSaAG2SB6Ct79r7UeyGpYP](bitcoin:1imgbioAKhqeSaAG2SB6Ct79r7UeyGpYP)

Litecoin: [LiMgBiGCWR3bYsHXLfZYonLBZpgCVqMAw2](litecoin:LiMgBiGCWR3bYsHXLfZYonLBZpgCVqMAw2)
