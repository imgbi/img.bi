#!/bin/sh

#Move to the folder where img.bi is installed
cd `dirname $0`

#Was this script started in the bin folder? if yes move out
if [ -d "../bin" ]; then
  cd "../"
fi

ignoreRoot=0
for ARG in $*
do
  if [ "$ARG" = "--root" ]; then
    ignoreRoot=1
  fi
done

#Stop the script if its started as root
if [ "$(id -u)" -eq 0 ] && [ $ignoreRoot -eq 0 ]; then
   echo "You shouldn't start img.bi as root!"
   echo "Please type 'img.bi rocks my socks' or supply the '--root' argument if you still want to start it as root"
   read rocks
   if [ ! "$rocks" == "img.bi rocks my socks" ]
   then
     echo "Your input was incorrect"
     exit 1
   fi
fi

#start redis server
#Note: enable this if your redis server is not already running!
#redis-server /path/to/my/redis.conf

#start img.bi
echo "Started img.bi..."

./cli.js $@
