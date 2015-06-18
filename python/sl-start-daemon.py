#!/usr/bin/python
###############################################################################
#
# Embraceled iceworld speedlane start daemon
#
# Collect starters
#
# Author:  Ralf Ekkelenkamp <ralf@embraceled.com>
# Date:    2015-06-18
# Version: 0.0.1
#
###############################################################################

import logging
import logging.handlers
import time
import json
import redis
import os
import serial

from daemon import runner
from lockfile import LockTimeout
from serial.serialutil import SerialException

# Setup Redis connection pool
POOL = redis.ConnectionPool(host='127.0.0.1', port=6379, db=0)

# Setup proper logging
LOG_FILENAME = '/var/log/embr-sl-start-daemon.log'

logger = logging.getLogger('EbmrSensorLogger')
logger.setLevel(logging.INFO)

# create formatter
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

# Add the log message handler to the logger
handler = logging.handlers.RotatingFileHandler(
    LOG_FILENAME,
    maxBytes = 52428800, # 50MB max per file
    backupCount = 20 # 20 backups
)

# add formatter to logger
handler.setFormatter(formatter)

# add handler to logger
logger.addHandler(handler)

class EmbrSlStart():
    # Init
    def __init__(self, **redis_kwargs):
        self.stdin_path = '/dev/null'
        self.stdout_path = '/dev/tty' # '/var/log/embr-sl-start-daemon-out.log'
        self.stderr_path = '/dev/tty' # '/var/log/embr-sl-start-daemon-err.log'
        self.pidfile_path =  '/tmp/sensorStartDeamon.pid'
        self.pidfile_timeout = 5

        #timers
        self.time = 1 # time in second
        self.sampleTime = 0.005 # sample time in seconds
        self.idResponseTime = 0.1 # sample time in seconds
        self.cycles = self.time/self.sampleTime  -1 # number of cycles wait

        # keys
        self.redisKey = 'embr:sl:start'

        # app ident
        self.version = 'Rasberry Pi, Raspbian Embraceled Mod, v1.0.0' # TODO fetch this from image

        self.ser = ''
        self.read_chars = ''


    def run(self):
        self.setSerial(0)
        #self.fireItUp(0)
        logger.info('Starting Iceworld start daemon')


    def setSerial(self, it):
        #get serial port 100% on ttyACM0 on clean boot but to help with debugging:
        try:
            tty = '/dev/ttyACM' + str(it)
            self.ser = serial.Serial(tty,timeout=1)
        except serial.serialutil.SerialException:
            logger.info('retry with it: %s', str(it))
            time.sleep(1)
            it = it+1
            if it >= 10:
                it = 0
            self.setSerial(it)
        else:
            self.fireItUp(it)


    def fireItUp(self,it):
        #get ident to set mode
        self.ser.write('i')
        time.sleep(self.idResponseTime)
        self.read_chars = ''
        method = ''
        if self.ser.inWaiting() > 0:
            self.read_chars = self.ser.read(self.ser.inWaiting())
            if len(self.read_chars)==30:
                if self.read_chars[21:25]=='FF01':
                    self.runStart()
                    time.sleep(1)
                else:
                    time.sleep(1)
                    it = it+1
                    if it >= 10:
                        it = 0
                    self.setSerial(it)



    # handle IOError
    def handleUSBDisconnect(self):
        self.setSerial(0)
        self.fireItUp()


    def runStart(self):
        # if like bracelet is being used
        logger.info('Starting')
        # initial values for duplicate like check
        hex_old = 'o'
        ts_old = time.time()

        while True:
            try:
                time.sleep(self.sampleTime)
                # read loop
                if self.ser.inWaiting() != 0:
                    self.read_chars = self.ser.read(self.ser.inWaiting())

                    #check if valid and then get message.
                    if self.read_chars[0]=='\x25':
                        ts = "%.0f" % time.time()
                        hex = ''
                        for aChar in range(1,5,1):
                            a1 = "%02X" % ord(self.read_chars[aChar])
                            hex = hex + a1

                        # only allow same hex once every 5 seconds
                        if hex != hex_old or round(time.time() - ts_old) > 5:
                            try:
                                r = redis.Redis(connection_pool=POOL)
                                r.publish(self.redisKey,json.dumps({'braceletId':hex,'ts':ts}))
                                hex_old = hex
                                ts_old = time.time()
                            except redis.ConnectionError:
                                logger.error('Pushing to list for %s failed, redis connection error', __name__)
            except IOError:
                self.handleUSBDisconnect()


# fire up daemon
try:
    app = EmbrSlStart()
    daemon_runner = runner.DaemonRunner(app)
    daemon_runner.daemon_context.files_preserve=[handler.stream]
    daemon_runner.do_action()
except LockTimeout:
    print "Daemon is already running"
    exit(0)
