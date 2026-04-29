#!/bin/bash

# Please create a .credentials file in the home directory with the following content:
# GITHUB_USERNAME=your_github_username
# GITHUB_PASSWORD=your_github_personal_access_token

# Default variables
APP_NAME="angular-starter"

APP_VERSION=$(
  cat package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]'
)

DOCKER_REGISTRY="ghcr.io"
DOCKER_IMAGE_NAME="${DOCKER_REGISTRY}/${GITHUB_USERNAME}/${APP_NAME}"
DOCKER_IMAGE_TAG="latest"

# Functions
docker_login() {
  echo ''
  echo ''
  echo '     ooo,    .---.'
  echo '    o`  o   /    |\________________'
  echo '   o`   `oooo()  | ________   _   _)'
  echo '   `oo   o` \    |/        | | | |'
  echo '     `ooo`   `---`         "-" |_|'
  echo ''
  echo "🗝️  Logging in to GitHub Container Registry\n"

  echo "$GITHUB_PASSWORD" | docker login "$DOCKER_REGISTRY" -u "$GITHUB_USERNAME" --password-stdin || {
    echo "❌ Login failed!"
    exit 1
  }
}

build_image() {
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
  echo "🐳  Building Docker image with tags: ${DOCKER_IMAGE_TAG} & ${APP_VERSION}\n"

  docker build \
    -t "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" \
    -t "${DOCKER_IMAGE_NAME}:${APP_VERSION}" \
    --build-arg BUILD_MODE=${BUILD_MODE} \
    --platform 'linux/amd64' \
    -f Dockerfile . || {
      echo "❌ Build failed!"
      exit 1
    }
}

build_zip() {
  docker build \
    -t ${DOCKER_IMAGE_NAME}:zip \
    --build-arg OUTPUT_NAME=${APP_NAME}@${APP_VERSION}.zip \
    -f .ci/Dockerfile.scratch \
    -o dist . || {
    echo "❌ Build failed"
    exit 1
  }

  echo "🎉 Build done"
}

push_image() {
  echo ''
  echo ''
  echo ''
  echo '          !'
  echo '          ^'
  echo '         / \'
  echo '        /___\'
  echo '       |=   =|'
  echo '       |     |'
  echo '       |     |'
  echo '       |     |'
  echo '       |     |'
  echo '       |     |'
  echo '       |     |'
  echo '      /|##!##|\'
  echo '     / |##!##| \'
  echo '    /  |##!##|  \'
  echo '   |  / ^ | ^ \  |'
  echo '   | /  ( | )  \ |'
  echo '   |/   ( | )   \|'
  echo '       ((   ))'
  echo '      ((  :  ))'
  echo '       ((   ))'
  echo '        (( ))'
  echo '         ( )'
  echo ''
  echo "🚀  Pushing Docker image to GitHub Container Registry\n"

  docker push "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" || {
    echo "❌ Push failed for ${DOCKER_IMAGE_TAG}!"
    exit 1
  }

  docker push "${DOCKER_IMAGE_NAME}:${APP_VERSION}" || {
    echo "❌ Push failed for ${APP_VERSION}!"
    exit 1
  }
}

clean_up() {
  echo "🪠  Clean up docker build shit \n"

  docker rmi "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" || echo "⚠️ Could not remove ${DOCKER_IMAGE_TAG} image"

  docker rmi "${DOCKER_IMAGE_NAME}:${APP_VERSION}" || echo "⚠️ Could not remove ${APP_VERSION} image"
}

deploy() {
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
  echo '                ____'
  echo '           .-"""p 8o""`-.'
  echo '        .-`8888P`Y.`Y[ ` `-.'
  echo '      ,`]88888b.J8oo_      ``.'
  echo '    ,` ,88888888888["        Y`.'
  echo '   /   8888888888P            Y8\'
  echo '  /    Y8888888P`             ]88\'
  echo ' :     `Y88`   P              `888:'
  echo ' :       Y8.oP `- >            Y88:'
  echo ' |          `Yb  __             ``|'
  echo ' :            ``d8888bo.          :'
  echo ' :             d88888888ooo.      ;'
  echo '  \            Y88888888888P     /'
  echo '   \            `Y88888888P     /'
  echo '    `.            d88888P`    ,`'
  echo '      `.          888PP`    ,`'
  echo '        `-.      d8P`    ,-`   '
  echo '           `-.,,_`__,,.-`'
  echo ''
  echo "🚀  Deploying via remote SSH to ${SERVER_IP_ADDRESS}"

  local DEPLOY_PATH=$SERVER_COMPOSE_PATH
  local DEPLOY_STACK="dss"

  ssh -o StrictHostKeyChecking=no -p ${SERVER_PORT} -i ${SERVER_KEY_PATH} ${SERVER_USER_NAME}@${SERVER_IP_ADDRESS} \
    "docker compose -p ${DEPLOY_STACK} -f ${DEPLOY_PATH} pull && \
     docker compose -p ${DEPLOY_STACK} -f ${DEPLOY_PATH} up -d && \
     docker image prune -f && \
     docker restart nginx"

  if [ $? -ne 0 ]
  then
    echo '❌  Deploy failed. Please check the logs for more details.'
    exit 1
  else
    echo "🎉  Successfully deployed, hooray!"
  fi
}

# Main function to orchestrate the process
main() {
  local mode=${1:-docker}

  if [[ $# -gt 1 ]]; then
    echo "❌ Too many arguments. Usage: $0 [mode]"
    exit 1
  fi

  local git_branch=$(git rev-parse --abbrev-ref HEAD)
  case "$git_branch" in
    "staging")
      DOCKER_IMAGE_TAG="staging-v${APP_VERSION}"
      source ~/.isportwear_credentials
      ;;
    "main")
      DOCKER_IMAGE_TAG="latest"
      source ~/.kholink_credentials
      ;;
    *)
  esac

  DOCKER_IMAGE_NAME="${DOCKER_REGISTRY}/${GITHUB_USERNAME}/${APP_NAME}"

  # Validate mode
  case "$mode" in
    docker)
      echo "✅ Running in $mode mode with tag: ${DOCKER_IMAGE_TAG}"
      docker_login
      build_image
      push_image
      clean_up
      # deploy
      echo "🎉  All tasks completed successfully!"
      ;;
    zip)
      echo "✅ Running in $mode mode with tag: ${DOCKER_IMAGE_TAG}"
      build_zip "$mode"
      exit 0
      ;;
    *)
      echo "❌ Invalid mode: $mode. Supported modes: docker, zip"
      exit 1
      ;;
  esac
}

# Run the script with the provided mode
main "$1"
