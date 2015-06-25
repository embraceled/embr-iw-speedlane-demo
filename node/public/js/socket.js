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
  // var $counter;
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
    // self.startCountDown();
  };

  self.startRace = function()
  {
    // self.resetTimer();
    // self.startTimer();
  };

  self.setUserInfo = function(data)
  {
    self.user = data;
    $userinfo.html(self.user.full_name);
  };

  self.showUserInfo = function()
  {
    // self.hideTimer();
    // self.resetTimer();

    $userinfo.show();
  };

  self.hideUserInfo = function()
  {
    $userinfo.hide();
  };

  self.handleFinish = function(data)
  {
    // self.stopTimer();
    // self.showUserFinishData(data);
    self.updateScores(data);
  };

  self.updateScores = function(data)
  {
    $scores.empty();
    for (var i in data) {
      console.log(data);
      $scores.append('<tr><td>' + i + 1 + '</td><td>' + data[i].user.full_name + '</td><td>' + data[i].time + '</td></tr>');
    }
  }

  self.resetRace = function(data)
  {
    self.resetCounterWindow();
  };


  /**
   *
   * TIMER
   *
   */

  // /**
  //  * [showTimer description]
  //  * @return {[type]} [description]
  //  */
  // self.showTimer = function()
  // {
  //   $counter.show();
  // };

  // /**
  //  * [hideTimer description]
  //  * @return {[type]} [description]
  //  */
  // self.hideTimer = function()
  // {
  //   $counter.hide();
  // };

  // /**
  //  * [startCountDown description]
  //  * @return {[type]}      [description]
  //  */
  // self.startCountDown = function()
  // {
  //   self.resetTimer();
  //   self.showTimer();
  //   $counter.runner({
  //       countdown: true,
  //       startAt: self.countdownTimer * 1000,
  //       stopAt: 0,
  //       milliseconds: false
  //   });
  //   $counter.runner('start')
  //   $counter.on('runnerFinish', function(eventObject, info) {
  //     console.log(eventObject, info);
  //     self.resetTimer();
  //     self.startRace();
  //   });
  // };

  // /**
  //  * [startTimer description]
  //  * @return {[type]} [description]
  //  */
  // self.startTimer = function()
  // {
  //   self.showTimer();
  //   $counter.runner({
  //       countdown: false
  //   });
  //   $counter.runner('start')
  // };

  // /**
  //  * [startTimer description]
  //  * @return {[type]} [description]
  //  */
  // self.stopTimer = function()
  // {
  //   $counter.runner('stop');
  // };

  // self.resetTimer = function()
  // {
  //   $counter.runner('reset', true);
  //   $counter.runner();
  // };


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

    socket.on('almost-out-of-time', function(data) {
      // self.resetRace(data);
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
    $scores = $('#scores');
  };

  // /**
  //  * [initCounter description]
  //  * @return {[type]} [description]
  //  */
  // var initCounter = function()
  // {
  //   $counter = $('#counter');

  //   // init runner
  //   $counter.runner();
  // };

  /**
   * [initCounter description]
   * @return {[type]} [description]
   */
  var initUserInfo = function()
  {
    $userinfo = $('#userinfo');
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

    // // init counter
    // initCounter();

    // init user info
    initUserInfo();
  }

  self.init();
}
