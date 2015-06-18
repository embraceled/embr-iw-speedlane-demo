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

// require('./routes')(app); // var routes = require('./routes/routes'); app.use('/', routes);

app.get('/', function(req, res){
  // get redis list of current scores
  redisClient.zrange('embr:sl:scores', 0, 10,'withscores', function(err, rs) {
    if (err) {
      console.log(err);
      res.send(500);
    }

    // it returns an array with strings.
    // convert to json objects
    for (var a in rs) {
      rs[a] = JSON.parse(rs[a]);
    }

    res.render('index', {
      title : 'Iceworld scores',
      scores : rs
    });
  });
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

  socket.on('disconnect', function() {
    // remove socket from rooms
    console.log('client disconnected');
  });
});





// ////////////////////////////////////////////////////////////////////////////////
// //
// // REDIS SUBSCRIBE HANDLERS
// //
// ////////////////////////////////////////////////////////////////////////////////

// define activeRace var
var activeRace;
var raceInfo = {};

// redisSubClient.on("message", function(channel, message) {
//   message = JSON.parse(message);
//   if (channel == 'embr:events:pub') {

//     if (message.type == 'event') {
//       // when eventId is set, it's been deactivated emit to active room
//       if (typeof message.eventId != 'undefined' && parseInt(message.eventId) > 0) {
//         // get roomHash and trigger over
//         redisClient.get('RoomHash:' + message.eventId, function(err, roomHash) {
//           io.in(roomHash).emit('over');
//         });
//       }
//       // otherwise nothing special

//     // nodes were updated
//     } else if (message.type == 'nodes') {
//       // trigger full update, nodes might be added/removed
//       fullUpdateRoom(message.eventId);
//     }
//   }
// });

// // like/poll updates
// // for now this is combined, just make it work :P
// redisSubClient.on("pmessage", function(pattern, channel, message) {
//   message = JSON.parse(message);

//   // fetch node and current counts
//   var commandList = getRedisCountReadCommands(message.eventId, [message.deviceSerial]);

//   redisClient.multi(commandList).exec(function(err, counts) {

//     redisClient.get('embr:active:nodes:' + message.deviceSerial, function(err, node) {
//       node = JSON.parse(node);
//       // attach counts
//       for (var c = 0, k = 0, n = 0, countLen = counts.length; c < countLen; c++, k++) {
//         var cv = counts[c];

//         // set count vars
//         if (typeof node.counts == 'undefined') {
//           node.counts = [];
//         }
//         node.counts[k] = cv
//       }

//       redisClient.get('RoomHash:' + message.eventId, function(err, roomHash) {
//         io.in(roomHash).emit('update', node);
//       });
//     });
//   });
// });


// // subscribe to nodes, events
// redisSubClient.subscribe('embr:events:pub');
// // for now combine these
// redisSubClient.psubscribe('embr:*:pub:*'); // embr:1:pub:like / embr:1:pub:poll


// // For some reason we got:
// // TypeError: Uncaught, unspecified "error" event.
// process.on('uncaughtException', function(err) {
//   console.log('uncaughtException');
//   console.log(err);
// });

////////////////////////////////////////////////////////////////////////////////
//
// APP LISTEN
//
////////////////////////////////////////////////////////////////////////////////
http.listen(process.env.PORT, function(){
  console.log('listening on *:' + process.env.PORT);
});
