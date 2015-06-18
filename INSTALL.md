# Setup pi
sudo raspi-config
# set storage, CLI mode, timezon, local en_US.UTF-8

# upgrade
sudo apt-get update -y && sudo apt-get upgrade

# vim
sudo apt-get install -y vim

# redis
sudo apt-get install -y redis-server

# python libs
sudo apt-get install -y python-daemon
sudo apt-get install -y python-redis

# install node/npm
sudo apt-get install -y curl git
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential

# install bower
sudo npm install -g bower

# install pm2
sudo npm install -g pm2 --unsafe-perm



# fetch git repo in home

# cd embr-iw-speedlane-demo

# to install
# cp init scripts to /etc/init.d + chmod +x

# cd node
# npm install
# bower install
