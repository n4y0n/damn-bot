#!bash
winpty docker run --rm -e TOKEN=$1 -it prons/damn-bot node ./node_modules/nodemon/bin/nodemon.js .
