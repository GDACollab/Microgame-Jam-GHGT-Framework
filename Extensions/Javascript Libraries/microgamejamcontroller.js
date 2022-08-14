var MicrogameJamController = (function() {
    var isGame = parent.GameInterface !== undefined;

    var time = Date.now();
    var gameStarted = false;
    var gameOver = false;

    var defaultDifficulty = 1;
    var defaultLives = 3;
    var allowAutoRestarts = true;

    var savedCallback;
    var maxSeconds = 15;

    // Insures default time is set correctly
    if (isGame) {
        parent.GameInterface.setMaxTimer(maxSeconds);
    }

    function StartGame(){
        if(gameStarted == false){ // Can be called twice by failsafe, so insures games starts only once
            
            time = Date.now();
            if (isGame) {
                parent.GameInterface.gameStart();
            }
            

            gameStarted = true;
        }
    };

    // Failsafe - After half a second, without SetMaxTimer call, game will still start
    setTimeout(StartGame, 500);

    function CheckGameOver() {
        if(GetTimer() <= 0){
            LoseGame();
            clearInterval(myLoop);
        }
    }
    
    // Check game over every second.
    var myLoop = setInterval(CheckGameOver, 1000);

    function RestartGame(){
        if(allowAutoRestarts){
            alert("Auto Restarting Controller...");

            savedCallback();
            gameOver = false;
            gameStarted = false;
            StartGame();
        }else{
            alert("Auto Restarting Not Enabled. Enable in microgamejamcontorller.js");
        }
    }

    return {
        GetLives: function(){
            if (isGame){
                return parent.GameInterface.getLives();
            } else {
                return defaultLives;
            }
        },
        GetDifficulty: function(){
            if (isGame) {
                return parent.GameInterface.getDifficulty();
            } else {
                return defaultDifficulty;
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
            if(gameOver == false){
                gameOver = true;

                if (isGame) {
                    parent.GameInterface.winGame();
                } else {
                    alert("Game won!");
                    RestartGame();
                }
            }
        },
        LoseGame: function(){
            if(gameOver == false){
                gameOver = true;

                if (isGame) {
                    parent.GameInterface.loseGame();
                } else {
                    alert("Game lost!");
                    RestartGame();
                }
            }
        },
        SetMaxTimer: function(seconds, startGameCallback){
            savedCallback = startGameCallback;

            if(gameStarted){ return; }
            
            seconds = Math.max(5,seconds)
            seconds = Math.min(15,seconds)

            if (isGame) {
                parent.GameInterface.setMaxTimer(seconds);
            } else {
                maxSeconds = seconds;
            }
            StartGame();
        }
    };
});