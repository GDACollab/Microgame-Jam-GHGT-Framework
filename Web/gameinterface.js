const MAX_ALLOWED_TIMER = 15;
const MIN_ALLOWED_TIMER = 1;

// Based on https://stackoverflow.com/questions/1479319/simplest-cleanest-way-to-implement-a-singleton-in-javascript
var GameInterface = (function() {
    var _lives = 3;
    var _difficulty = 1;
    var _maxTimer = 15;
    var _currTimer = 0;
    var _gameStartCallback = function(){};
    var _winCallback = function(){};
    var _loseCallback = function(){};
    var _update = function(){};

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
            clearInterval(_update);
            _winCallback();
            return;
        },

        loseGame: function(){
            clearInterval(_update);
            _loseCallback();
            return;
        },

        gameStart: function(){
            _currTimer = Date.now();
            var self = this;
            _update = setInterval(function(){
                console.log(self.getTimer());
                if (self.getTimer() <= 0){
                    self.loseGame();
                }
            }, 100);
            _gameStartCallback();
            return;
        },

        setMaxTimer: function(time){
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

        init(gameStartCallback, winCallback, loseCallback){
            _gameStartCallback = gameStartCallback;
            _winCallback = winCallback;
            _loseCallback = loseCallback;
        }
    };

})();