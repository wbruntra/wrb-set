/*TODO:

think about: alert user when there is no set on board before reshuffle
bug: game does not allow player to press set very early (before computer starts guessing)
only ask for Name once, then make it the default for score entry [DONE]
only ask for Name if score will make the "High Scores" page [DONE]


*/

$('.difficulty-box input').click(function() {
  d = $(this).val();
  $('#difficulty').val(d);
});

var playingTo = 5;

failureMessage = "OH NO!"
successMessage = "CONGRATS!"
//Pregame screen


function fill_td(td, cardName) {
  //console.log(td +" ,"+ cardName);
  var numReference = ["one","two","three"];
  var fillReference = ["empty","striped","solid"]
  var colorReference = ["red", "green", "purple"];
  var $cell = $(td);
  var $box = $('<div class="box col-xs-12"></div>');
  var $a = $('<a class="stretchy no-limit" href="#"></a>');
  var $spacer = $('<img class="spacer" src="/img/spacer.png" alt="spacer">');
  var $cardImg = $('<img class="sprite" id="c'+cardName+'" alt="card">');
  var cardShape = cardName[3];
  var cardColor = cardName[2];
  var cardNumber = numReference[parseInt(cardName[0])];
  var cardFill = fillReference[parseInt(cardName[1])];
  $cardImg.addClass(cardNumber);
  $cardImg.addClass(cardFill);
  $cardImg.attr('src','/img/'+cardColor+cardShape+'.png');
  $a.append($spacer);
  $a.append($cardImg);
  $box.append($a);
  $cell.empty().append($box);
}

$('#start-button').on(myDown,function(e) {
  console.log("Game started!");
  difficultyMultiplier = ($('#super-difficult').is(':checked')) ? 2 : 1;
  difficultyLevel = difficultyMultiplier * parseInt($('#difficulty').val());
  guessTime = 36000/difficultyLevel;
//  longGame = ($('#gametype').val() == "1") ? true : false;
  longGame = false;
  $('#declaration').hide();
  $('#pregame').hide();
  $('#colOne').show();
  $('#middle').show();
  startTime = Date.now() / 1000;
  turnStartTime = startTime;
  setsCount = countSets(board);
  updateInfo();
  gameTime = setInterval(countup,1000);
  setTimeout(startComputer,1500);
});


function resetGame() {
  board = [];
  seconds = 0;
  yourScore = 0;
  opponentScore = 0;
}

// Overlay for pausing game after set is found

var $overlay = $('<div id="overlay"></div>');
$("body").append($overlay);

// 1. Initializing the game

createDivTable();

layoutGame();

//Click cell toggles selection

$('#board').on(myDown,'.cell',function(event) {
  if (declared == true) {
    if ($(this).hasClass('on')) {
      $(this).removeClass('on');
    } else {
      if ($('.cell.on').length <3) {
        $(this).addClass('on');
      }
    }
    if ($('.cell.on').length == 3) {
      $submitButton.addClass('ready');
      setTimeout(delayedSubmit,400);
    }
  }
});

//Listeners

$submitButton.on(myDown,function (event) {
  console.log("submit button pressed!");
  event.preventDefault();
  $submitButton.removeClass('ready');
  var cells = getSelectedBoxes();
  var cards = getCards(cells);
  if (testSet(cards)) {
      window.yourScore += 1;
      admireSet(cards,successMessage,'player');
  } else {
    $(".cell").removeClass('on');
  }
})


// 1. (used functions)



//User interaction with board


//What happens upon submission
// submit button -> get boxes with class 'on' -> name cards in those boxes  ->
// testif cards form a SET -> SUCCESS or clear boxes








// After successful find: change score, highlight set, pause game, wait for click
// After click: remove SET from board, add three cards to board,

//Admire set function

//this function should take a list of CARDS as input, find those cards' associated cells, and
//highlight those cells; overlay is then displayed and game pauses



//then click overlay to turn it off

//when user clicks off overlay, cards are replaced and game resumes

//Remove selected cards from board
//If deck has at least 3 cards left, replace removed cards

//find out who is playing

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
}

$overlay.click( function(e) {
  if (gameover == false) {
    var cells = getSelectedBoxes();
    var cards = getCards(cells);
    updateBoard(cards);
    setsCount = countSets(board);
    turnStartTime = Date.now() / 1000;
    $board.removeClass('highlighted');
    $(".cell").removeClass('on');
    $overlay.html('');
    $('#alert-message').hide();
    $overlay.hide();
    prematureEnd();
    confirmSetPresenceOrEnd();
    updateInfo();
  } else {
    var finalScore = calculateScore();
    console.log('Ending the game!');
    $overlay.hide();
    if (calculateScore() > lowScore) {
      promptName();
    } else {
      location.reload();
    }
  }
});

