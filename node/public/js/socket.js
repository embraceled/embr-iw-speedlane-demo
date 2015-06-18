'use strict';

$(function() {

  var iceworld = new IceWorld(io());

});

var IceWorld = function(socket)
{
  var self = this;
  var socket = socket;

  self.user = {};
  self.scores = [];

  // html elms
  var $userinfo;
  var $counter;
  var $scores;
  var $disconnectedModal;


  /**
   *
   * RACE
   *
   */


  self.handleStart = function(data)
  {
    self.setUserInfo(data);
    self.showUserInfo();
    self.startCountDown();
  };

  self.startRace = function()
  {

  };

  self.setUserInfo = function(data)
  {

  };

  self.showUserInfo = function()
  {
    self.hideTime();
    self.doResetTimer();
  };

  self.hideUserInfo = function()
  {

  };


  self.handleFinish = function(data)
  {
    self.showUserFinishData(data);
    self.updateScores();
  };


  self.resetRace = function(data)
  {
    self.resetCounterWindow();
  };


  /**
   *
   * TIMER
   *
   */

  /**
   * [showTimer description]
   * @return {[type]} [description]
   */
  self.showTimer = function()
  {

  };

  /**
   * [hideTimer description]
   * @return {[type]} [description]
   */
  self.hideTimer = function()
  {

  };

  /**
   * [startCountDown description]
   * @return {[type]}      [description]
   */
  self.startCountDown = function()
  {
    self.resetTimer();
    $counter.runner({
        countdown: true,
        startAt: 5 * 1000,
        stopAt: 0
    }).on('runnerFinish', function(eventObject, info) {
        console.log(eventObject, info);
        self.startRace();
    });
  };

  /**
   * [startTimer description]
   * @return {[type]} [description]
   */
  self.startTimer = function()
  {
    self.resetTimer();
    $counter.runner('start');
  };

  /**
   * [startTimer description]
   * @return {[type]} [description]
   */
  self.stopTimer = function()
  {
    $counter.runner('stop');
  };

  self.resetTimer = function()
  {
    $counter.runner('reset', true);
  };


  /**
   *
   * MODALS
   *
   */


  /**
   * [showDisconnectedModal description]
   * @return {[type]} [description]
   */
  self.showDisconnectedModal = function()
  {
    $disconnectedModal.modal('show');
  };

  /**
   * [hideDisconnectedModal description]
   * @return {[type]} [description]
   */
  self.hideDisconnectedModal = function()
  {
    $disconnectedModal.modal('hide');
  };


  /**
   *
   * INIT
   *
   */


  /**
   * [initSocket description]
   * @return {[type]} [description]
   */
  var initSocket = function()
  {
    socket.on('connect', function() {
      socket.emit('connected', 'connected');
    });

    socket.on('reconnect', function() {
      self.hideDisconnectedModal();
    });

    socket.on('disconnect', function() {
      self.showDisconnectedModal();
    });

    socket.on('start', function(data) {
      self.handleStart(data);
    });

    socket.on('finish', function(data) {
      self.handleFinish(data);
    });

    socket.on('out-of-time', function(data) {
      self.resetRace(data);
    });
  };

  /**
   * [initModals description]
   * @return {[type]} [description]
   */
  var initModals = function()
  {
    var modalOptions = {
      show: false,
      keyboard: false,
      backdrop: 'static'
    };

    $disconnectedModal = $('#disconnectedModal').modal(modalOptions);
  };

  /**
   * [initScores description]
   * @return {[type]} [description]
   */
  var initScores = function()
  {
    // fetch latest 10 scores

  };

  /**
   * [initCounter description]
   * @return {[type]} [description]
   */
  var initCounter = function()
  {
    $counter = $('#counter');

    // init runner
    $counter.runner();
  };

  /**
   * [init description]
   * @return {[type]} [description]
   */
  self.init = function()
  {
    // init io
    initSocket();

    // init disconnect modals
    initModals();

    // init scores
    initScores();

    // init counter
    initCounter();
  }

  self.init();
}
