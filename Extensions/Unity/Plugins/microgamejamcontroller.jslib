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

    StartGame: function(){
        if ("GameInterace" in parent !== undefined && parent.GameInterface !== null) {
            parent.GameInterface.gameStart();
            return true;
        } else {
            return false;
        }
    },

    SetTimerMax: function(time){
        parent.GameInterface.setMaxTimer(time);
    },
});