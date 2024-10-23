#!/bin/bash

# Please create a .credentials file in the home directory with the following content:
# SERVER_IP_ADDRESS=your_server_ip_address
# SERVER_PORT=your_server_ssh_port
# SERVER_KEY_PATH=your_server_ssh_key_path
# SERVER_COMPOSE_PATH=your_server_docker_compose_path
source ~/.credentials

echo ''
echo ''
echo '                         .-.'
echo '                        ( ('
echo '                         `-`'
echo ''
echo '                    .   ,- To the Moon!'
echo '                   .`.'
echo '                   |o|'
echo '                  .`o`.'
echo '                  |.-.|'
echo '                  `   `'
echo '                   ( )'
echo '                    )'
echo '                   ( )'
echo ''
echo '               ____'
echo '          .-"""p 8o""`-.'
echo '       .-`8888P`Y.`Y[ ` `-.'
echo '     ,`]88888b.J8oo_      ``.'
echo '   ,` ,88888888888["        Y`.'
echo '  /   8888888888P            Y8\'
echo ' /    Y8888888P`             ]88\'
echo ':     `Y88`   P              `888:'
echo ':       Y8.oP `- >            Y88:'
echo '|          `Yb  __             ``|'
echo ':            ``d8888bo.          :'
echo ':             d88888888ooo.      ;'
echo ' \            Y88888888888P     /'
echo '  \            `Y88888888P     /'
echo '   `.            d88888P`    ,`'
echo '     `.          888PP`    ,`'
echo '       `-.      d8P`    ,-`   '
echo '          `-.,,_`__,,.-`'
echo ''
echo "🚀  Deploying via remote SSH \n"

ssh -p ${SERVER_PORT} -i ${SERVER_KEY_PATH} ${SERVER_IP_ADDRESS} \
  "docker compose -f ${SERVER_COMPOSE_PATH} pull && \
   docker compose -f ${SERVER_COMPOSE_PATH} up -d && \
   docker image prune -f"

if [ $? -ne 0 ]
then
  echo '\n❌  Deploy failed. Please check the logs for more details.'
  exit 1
else
  echo "\n🎉  Successfully deployed, hooray!"
fi