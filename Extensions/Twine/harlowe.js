// Should be inserted into your Story Javascript:
try {
    window.$isGame = window.parent.GameInterface !== undefined && window.parent.GameInterface !== null;
  }
  catch(ex) {
    window.$isGame = false;
  }
var time = Date.now();
window.$maxSeconds = 20;

if (window.$isGame) {
    window.parent.GameInterface.gameStart();
}

function updateVariables() {
    if (window.$isGame){
        window.$seconds = window.parent.GameInterface.getTimer();
        window.$lives = window.parent.GameInterface.getLives();
        window.$difficulty = window.parent.GameInterface.getDifficulty();
    } else {
        window.$lives = 3;
        window.$difficulty = 1;
        window.$seconds = Math.floor(window.$maxSeconds - ((Date.now() - time) / 1000));
    }
    if (window.$seconds <= 0) {
        if (window.$isGame) {
            window.parent.GameInterface.loseGame();
        } else {
            alert("Game Lost!");
        }
    }
}

setInterval(updateVariables, 100);