function promptName () {
  var name;
  var $nameDiv = $('<div id="name-prompt"></div>');
  var $nameForm = $('<div>');
  $nameForm.append($('<p>Congratulations! You got a high score!</p>'));
  $nameForm.append($('<p>Enter your name</p>'));
  $nameForm.append($('<p><input id="player-name" value="'+getCookie('player')+'"></p>'));
  $nameForm.append($('<button id="submit-name">Go!</button>'));
  $nameForm.append($('<button id="no-submit">Cancel</button>'));
  $nameDiv.append($nameForm);
  $("body").append($nameDiv);
  $('#submit-name').click(function(e) {
    var finalScore = calculateScore();
    playerName = $('#player-name').val();
    var $form = $('<form action="/scores" method="post">');
    var $user = $('<input type="text" name="user" value="'+playerName+'">');
    var $score = $('<input type="text" name="score" value="'+finalScore+'">');
    var $scoreSubmit = $('<input id="submit-score" type="submit">');
    $form.append($user);
    $form.append($score);
    $form.append($scoreSubmit);
    $("body").append($form);
    $('form').hide();
    $('#name-prompt').hide();
    console.log('about to click submit button');
    $('#submit-score').click();
  });
  $('#no-submit').click(function(e) {
    location.reload();
  });
}

function calculateScore () {
  var longMultiplier = longGame ? 1 : 2.5;
  var difference = yourScore-opponentScore;
  var difficulty = difficultyLevel;
  var finalScore = Math.floor(25*difference*Math.pow(difficulty,2));
  finalScore = finalScore < 0 ? 0: finalScore;
  return finalScore;
}


function prematureEnd() {
  if (longGame == false && (yourScore >=playingTo || opponentScore >=playingTo)) {
    gameOver();
  } else {
    clearInterval(guesser);
    setTimeout(startComputer,500);
  }
}

function gameOver () {
  $overlay.show()
  var $h1 = $('<h1>');
  if (yourScore > opponentScore) {
    $h1.text('YOU WIN!');
  } else {
    $h1.text('YOU LOSE!');
  }
  $overlay.append($h1);
  stats = genStats(gameHistory);
  sendStats(stats);
  clearInterval(gameTime);
  gameover = true;
  gamePaused = true;
}

$('#replay').click(function (e) {
  location.reload();
});

$('#reshuffle').click(function (e) {
  reshuffle()
});

function reshuffle() {
  populateBoard();
  while (countSets(board) < 1) {
    populateBoard();
  }
  updateInfo();
  computerSearchInit();
}

//**
//General game information
//** These functions help display relevant information about the game


var $remain = $('#remaining');
var $yourScore = $('#your-score');
var $opponentScore = $('#opponent-score');

var yourScore = 0;
var opponentScore = 0;

function updateInfo() {
  $remain.text('Cards remaining: '+deck.concat(board).length);
  $yourScore.text("You: "+yourScore);
  $opponentScore.text("Computer: "+opponentScore);
  $('#sets-on-board').text("Sets on board: "+countSets(board));
  $('#score-info').text("Score: "+calculateScore());
  return;
}

// How computer thinks and interacts with board

function nameThird(cards) {
  var features;
  var missing;
  var result = "";
  for (var i=0;i<4;i++) {
    if (cards[0][i] == cards[1][i]) {
      result = result + cards[0][i]
    } else {
      features = parseInt(cards[0][i])+parseInt(cards[1][i])
      missing = (3 - features).toString();
      result = result + missing;
    }
  }
  return result.trim();
}

//Computer guess method: choose two cards at random from board
// if third card to make a SET with these two is on board, computer declares SET
// function returns false if no set found, list of cards if set is found


// Old Search method - just keep on guessing forever

// Function returns array like Python's range(int) method
function jrange(board) {
  var a = [];
  for (var i=0;i<12;i++) {
    a.push(i);
  }
  return a;
}


function computerGuess(board) {
  var chosen = shuffle(jrange(board));
  var a = board[chosen[0]]
  var b = board[chosen[1]]
  var c = nameThird([a,b]);
  if (board.indexOf(c) != -1) {
    return [a,b,c];
  }
  return false;
}

// End old method

// New Method - go through list of possibilities until SET is found

function pairs(n) {
  result = [];
  for (i = 0;i<n-2;i++) {
    for (j=i+1;j<n-1;j++) {
      result.push([i,j]);
    }
  }
  return result;
}

function computerSearchInit() {
  choices = shuffle(pairs(board.length));
  choiceIndex = 0;
}

