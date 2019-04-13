#!bash
winpty docker run --rm -e DELAY=1 -e TOKEN=$1 -v /app/node_modules -v //d/User/Desktop/Damn\ you\ delli:/app -it prons/damn-bot
