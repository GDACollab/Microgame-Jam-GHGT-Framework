// Based on https://stackoverflow.com/questions/1479319/simplest-cleanest-way-to-implement-a-singleton-in-javascript
var GameInterface = (function() {
    var _lives = 3;
    var _difficulty = 1;
    if (DEBUG_DIFFICULTY >= 1 && DEBUG_DIFFICULTY <= 3 && Number.isInteger(DEBUG_DIFFICULTY)) {
        _difficulty = DEBUG_DIFFICULTY;
    }
    var _maxTimer = MAX_ALLOWED_TIMER;
    var _currTimer = 0;
    var _gameEnd = false;
    var MicrogameJamMainManager = null;

    var _gameEnded = function(didWin) {
        _gameEnd = true;
        _maxTimer = MAX_ALLOWED_TIMER;
        _difficulty = MicrogameJamMainManager.endGame(didWin);
    };

    return {
        getLives: function(){
            return _lives;
        },

        getDifficulty: function(){
            return _difficulty;
        },

        // Returns the number of seconds left until the game is over.
        getTimer: function(){
            if (_currTimer == 0) {
                return -1;
            } else {
                return _maxTimer - ((Date.now() - _currTimer) / 1000);
            }
        },

        winGame: function(){
            if (!_gameEnd){
                _gameEnded(true);
            } else {
                console.warn("Something tried to call winGame() after game has already ended.");
            }
            return;
        },

        loseGame: function(){
            _lives--;
            if (!_gameEnd){
                _gameEnded(false);
            } else {
                console.warn("Something tried to call loseGame() after game has already ended.");
            }
            return;
        },

        gameStart: function(){
            _gameEnd = false;
            _lives = 3;
            MicrogameJamMainManager.gameStarted();
            return;
        },

        setMaxTimer: function(time){
            console.log("setMaxTimer called: " + time + "s");
            if (time > MAX_ALLOWED_TIMER) {
                _maxTimer = MAX_ALLOWED_TIMER;
                console.warn("Someone tried to set max timer to " + time + "s. Setting to " + MAX_ALLOWED_TIMER + "s instead.");
            } else if (time < MIN_ALLOWED_TIMER) {
                _maxTimer = MIN_ALLOWED_TIMER;
                console.warn("Someone tried to set max timer to " + time + "s. Setting to " + MIN_ALLOWED_TIMER + "s instead.");
            } else {
                _maxTimer = time;
            }
            return;
        },

        construct(manager) {
            if (MicrogameJamMainManager === null) {
                MicrogameJamMainManager = manager;
            }
        }
    };

})();