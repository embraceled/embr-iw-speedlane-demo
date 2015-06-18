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

  socket.on('start', function(data) {
    startRace(data);
  });

  socket.on('disconnect', function() {
    // remove socket from rooms
    console.log('client disconnected');
  });
});





////////////////////////////////////////////////////////////////////////////////
//
// RACE FOO
//
////////////////////////////////////////////////////////////////////////////////

var raceState = false;
var raceInfo = {};
var raceTimer = 0;
var users = [];

var getUsers =  function() {
  redisClient.get('embr:sl:users', function(err, rs) {
    if (err) {
      console.log(err);
      res.send(500);
    }

    users = JSON.parse(rs);
    // console.log(users);
  });
};


var getScoreList = function(cb) {

  // get redis list of current scores
  // redisClient.zrange('embr:sl:scores', 0, 10, 'withscores', function(err, rs) {
  redisClient.zrange('embr:sl:scores', 0, 10, function(err, rs) {
    if (err) {
      console.log(err);
      res.send(500);
    }

    // it returns an array with strings.
    // convert to json objects
    for (var a in rs) {
      rs[a] = JSON.parse(rs[a]);
    }

    console.log(rs);

    cb(rs);
  });
};

var handleStart = function(message)
{
  raceState = true;

  console.log('start message:');
  console.log(message);
  console.log(message.braceletId);

  // fetch user
  io.emit('start', users[message.braceletId]);
};

var startRace = function(data)
{
  // start timer here
};

var handleFinish = function(message)
{
  raceState = false;
  console.log('finish message:');
  console.log(message);

  // stop timer hee

  // add to scores

  io.emit('finish', [{'user' : {'full_name' : 'Robert van Geerenstein'}, 'time' : 14}]);
  // getScoreList(function() {io.emit('finish', rs)});
}


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
      // if (raceState) break;
      handleStart(message);
      break
    case 'embr:sl:finish':
      if ( ! raceState) break;
      handleFinish(message);
      break
  }
});

// subscribe
redisSubClient.subscribe('embr:sl:start');
redisSubClient.subscribe('embr:sl:finish');



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