function computerSearch(board) {
  choice = choices[choiceIndex];
  var a = board[choice[0]]
  var b = board[choice[1]]
  var c = nameThird([a,b]);
  if (board.indexOf(c) != -1) {
    return [a,b,c];
  }
  return false;
}

// End New method

function computerTurn() {
  if (!declared && !gamePaused) {
    console.log("Guess at "+seconds);
    var cards = computerSearch(board);
  //  console.log("Tried "+choice);
    if (cards != false) {
      console.log('Computer finds set');
      opponentScore += 1;
      admireSet(cards, failureMessage,'computer');
    } else {
      if (guessTimeMultiplier > 1) {
        guessTimeMultiplier += -.25
      }
      choiceIndex += 1;
      setTimeout(computerTurn,guessTime*guessTimeMultiplier);
    }
  }
}

function startComputer() {
  console.log("Activating computer at "+seconds);
  guessTimeMultiplier = 2;
  computerSearchInit();
  gamePaused= false;
  guesser = setTimeout(computerTurn,guessTime*guessTimeMultiplier);
}



//END computer player features



//Add way to declare SET

function declareSet() {
  console.log('set declared');
  $('#board').addClass('active');
  declared = true;
  $setButton.hide();
  window.secondsLeft = 6;
  setCountdown();
  window.timerId = setInterval(countTimer,1000);
}

function setCountdown() {
  secondsLeft = window.secondsLeft;
  var $counter =  $('#countdown');
  var $declaration = $('#declaration');
  $('#declaration').show();
  $declaration.addClass('running');
  $counter.text(secondsLeft);
  $counter.show();
}

function countTimer() {
  secondsLeft = window.secondsLeft;
  secondsLeft = secondsLeft - 1;
  var $counter = $('#countdown');
  $counter.text(secondsLeft);
  if (secondsLeft == 0) {
    yourScore = yourScore - .5;
    gamePaused = false;
    updateInfo();
    failedFind();
  }
}

function failedFind() {
  console.log("Declaration over!");
  $('#board').removeClass('active');
  $('#reminder').show();
  $('#declaration').hide();
  declared= false;
  guesser = setTimeout(computerTurn,50);
//  $setButton.show();
  $submitButton.hide();
  $('#countdown').hide();
  clearInterval(window.timerId);
  $('.cell.on').removeClass('on');
}

var $setButton = $('#declare-set');

$setButton.hide();

$setButton.on(myDown,function (e) {
  e.stopPropagation();
  e.preventDefault();
  declareSet();
});

$("body").keydown(function(e) {
  if (e.which == 83) {
    declarePress();
  }
  if (e.which == 13 && declared) {
    $submitButton.trigger(myDown);
  }
  if (e.which == 71 && declared) {
    $submitButton.trigger(myDown);
  }
  if (e.which == 82 && declared == false && gamePaused == false) {
    populateBoard();
    updateInfo();
    computerSearchInit();
  }
});

function declarePress() {
  if (declared== false && gamePaused==false) {
    $('#reminder').hide();
    $setButton.trigger(myDown);
  }
}

//Timer and such

var $timer = $('#timer');
var seconds = 0;
$timer.text('Time: 0:00');


function countup() {
  if (gamePaused == false) {
    seconds = seconds+1;
    var mins = Math.floor(seconds/60);
    if (seconds % 60 < 10) {
      var rest = '0'+seconds % 60;
    } else {
      rest = seconds % 60;
    };
    $timer.text('Time: '+mins+":"+rest);
  }
}

// keeping track of stats

function sendStats(stats) {
  $.ajax({
    type:'POST',
    url:'/update_player',
    data: JSON.stringify(stats),
    success:function(data) {
      console.log(data)
  },
  error:function(e) {
    console.log(e);
  }
  });
}

function getAverages(gameHistory) {
  totalTime = 0;
  found = 0;
  averages = {};
  for (var i=0;i<9;i++) {
    averages[i] = [0,0];
  }
  for (var i=0;i<gameHistory.length;i++) {
    if (gameHistory[i][2] == "player") {
      totalTime += gameHistory[i][0]
      found++;
    }
  }
  if (found == 0) {
    return undefined
  }
  averages['overall'] = [totalTime/found, found];
  return averages;
}

function getTimes(gameHistory) {
  result = [];
  for (var i=0;i<gameHistory.length;i++) {
    if (gameHistory[i][2] == "player") {
      result.push(gameHistory[i][0])
    }
  }
  return result
}

function genStats() {
  endTime = Date.now()
  var playerWins = yourScore > opponentScore;
  var findingTimes = getTimes(gameHistory);
  var margin = yourScore-opponentScore;
  stats = {'describeGame':[playerWins, difficultyLevel, margin],
           'times':findingTimes,
        };
  return stats
}
