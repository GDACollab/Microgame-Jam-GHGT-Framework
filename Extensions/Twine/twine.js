// Should be inserted into your Javascript story format:
var isGame = parent.GameInterface !== undefined && parent.GameInterface !== null;
var time = Date.now();
var maxSeconds = 20;

if (isGame) {
    parent.GameInterface.gameStart();
}

function updateVariables() {
    var variableNames = {};

    if (isGame){
        variableNames = {
            'seconds': parent.GameInterface.getTimer,
            'lives': parent.GameInterface.getLives,
            'difficulty': parent.GameInterface.getDifficulty
        };
    } else {
        variableNames = {
            'seconds': () => {var seconds = Math.floor(maxSeconds - ((Date.now() - time) / 1000));
            if (seconds <= 0) {
                if (isGame) {
                    parent.GameInterface.loseGame();
                } else {
                    alert("Game Lost!");
                }
            }
        },
            'lives': () => { return 3; },
            // Allow this to be set:
            'difficulty': () => { return 1; }
        };
    }
    Object.entries(variableNames).forEach(function([key, value]) {
        // TODO VARIABLE SETTER, DEPENDENT ON STORY FORMAT:
        variableSetter[key] = value();
    });
}

function functionCalls(){
    var functionNames = {};
    
    if (isGame){
        functionNames = {
            'WinGame': parent.GameInterface.winGame,
            'LoseGame': parent.GameInterface.loseGame,
            'SetMaxTimer': parent.GameInterface.setMaxTimer
        };
    } else {
        functionNames = {
            'WinGame': () => { alert("Game Won!"); },
            'LoseGame': () => { alert("Game Lost!"); },
            'SetMaxTimer': (seconds) => { maxSeconds = seconds; }
        }
    }

    Object.entries(functionNames).forEach(function([key, value]) {
        // TODO FUNCTION SETTER, DEPENDENT ON STORY FORMAT:
        functionSetter.SetKey(key, value);
    });
}

function twineUpdate(){
    updateVariables();
}

functionCalls();
setInterval(twineUpdate, 100);