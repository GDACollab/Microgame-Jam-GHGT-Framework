// Based on https://stackoverflow.com/questions/1479319/simplest-cleanest-way-to-implement-a-singleton-in-javascript
var GameInterface = (function() {
    var _lives = 3;
    var _difficulty = 1;
    var _maxTimer = 20;
    var _currTimer = 0;
    var _gameStartCallback = function(){};
    var _winCallback = function(){};
    var _loseCallback = function(){};
    var _update;

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
            _maxTimer = time;
            return;
        },

        getMaxTimer: function(){
            return _maxTimer;
        },

        init(gameStartCallback, winCallback, loseCallback){
            _gameStartCallback = gameStartCallback;
            _winCallback = winCallback;
            _loseCallback = loseCallback;
        }
    };

})();