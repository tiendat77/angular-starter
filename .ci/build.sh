#!/bin/bash

# Please create a .credentials file in the home directory with the following content:
# GITHUB_USERNAME=your_github_username
# GITHUB_PASSWORD=your_github_personal_access_token
source ~/.credentials

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
  echo -e "🗝️  Logging in to GitHub Container Registry\n"

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
  echo -e "🐳  Building Docker image with tags: ${DOCKER_IMAGE_TAG} & ${APP_VERSION}\n"

  docker build \
    -t "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" \
    -t "${DOCKER_IMAGE_NAME}:${APP_VERSION}" \
    --platform 'linux/amd64' \
    -f Dockerfile . || {
      echo "❌ Build failed!"
      exit 1
    }
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
  echo -e "🚀  Pushing Docker image to GitHub Container Registry\n"

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
  echo -e "🪠  Clean up docker build artifacts\n"

  docker rmi "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" || echo "⚠️ Could not remove ${DOCKER_IMAGE_TAG} image"
  docker rmi "${DOCKER_IMAGE_NAME}:${APP_VERSION}" || echo "⚠️ Could not remove ${APP_VERSION} image"
}

# Main function to orchestrate the process
main() {
  echo "✅ Building and pushing Docker image with tags: ${DOCKER_IMAGE_TAG} & ${APP_VERSION}"
  docker_login
  build_image
  push_image
  clean_up
  echo "🎉  All tasks completed successfully!"
}

# Run the script
main
