[img.bi](https://img.bi/) is a secure image hosting. Images are encrypted using AES-256 with random key in browser before upload.

## Description

**imgbi-server** is a tool to build and host img.bi instance. I can be used alone, although it's recommended to use it with some webserver like nginx.

## Installation

You can get imgbi-server from npm

    npm install -g img.bi-server

See `--help` for usage info.

## Configuration

Edit [`config.json`](./config.json) and change your Redis settings.
Also set `hashids` to a random string as it is used as a Salt. You can e.g. use this command to generate a random one:

    cat /dev/urandom | tr -dc [:alnum:] | head -c45; echo

Remember to make `uploadDir` and `staticContent` writable by the user who is running img.bi.

## Donate

Bitcoin: [1imgbioAKhqeSaAG2SB6Ct79r7UeyGpYP](bitcoin:1imgbioAKhqeSaAG2SB6Ct79r7UeyGpYP)

Litecoin: [LiMgBiGCWR3bYsHXLfZYonLBZpgCVqMAw2](litecoin:LiMgBiGCWR3bYsHXLfZYonLBZpgCVqMAw2)

Dogecoin: [DGimgbiEpUJREs2zgFEY8xux3oF85JpkWY](dogecoin:DGimgbiEpUJREs2zgFEY8xux3oF85JpkWY)
