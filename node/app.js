////////////////////////////////////////////////////////////////////////////////
//
// Embraceled Iceworld speedlane demo
// Express/jade/socket.io/redis
//
////////////////////////////////////////////////////////////////////////////////

var express    = require('express');
var app        = express();
var http       = require('http').Server(app);
var io         = require('socket.io')(http);
var redis      = require('redis');
var logger     = require('morgan');
var path       = require('path');
var config     = require('config');
var favicon    = require('serve-favicon');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var md5        = require('MD5');
var Stopwatch  = require('timer-stopwatch');

process.env.PORT = config.port || process.env.PORT;

////////////////////////////////////////////////////////////////////////////////
//
// REDIS
//
////////////////////////////////////////////////////////////////////////////////

var redisUserList   = 'embr:sl:users';
var redisScoreList  = 'embr:sl:scores';
var redisFinishedList = 'embr:sl:finished';

// General purpose redis client
var redisClient = redis.createClient(
    config.redis.port,
    config.redis.server
);
if (parseInt(config.redis.db) > 0) {
    redisClient.select(parseInt(config.redis.db), function(err) {
        console.log('Redis could not set db:' + err);
    });
}
redisClient.on('error', function(err) {
    console.log('Redis error:' + err);
});
redisClient.on('ready', function() {
    console.log('Redis ready');
});

// Redis client for sub
var redisSubClient = redis.createClient(
    config.redis.port,
    config.redis.server
);
if (parseInt(config.redis.db) > 0) {
    redisSubClient.select(parseInt(config.redis.db), function(err) {
        console.log('Redis Sub could not set db:' + err);
    });
}
redisSubClient.on('error', function(err) {
    console.log('Redis Sub error:' + err);
});
redisSubClient.on('ready', function() {
    console.log('Redis Sub ready');
});



////////////////////////////////////////////////////////////////////////////////
//
// EXPRESS
//
////////////////////////////////////////////////////////////////////////////////

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
if (process.env.NODE_ENV != 'production') {
    app.use(logger('dev'));
}
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.locals.moment = require('moment');

////////////////////////////////////////////////////////////////////////////////
//
// ROUTES
//
////////////////////////////////////////////////////////////////////////////////

app.get('/', function(req, res) {
  getScoreList(function(rs) {
    res.render('index', {
      title : 'Iceworld scores',
      scores : rs
    });
  })
});


// default route 404
app.use(function(req, res) {
  res.status(404).end('Nope');
});




////////////////////////////////////////////////////////////////////////////////
//
// SOCKET.IO REDIS FOO
//
////////////////////////////////////////////////////////////////////////////////
io.on('connection', function(socket) {

  console.log('client connected');

  // socket connect here
  socket.on('connected', function(data) {
    console.log('Connected: ' + data);
  });

  // socket.on('start', function(data) {
  //   startRace(data);
  // });

  socket.on('reset-scores', function() {
    resetScores();
  });

  socket.on('upsert-user', function(data) {
    upsertUser(data);
  });

  socket.on('disconnect', function() {
    // remove socket from rooms
    console.log('client disconnected');
  });
});





////////////////////////////////////////////////////////////////////////////////
//
// RACE FOO, should not be in app.. demo heuh
//
////////////////////////////////////////////////////////////////////////////////

var currentBracelet = false;
var raceStarted = false;
var raceInfo; // current user info

// seeded users in static redis db
var users = {};

// keep track of finished messages here, take average time
var raceFinishedMessages = [];


var getUsers =  function() {
  redisClient.get(redisUserList, function(err, rs) {
    if (err) {
      console.log(err);
      res.send(500);
    }

    users = JSON.parse(rs) || {};
    // console.log(users);
  });
};

// clear all scores
var resetScores = function()
{
  redisClient.del(redisScoreList, function(err, rs) {
    if (err) {
      console.log(err);
      return;
    }

    // update scores on clients
    io.emit('update-scores', []);
  });
};

// get current score list (last 10)
var getScoreList = function(cb) {
  // get redis list of current scores
  // redisClient.zrange(redisScoreList, 0, 10, 'withscores', function(err, rs) {
  redisClient.zrange(redisScoreList, 0, 10, function(err, rs) {
    if (err) {
      console.log(err);
      return;
    }

    rs = rs || [];

    // it returns an array with strings.
    // convert to json objects
    for (var a in rs) {
      rs[a] = JSON.parse(rs[a]);
    }

    // console.log(rs);

    cb(rs);
  });
};




// pre race countdown timer
var countDownTimer = new Stopwatch(3400, {
  refreshRateMS: 100,
  almostDoneMS: 800
});

// race timer
var raceTimer = new Stopwatch(null, {
  refreshRateMS: 100
});
// max time, will countdown to max allowed time (40 seconds, warning at end-5)
var outOfTimeTimer = new Stopwatch(40000, {
  refreshRateMS: 100,
  almostDoneMS: 5000
});

// convert ms to sec with fixedSize
var msToSec = function(ms, fixedSize)
{
  var seconds = ms / 1000;
  if ( ! fixedSize) {
    return seconds | 0; // Math.floor(ms / 1000);
  } else {
    return seconds.toFixed(fixedSize);
  }
}

var serializeArrayToObj = function(ser)
{
  var o = {};
  ser.forEach(function(item) {
    // strip input, - to _
    item.name = item.name.replace(/input-/g, '').replace(/-/g, '_');

    if (o[item.name] !== undefined) {
      if (!o[item.name].push) {
        o[item.name] = [o[item.name]];
      }
      o[item.name].push(item.value || '');
    } else {
      o[item.name] = item.value || '';
    }
  });
  return o;
};


