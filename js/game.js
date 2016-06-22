//General use functions

function findMedian(array) {

    // extract the .values field and sort the resulting array
    var m = array.sort(function(a, b) {
        return a - b;
    });

    var middle = Math.floor((m.length - 1) / 2); // NB: operator precedence
    if (m.length % 2) {
        return m[middle];
    } else {
        return (m[middle] + m[middle + 1]) / 2.0;
    }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getIndex(needle, haystack) {
    return haystack.join('-').split('-').indexOf( needle.join() );
}

// End general use functions

var isIOS = ((/iphone|ipad/gi).test(navigator.appVersion));
var myDown = isIOS ? "touchstart" : "mousedown";
var myUp = isIOS ? "touchend" : "mouseup";

var $submitButton = $("#submit");
var $board = $("#board");

var board = [];
var gamePaused = true;

var declared = false;

var gameover = false;

gameHistory = []

function fill_td(td, cardName) {
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

function createDivTable() {
  var columns = ['A','B','C','D'];
  var rows = ['1','2','3'];
  var $spacer = $('<img class="spacer" src="/img/spacer.png" alt="spacer">');
  for (var i = 0;i<rows.length;i++) {
    for (var j=0;j<columns.length;j++) {
      var $newCell = $('<div id="'+columns[j]+rows[i]+'"></div>')
      $newCell.addClass('cell');
      $newCell.addClass('col-xs-4 col-md-3');
      $('#board').append($newCell);
    }
  }
}

function deckbuilder() {
  opts = ['0','1','2'];
  deck = [];
  for (var a=0;a<3;a++) {
    for (var b=0;b<3;b++) {
      for (var c=0;c<3;c++) {
        for (var d=0;d<3;d++) {
          deck.push(opts[a]+opts[b]+opts[c]+opts[d]);
        }
      }
    }
  }
  return deck;
}

function layoutGame () {
  deck = deckbuilder();
  populateBoard();
  confirmSetPresenceOrEnd();
}

function populateBoard() {
  var columns = ['A','B','C','D'];
  var rows = ['1','2','3'];
  deck = deck.concat(board);
  deck = shuffle(deck);
  board = [];
  var newCard;
  for (var i = 0;i<rows.length;i++) {
    for (var j=0;j<columns.length;j++) {
      var cellName = '#'+columns[j]+rows[i];
      newCard = deck.pop();
      board.push(newCard);
      fill_td(cellName,newCard);
    }
  }
}

function getSelectedBoxes() {
  var boxes = $('.cell.on');
  var cells = [];
  boxes.each(function(index) {
    cells.push($(this).attr('id'));
  })
  return cells;
}

function getCards(cells) {
  results = []
  for (var i=0;i<cells.length;i++) {
    var $cell = $('#'+cells[i]);
    var id = $cell.find('img.sprite').attr('id').slice(1,5);
    results.push(id);
  }
  return results;
}

function testSet(cards) {
  for (var i=0;i<4;i++) {
    var to_test = parseInt(cards[0][i])+parseInt(cards[1][i])+parseInt(cards[2][i]);
    if (to_test % 3 != 0) {
    return false;
    }
  }
  return true;
}

function admireSet(cards,message,whose) {
  gamePaused = true;
  nowTime = Date.now() / 1000;
  foundAfter = nowTime - turnStartTime;
  gameHistory.push([Number(foundAfter.toFixed(2)), setsCount, whose])
  failedFind();
  $('.cell').removeClass('on');
  for (var i=0;i<cards.length;i++) {
    var $cell = $('#c'+cards[i]).parents('.cell');
    $cell.addClass('on');
  }
  $board.addClass('highlighted');
  $('#alert-message').html(message);
  $('#alert-message').show()
  // $overlay.append($('<h1>'+message+'</h1>'));
  $overlay.show();
}

function updateBoard (cards) {
  var cells = [];
  for (var i=0;i < 3;i++) {
    var oldCard = cards[i];
    var index = board.indexOf(oldCard);
    board.splice(index,1);
    var $cell = $('#c'+oldCard).parents('.cell');
    cells.push($cell.attr('id'));
    $('#c'+oldCard).remove();
  }
  if (deck.length >= 3) {
    for (var i=0;i<3;i++) {
      var newCard = deck.pop();
      board.push(newCard);
      cellName = "#"+cells[i];
      fill_td(cellName,newCard);
    }
  }
}

function countSets(board) {
  results = [];
  for (var i=0;i<(board.length-2);i++){
    for (var j=i+1;j<(board.length-1);j++) {
      third = nameThird([board[i],board[j]]);
      var k = board.indexOf(third)
      if (k != -1) {
        newSet = [i,j,k];
        newSet.sort();
        if (getIndex(newSet,results) == -1) {
          results.push(newSet);
        }
      }
    }
  }
  return results.length;
}

function deckContainsSet(deck) {
  for (var i=0;i<(deck.length-2);i++){
    for (var j=i+1;j<(deck.length-1);j++) {
      var third = nameThird([deck[i],deck[j]]);
      var k = deck.indexOf(third)
      if (k != -1) {
        return true;
      }
    }
  }
  return false;
}

function confirmSetPresenceOrEnd() {
  while (countSets(board) == 0) {
    if (board.concat(deck).length >= 21 || deckContainsSet(board.concat(deck))) {
      console.log('There is still a set! Retrying...');
      populateBoard();
    } else {
        gameOver();
        return 0;
    }
  }
}

// Interaction with board

//Board touch declares SET

$("#board").on(myDown, function(event) {
  if (declared == false) {
    event.stopPropagation();
    declarePress();
  }
});

// Will auto-submit when activated

function delayedSubmit() {
  if ($('.cell.on').length == 3 && !gamePaused) {
    $submitButton.trigger(myDown);
  }
}
