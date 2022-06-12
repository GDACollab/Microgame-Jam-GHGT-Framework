var MicrogameJamController = (function() {
    // TODO: Fix to match extension requirements.
    var isGame = parent.GameInterface !== undefined;

    var time = Date.now();
    var maxSeconds = 20;
    if (isGame) {
        parent.GameInterface.gameStart();
    }
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
                parent.GameInterface.WinGame();
            } else {
                alert("Game won!");
            }
        },
        LoseGame: function(){
            if (isGame) {
                parent.GameInterface.LoseGame();
            } else {
                alert("Game lost!");
            }
        },
        SetMaxTimer: function(seconds){
            if (isGame) {
                parent.GameInterface.SetMaxTimer(seconds);
            } else {
                maxSeconds = seconds;
            }
        }
    };
});