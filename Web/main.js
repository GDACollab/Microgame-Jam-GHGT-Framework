var GameSound = new AudioManager();

window.onload = function(){
    GameSound.play("theme");
    
    document.getElementsByTagName("button").forEach(function(button){
        button.onmouseover = function(){
            GameSound.play("buttonHover", true);
        };

        button.onclick = function(){
            GameSound.play("buttonClick", true);
        };
    });
}


function startMicrogames(){
    GameSound.stop("theme");
    GameInterface.init(gameStarted,
        () => {transition(true);}, () => {transition(false);});
    document.getElementById("menu").setAttribute("hidden", "");
    document.getElementById("transitionContainer").removeAttribute("hidden");
    GameSound.play("winJingle", true);
    loadGame();
}

function gameStarted(){
    document.getElementById("transitionContainer").setAttribute("hidden", "");
    document.getElementById("game").removeAttribute("hidden");
}

function transition(didWin){
    if (didWin){
        GameSound.play("winJingle", true);
    } else {
        GameSound.play("loseJingle", true);
    }
    document.getElementById("transitionContainer").removeAttribute("hidden");
    if (didWin){
        document.getElementById("transitionContainer").innerText = "WIN TRANSITION HERE";
    } else {
        document.getElementById("transitionContainer").innerText = "LOSE TRANSITION HERE";
    }
    loadGame();
}