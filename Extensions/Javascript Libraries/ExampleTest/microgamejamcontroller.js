/**
 * Microgame Controller For Javascript Games
 * 
 * Author: Jonah Ryan
 * If you need help please reach out on discord! (jonahrobot#2335)
 * 
 * @param defaultDifficulty - this will set the difficulty of the level
 * @param defaultLives - this will set the default lives
 * @param allowAutoRestarts - when you lose, should the game automatically restart.
 */

var MicrogameJamController = (function(defaultDifficulty,defaultLives,allowAutoRestarts) {
    var isGame = parent.GameInterface !== undefined;

    var time = Date.now();
    var gameStarted = false;
    var gameOver = false;
    var maxSeconds = 15;

    var myLoop;
    var savedCallback;

    // Insures default time is set correctly
    if (isGame) {
        parent.GameInterface.setMaxTimer(maxSeconds);
    }

    // Checks to see canvas has correct resolution
    window.addEventListener('load', (event) => {

        var FoundSize = false;

        const allInBody = document.querySelectorAll('body > *');

        for (const element of allInBody) {
            if(element.width == 960 && element.height == 540){
                FoundSize = true;
                break;
            }
        }

        if(FoundSize == false){
            console.error("Canvas is not 960 by 540");
        }
      });
      
    /**
     * Handles inital setup, called by SetMaxTimer
     */
    function StartGame(){
        if(gameStarted == false){
            gameStarted = true;

            myLoop = setInterval(CheckGameOver, 1000);
            time = Date.now();

            if (isGame) {
                parent.GameInterface.gameStart();
            }
        }
    };

    // Failsafe - After half a second, without SetMaxTimer call, game will still start
    setTimeout(StartGame, 500);

    /**
     * Every second check if timer is over, if it does, end game.
     */
    function CheckGameOver() {
        if(Math.floor(maxSeconds - ((Date.now() - time)/1000)) <= 0){
            EndGame();
            clearInterval(myLoop);
        }
    }

    function EndGame(){
        if(gameOver == false){
            gameOver = true;

            if (isGame) {
                parent.GameInterface.loseGame();
            } else {
                alert("Game lost!");
                RestartGame();
            }
        }
    };

    function RestartGame(){
        if(allowAutoRestarts){
            alert("Auto Restarting Controller...");

            if(typeof savedCallback !== 'undefined'){
            savedCallback();
            }

            gameOver = false;
            gameStarted = false;
            StartGame();
        }else{
            alert("Auto Restarting Not Enabled. Enable in microgamejamcontorller.js");
        }
    }

    return {

        // Returns the number of lives available
        GetLives: function(){
            if (isGame){
                return parent.GameInterface.getLives();
            } else {
                return defaultLives;
            }
        },

        // Returns the current difficulty level (between 1 and 3)
        GetDifficulty: function(){
            if (isGame) {
                return parent.GameInterface.getDifficulty();
            } else {
                return defaultDifficulty;
            }
        },

        // Returns the number of seconds until loseGame() is automatically called.
        GetTimer: function(){
            if (isGame) {
                return parent.GameInterface.getTimer();
            } else {
                return Math.floor(maxSeconds - ((Date.now() - time)/1000)); 
            }
        },
        
        // Sends callback to main webpage/other js files to tell them that we won the game.
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

        // Sends callback to main webpage/other js files to tell them that we lost the game.
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

        /**
         * Set the maximum number of seconds for the game to run for (used by getTimer())
         * @param seconds - new max seconds to set, max 15, min 5.
         * @param startGameCallback - start method to call in your own code when the game restarts
         * @returns 
         */
        SetMaxTimer: function(seconds, startGameCallback){
            console.log("Staging 1");
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
 

export {MicrogameJamController}