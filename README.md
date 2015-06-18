# new install
For first install on new, see INSTALL.md

# to update
After cloning get repo (check branch), go to ./bin and run $ ./update
This will make sure npm and bower will update/install their packages.

# seeding data
If you want to reset and seed the redis database with user/bracelet info, go to ./python and run $ python seed.py

# to start
Go to ./bin and run $ ./start to start the python daemons and the node application through pm2.
The application will be available on localhost:3000

# to stop
Go to ./bin and run $ ./stop to stop the python daemons and the node application through pm2.


Do not edit anything in either node_modules or public/bower_components, these will be overwritten automagically.
