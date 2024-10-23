#!/bin/sh

DOCKER_IMAGE_NAME="angular-starter"

APP_NAME=$(
  cat package.json \
    | grep name \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]'
)

APP_VERSION=$(
  cat package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]'
)

# Build and push image

echo ''
echo ''
echo ''
echo '                 ##         .'
echo '           ## ## ##        =='
echo '        ## ## ## ## ##    ==='
echo '    /"""""""""""""""""\___/ ==='
echo '   {                       /  ===-'
echo '    \______ O           __/'
echo '      \    \         __/'
echo '       \____\_______/'
echo ''
echo "🐳  Build zip file ${APP_NAME}@${APP_VERSION}.zip"

docker build \
  -t ${DOCKER_IMAGE_NAME}:zip \
  --build-arg OUTPUT_NAME=${APP_NAME}@${APP_VERSION}.zip \
  -f .ci/Dockerfile.scratch \
  -o dist .

if [ $? -ne 0 ]
then
  echo '\n❌  Build failed. Please check the logs for more details.'
  exit 1
else
  echo "\n🎉  Successfully built, hooray!"
fi