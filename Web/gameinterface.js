/**
 * Implements the GameInterface singleton.
 * Based on https://stackoverflow.com/questions/1479319/simplest-cleanest-way-to-implement-a-singleton-in-javascript
 * Loaded by index.html.
 * @file
 */

var GameInterface = (
    /**
     * @lends GameInterface
     */
    function() {
    /** Number of lives the player has
     * @type {number} 
     */
    var _lives = 3;
    /** Current difficulty, ranging from 1 to 3.
     * @type {number} 
     */
    var _difficulty = 1;
    if (DEBUG_DIFFICULTY >= 1 && DEBUG_DIFFICULTY <= 3 && Number.isInteger(DEBUG_DIFFICULTY)) {
        _difficulty = DEBUG_DIFFICULTY;
    }
    /**
     * Current maximum timer value.
     * @type {number}
     * @default {@link MAX_ALLOWED_TIMER}
     */
    var _maxTimer = MAX_ALLOWED_TIMER;
    /**
     * Current timer value
     * @type {number}
     */
    var _currTimer = -1;
    /**
     * Whether or not the game has ended.
     * @type {boolean}
     */
    var _gameEnd = false;
    /**
     * Reference to {@link MicrogameJam}.
     */
    var MicrogameJamMainManager = null;

    /**
     * Callback for when the game has ended.
     * @param {boolean} didWin 
     */
    var _gameEnded = function(didWin) {
        _gameEnd = true;
        _maxTimer = MAX_ALLOWED_TIMER;
        _currTimer = -1;
        _difficulty = MicrogameJamMainManager.endGame(didWin);
        if (_lives <= 0) {
            _lives = 3;
            _difficulty = 1;
        }
    };

    return  {
        /**
         * @memberof GameInterface
         * @returns {number} {@link GameInterface~_lives}
         */
        getLives: function(){
            return _lives;
        },

        /**
         * @memberof GameInterface
         * @returns {number} {@link GameInterface~_difficulty}
         */
        getDifficulty: function(){
            return _difficulty;
        },

        /**
         * Returns the number of seconds left until the game is over.
         * 
         * @memberof GameInterface
         * @returns {number} {@link GameInterface~_currTimer}
         * */
        getTimer: function(){
            if (_currTimer === -1) {
                // We want to avoid messing with game logic as much as possible, especially while it's loading (and especially since we can't predict when gameStart will be called).
                // So to prevent any accidental loseGame calls while our timer is not set up, we just return a large seconds value. That shouldn't mess with any games right now,
                // but if it does you can say "I told you so" to me and figure out a better workaround.
                return 100;
            } else {
                return _maxTimer - ((performance.now() - _currTimer) / 1000);
            }
        },

        /**
         * Win the game, and then end it.
         * @memberof GameInterface
         */
        winGame: function(){
            if (!_gameEnd){
                _gameEnded(true);
            } else {
                console.warn("Something tried to call winGame() after game has already ended.");
            }
            return;
        },

        /**
         * Lose the game, and then end it.
         * @memberof GameInterface
         */
        loseGame: function(){     
            _lives--;
            if (!_gameEnd){
                _gameEnded(false);
            } else {
                console.warn("Something tried to call loseGame() after game has already ended.");
            }
            return;
        },

        /**
         * @memberof GameInterface
         * Start the game. Call {@link MicrogameJam#gameStarted}.
         */
        gameStart: function(){
            _gameEnd = false;
            MicrogameJamMainManager.gameStarted();
            _currTimer = performance.now();
            return;
        },

        /**
         * 
         * @memberof GameInterface
         * @returns {@link GameInterface~_maxTimer}
         */
        getMaxTimer: function() {
            return _maxTimer;
        },

        /**
         * Set {@link GameInterface~_maxTimer}.
         * @param {number} time Time to set.
         * @memberof GameInterface
         */
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

        /**
         * Set {@link GameInterface~MicrogameJamMainManager} from {@link MicrogameJam}.
         * @param {MicrogameJam} manager The microgamejam manager.
         * @constructs GameInterface
         */
        construct(manager) {
            if (MicrogameJamMainManager === null) {
                MicrogameJamMainManager = manager;
            }
        }
    };

})();