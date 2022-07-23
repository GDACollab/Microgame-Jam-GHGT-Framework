var MicrogameJamController = (function() {
    // TODO: Fix to match extension requirements.
    var isGame = parent.GameInterface !== undefined;

    var time = Date.now();
    var gameStarted = false;

    var maxSeconds = 15;

    // Insures default time is set correctly
    if (isGame) {
        parent.GameInterface.setMaxTimer(maxSeconds);
    }

    function StartGame(){
        if(gameStarted == false){
            if (isGame) {
                parent.GameInterface.gameStart();
            }
            time = Date.now();

            gameStarted = true;
        }
    };

    // Failsafe - After 3 seconds, without SetMaxTimer call, game will still start
    setTimeout(StartGame, 3000);

    function CheckGameOver() {
        if(GetTimer() <= 0){
            LoseGame();
            clearInterval(myLoop);
        }
    }
    
    var myLoop = setInterval(CheckGameOver, 1000);

    return {
        GetLives: function(){
            if (isGame){
                return parent.GameInterface.getLives();
            } else {
                return 3;
            }
        },
        GetDifficulty: function(){
            if (isGame) {
                return parent.GameInterface.getDifficulty();
            } else {
                return 1;
            }
        },
        GetTimer: function(){
            if (isGame) {
                return parent.GameInterface.getTimer();
            } else {
                return Math.floor(maxSeconds - ((Date.now() - time)/1000)); 
            }
        },
        WinGame: function(){
            if (isGame) {
                parent.GameInterface.winGame();
            } else {
                alert("Game won!");
            }
        },
        LoseGame: function(){
            if (isGame) {
                parent.GameInterface.loseGame();
            } else {
                alert("Game lost!");
            }
        },
        SetMaxTimer: function(seconds){
            if (isGame) {
                parent.GameInterface.setMaxTimer(seconds);
            } else {
                maxSeconds = seconds;
            }
            StartGame();
        }
    };
});