'use strict';

$(function() {

  var iceworld = new IceWorld(io());
  var iceworldUser = new IceWorldUserUi(iceworld, io());

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
  var $counterTime;
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
    self.showCountDown();
  };

  self.setUserInfo = function(data)
  {
    self.user = data;
    $userinfo.html(self.user.full_name);
  };

  self.showUserInfo = function()
  {
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
      $scores.append('<tr><td>' + (parseInt(i) + 1) + '</td><td>' + data[i].user.full_name + '</td><td>' + data[i].time + '</td></tr>');
    }

    // TODO if empty show placeholder?
  }

  self.resetRace = function()
  {
    self.resetCounterWindow();
  };

  self.resetCounterWindow = function()
  {

  };

  self.resetScores = function()
  {
    socket.emit('reset-scores', 1);
  }

  /**
   *
   * TIMER
   *
   */

  self.showCountDown = function()
  {
    $counter.css('color', 'black');
    $counter.show();
  }

  self.handleCountDownTick = function(data)
  {
    $counterTime.html(data);
  };

  self.handleRaceTick = function(data)
  {
    $counterTime.html(data);
  };

  self.handleAlmostOutOfTime = function(data)
  {
    $counter.css('color', 'red');
  };

  self.handleOutOfTime = function(data)
  {
    console.log('OUT OF TIME');
  };


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

    socket.on('update-scores', function(data) {
      self.updateScores(data);
    });

    socket.on('countdown-tick', function(data) {
      self.handleCountDownTick(data);
    });

    socket.on('race-tick', function(data) {
      self.handleRaceTick(data);
    });

    socket.on('finish', function(data) {
      self.handleFinish(data);
    });

    socket.on('almost-out-of-time', function(data) {
      self.handleAlmostOutOfTime(data);
    });

    socket.on('out-of-time', function(data) {
      self.handleOutOfTime(data);
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

  /**
   * [initCounter description]
   * @return {[type]} [description]
   */
  var initCounter = function()
  {
    $counter = $('#counter');
    $counterTime = $('#counter-time');
  };

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

    // init counter
    initCounter();

    // init user info
    initUserInfo();
  }

  self.init();
}


var IceWorldUserUi = function(iceworld, socket)
{
  var self = this;
  var iceworld = iceworld;
  var socket = socket;

  var $resetBtn;

  var $userForm;
  var $inputBracelet;
  var $inputFirstName;
  var $inputLastName;
  var $inputGender;

  /**
   * Form
   */

  self.showForm = function()
  {
    $userForm.show();
  };

  self.hideForm = function()
  {
    $userForm.hide();
  };

  self.resetForm = function()
  {
    $inputBracelet.val('')
    $inputFirstName.val('');
    $inputLastName.val('');
    $inputGender.val('');

    $userForm.find('div.form-group')
      .removeClass('has-error');
  };

  self.setFormByUser = function(user)
  {
    $inputFirstName.val(user.first_name || '');
    $inputLastName.val(user.last_name || '');
    $inputGender.val(user.gender || '');
  };

  self.handleNewSignup = function(data)
  {
    self.resetForm();

    $inputBracelet.val(data.braceletId);
    self.setFormByUser(data.user);

    self.showForm();
  };

  self.submitUserForm = function(e)
  {
    e.preventDefault();

    var requiredMissing = false;
    if ($inputFirstName.val() == '') {
      requiredMissing = true;
      $inputFirstName.closest('div.form-group')
        .addClass('has-error');
    }
    if ($inputLastName.val() == '') {
      requiredMissing = true;
      $inputLastName.closest('div.form-group')
        .addClass('has-error');
    }

    if (requiredMissing) {
      return false;
    }

    // update or create user
    socket.emit('upsert-user', $userForm.serializeArray());

    self.resetForm();
    self.hideForm();
    return;
  }


  /**
   * [initSocket description]
   * @return {[type]} [description]
   */
  var initSocket = function()
  {
    socket.on('new-signup', function(data) {
      self.handleNewSignup(data);
    });
  };

  /**
   * [initUserForm description]
   * @return {[type]} [description]
   */
  var initUserForm = function()
  {
    $userForm = $('#userForm');
    $userForm.on('submit', self.submitUserForm);

    // hide on start
    self.hideForm();

    $inputBracelet  = $('#inputBracelet');
    $inputFirstName = $('#inputFirstName');
    $inputLastName  = $('#inputLastName');
    $inputGender    = $('#inputGender');

    $resetBtn = $('#resetBtn');
    $resetBtn.on('click', iceworld.resetScores);
  };

  /**
   * [init description]
   * @return {[type]} [description]
   */
  self.init = function()
  {
    // init io
    initSocket();

    // init user info
    initUserForm();
  }

  self.init();
}
