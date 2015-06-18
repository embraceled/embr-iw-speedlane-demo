# Setup pi
raspi-config
# set storage, CLI mode, local en_US.UTF-8

# upgrade
sudo apt-get update && sudo apt-get upgrade

# vim
sudo apt-get install -y vim

# redis
sudo apt-get install -y redis-server

# python libs
sudo apt-get install python-daemon
sudo apt-get install python-redis
sudo apt-get install python-netifaces
sudo apt-get install python-requests

# install node/npm
apt-get install -y curl git
curl -sL https://deb.nodesource.com/setup | sudo bash -
apt-get install -y nodejs
apt-get install -y build-essential

# install pm2
sudo npm install -g pm2 --unsafe-perm