// Start race when countdown timer is done
countDownTimer.on('time', function() {
  // console.log('countdown tick', countDownTimer.ms, msToSec(countDownTimer.ms));

  // only emit countdown time in client when race has not been started yet
  // and currentBracelet has a value
  if ( ! raceStarted && currentBracelet) {
    io.emit('countdown-tick', msToSec(countDownTimer.ms));
  }
});

// Start race when countdown timer is done
// countDownTimer.on('done', function() {
countDownTimer.on('almostdone', function() {
  console.log('countdown complete, starting race');
  startRace();
});

// tick every 100ms
raceTimer.on('time', function() {
  // console.log('raceTimer tick', raceTimer.ms, msToSec(raceTimer.ms, 1));

  // only emit when race has been started
  if (raceStarted && currentBracelet) {
    io.emit('race-tick', msToSec(raceTimer.ms, 1));
  }
});

// Almost out of time
outOfTimeTimer.on('almostdone', function() {
  console.log('Almost out of time', outOfTimeTimer.ms);

  // notify frontend, almost out of time
  io.emit('almost-out-of-time', 1);
});

// Out of time
outOfTimeTimer.on('done', function(){
  console.log('Out of time', outOfTimeTimer.ms);

  // notify frontend, almost out of time
  io.emit('out-of-time', 1);

  // reset
  resetRace();
});


// redis start message
var handleStartMessage = function(message)
{
  if (currentBracelet) {
    console.log('Other bracelet is currently racing: ' + currentBracelet);
    return;
  }

  // set current user
  raceInfo = users[message.braceletId];
  console.log(raceInfo);

  if (typeof(raceInfo) == 'undefined') {
    return;
  }

  // set state to message.braceletId
  currentBracelet = message.braceletId;

  console.log('start message:');
  console.log(message);
  console.log(message.braceletId);


  // show user in app
  io.emit('start', raceInfo);

  // reset timers
  resetTimers();

  // start count down timer
  countDownTimer.start();
};

var resetRace = function()
{
  // kill bracelet mode
  redisClient.publish(redisFinishedList, 'KILL');

  currentBracelet = null;
  raceStarted = false;
  resetTimers();
};

// rest all timers here
var resetTimers = function()
{
  countDownTimer.reset();
  raceTimer.reset();
  outOfTimeTimer.reset();
};

// started when countdown is done
var startRace = function()
{
  // start timer
  console.log('start race');

  raceStarted = true;
  raceTimer.start();
  outOfTimeTimer.start();
};


var handleFinishMessage = function(message)
{
  if ( ! raceStarted || message.braceletId != currentBracelet) {
    console.log('Ignoring finish message from: ' + message.braceletId + ' current active: ' + currentBracelet);
    return;
  }

  console.log('finish message:');

  console.log(message);

  // for now just call finishRace.. here we should use a finish timer to check max time between finish message and get the average ms as time/score

  // set finish time out
  // reset if running

  // move to timeout script
  finishRace();
};

// called after x amount of finish messages
var finishRace = function()
{
  // stop timers here
  raceTimer.stop();
  outOfTimeTimer.stop();

  // calculate score from multiple entries here
  console.log('time: ', raceTimer.ms);
  var finalTime = msToSec(raceTimer.ms, 2);
  console.log('final time: ', finalTime);

  // reset finished messages
  raceFinishedMessages = [];

  var score = {
    'user' : raceInfo,
    'time' : finalTime
  };

  // add final score to db
  redisClient.zadd(redisScoreList, finalTime, JSON.stringify(score), function(err, rs) {
    if (err) {
      console.log(err);
      res.send(500);
    }

    // promises anyone...
    // notify frontend with new score list
    console.log('finish adding user');
    getScoreList((function(rs) {io.emit('finish', rs)}));
  });

  // show final score to user
  io.emit('finish-time', finalTime);

  // unset current bracelet
  resetRace();
};

var handleSignupMessage = function(message)
{
  if (typeof(message.braceletId) == 'undefined') {
    console.log('');
    return;
  }

  // do lookup by bracelet and fill data array
  var data = {};
  data.braceletId = message.braceletId;
  data.user = users[message.braceletId] || {};

  // emit new-signup message with bracelet and possible user info
  io.emit('new-signup', data);
};

var upsertUser = function(data)
{
  // convert to proper json obj
  data = serializeArrayToObj(data);

  // check if user exists
  var user = users[data.bracelet] || {};

  user.first_name = data.first_name;
  user.last_name = data.last_name;
  user.full_name = data.first_name + ' ' + data.last_name;
  user.gender = data.gender;

  users[data.bracelet] = user;

  // update users in redis
  redisClient.set(redisUserList, JSON.stringify(users));
};

// load user list db woot
getUsers();



////////////////////////////////////////////////////////////////////////////////
//
// REDIS SUBSCRIBE HANDLERS
//
////////////////////////////////////////////////////////////////////////////////

redisSubClient.on("message", function(channel, message) {
  message = JSON.parse(message);

  switch (channel) {
    case 'embr:sl:start':
      handleStartMessage(message);
      break
    case 'embr:sl:finish':
      handleFinishMessage(message);
      break
    case 'embr:sl:signup':
      handleSignupMessage(message);
    default:
      break;
  }
});

// subscribe
redisSubClient.subscribe('embr:sl:start');
redisSubClient.subscribe('embr:sl:finish');
redisSubClient.subscribe('embr:sl:signup');



// For some reason we got:
// TypeError: Uncaught, unspecified "error" event.
process.on('uncaughtException', function(err) {
  console.log('uncaughtException');
  console.log(err);
});

////////////////////////////////////////////////////////////////////////////////
//
// APP LISTEN
//
////////////////////////////////////////////////////////////////////////////////
http.listen(process.env.PORT, function(){
  console.log('listening on *:' + process.env.PORT);
});
