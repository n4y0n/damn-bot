#!bash

TOKEN="Unknown"

while IFS='' read -r line || [[ -n "$line" ]]; do
	if [[ ${line:0:5} = TOKEN ]] ; then
		TOKEN=$(echo $line | sed "s/TOKEN=//")
	else
		if [[ $TOKEN = "Unknown" ]] ; then
			TOKEN=$1
		fi
	fi
done < "./.env"

winpty docker run --rm -e TOKEN=$TOKEN -it prons/damn-bot node ./src/bot/node_modules/nodemon/bin/nodemon.js .
