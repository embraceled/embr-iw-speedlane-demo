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

sudo apt-get install -y x11-xserver-utils

# install bower
sudo npm install -g bower

# install pm2
sudo npm install -g pm2 --unsafe-perm



# fetch git repo in home
git clone git@bitbucket.org:wecothi/embr-iw-speedlane-demo.git

cd embr-iw-speedlane-demo

# to install
# cp init scripts to /etc/init.d + chmod +x
sudo cp init/sl-daemon /etc/init.d

# add sl-daemon to startup
sudo update-rc.d sl-daemon defaults


cd node
npm install
bower install

# create pm2 list and daemon
pm2 start app.js
sudo pm2 startup


sudo vi /etc/xdg/lxsession/LXDE/autostart

@xset s off
@xset -dpms
@xset s noblank
@epiphany http://localhost:3000
