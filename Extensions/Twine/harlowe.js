// Should be inserted into your Story Javascript
var isGame;
try {
     if(isGame = parent.GameInterface !== undefined && parent.GameInterface !== null)
     {isGame = true}
  }
  catch(ex) {
    isGame = false;
  }
var time = Date.now();
var maxSeconds = 15;
var gameOver = false;

if (isGame) {
    parent.GameInterface.gameStart();
}

function updateVariables() {
  	var variables = {};
    if (isGame){
        var seconds = parent.GameInterface.getTimer();
        var lives = parent.GameInterface.getLives();
        var difficulty = parent.GameInterface.getDifficulty();
      variables = {seconds, lives, difficulty}
    } else {
        lives = 3;
        difficulty = 1;
        seconds = Math.floor(maxSeconds - ((Date.now() - time) / 1000));
      variables = {seconds, lives, difficulty}
    }
  	Object.entries(variables).forEach(function([key, value]) {
        State.variables[key] = value;
    	});
    if (seconds <= 0) {
      if (gameOver == false) {
        if (isGame) {
            window.parent.GameInterface.loseGame();
          	gameOver = true;
        } else {
            alert("Game Lost!");
          	gameOver = true;
        }
      }
    }
}

const macros = require('macros');

function functionCalls(){
    var functionNames = {};
    
    if (isGame){
        functionNames = {
            'WinGame': parent.GameInterface.winGame,
            'LoseGame': parent.GameInterface.loseGame,
            'SetMaxTimer': parent.GameInterface.setMaxTimer
        };
    } else {
        functionNames = {
            'WinGame': () => { if (gameOver == false) {alert("Game Won!"); gameOver = true;}},
            'LoseGame': () => { if (gameOver == false) {alert("Game Lost!"); gameOver = true;}},
            'SetMaxTimer': (seconds) => {
              	if (seconds < 5) {maxSeconds = 5}
                else if (seconds > 15) {maxSeconds = 15}
              	else {maxSeconds = seconds};
            }
        }
    }
  
      // Based on https://foss.heptapod.net/games/harlowe/-/blob/branch/default/js/macros.js and https://github.com/ChapelR/harlowe-macro-api/blob/master/src/macro.js
      Object.entries(functionNames).forEach(function([key, value]) {
        macros.add(key, "Instant", function(_, ...args) {
          value(args);
          console.log(args);
          return {
              TwineScript_TypeID: "instant",
            TwineScript_TypeName: "a (" + key + ":) operation",
            TwineScript_ObjectName: "a (" + key + ":) operation",
            TwineScript_Unstorable: true,
            TwineScript_Print: () => ''
          };
        }, [parseInt]);
    });
}
functionCalls();

setInterval(updateVariables, 100);