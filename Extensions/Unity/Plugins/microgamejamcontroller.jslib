mergeInto(LibraryManager.library, {
    
    Win: function(){
        return parent.GameInterface.winGame();
    },

    Lose: function(){
        return parent.GameInterface.loseGame();
    },

    Lives: function(){
        return parent.GameInterface.getLives();
    },

    Difficulty: function(){
        return parent.GameInterface.getDifficulty();
    },

    Timer: function(){
        return parent.GameInterface.getTimer();
    },

    GameExists: function(){
        return "GameInterface" in parent && parent.GameInterface !== null;
    },

    StartGame: function(){
        parent.GameInterface.gameStart();
    },

    SetTimerMax: function(time){
        parent.GameInterface.setMaxTimer(time);
    }
});