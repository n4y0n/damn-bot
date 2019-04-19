#!bash

echo Building new image...

winpty docker build -t prons/damn-bot . 

echo Ok

echo Removing old image...

image=$(docker images | grep \<none\> | tr -s [:blank:] , | cut -d ',' -f 3)

docker rmi $image 1>/dev/null 2>&1 \
	&& echo Ok \
	|| echo No old image to remove
