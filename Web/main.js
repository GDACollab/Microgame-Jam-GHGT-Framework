var GameSound = new AudioManager();

var masterVolume = 1;

window.onload = function(){
    GameSound.play("theme", masterVolume * 0.6, false, true);
    
    for (const button of document.getElementsByTagName("button")) {
        button.addEventListener("mouseover", function(){
            GameSound.play("buttonHover", masterVolume, true);
        });

        button.addEventListener("onclick", function(){
            GameSound.play("buttonClick", masterVolume, true);
        });
    }
}


function startMicrogames(){
    GameSound.stop("theme");
    GameInterface.init(gameStarted,
        () => {transition(true);}, () => {transition(false);});
    document.getElementById("menu").setAttribute("hidden", "");
    document.getElementById("transitionContainer").removeAttribute("hidden");
    GameSound.play("buttonClick", masterVolume, true, false, function(){
        GameSound.play("winJingle", masterVolume * 0.8, true);
    });
    loadGame();
}

function gameStarted(){
    document.getElementById("transitionContainer").setAttribute("hidden", "");
    document.getElementById("game").removeAttribute("hidden");
}

function transition(didWin){
    if (didWin){
        GameSound.play("winJingle", masterVolume * 0.8, true);
    } else {
        GameSound.play("loseJingle", masterVolume * 0.8, true);
    }
    document.getElementById("transitionContainer").removeAttribute("hidden");
    if (didWin){
        document.getElementById("transitionContainer").innerText = "WIN TRANSITION HERE";
    } else {
        document.getElementById("transitionContainer").innerText = "LOSE TRANSITION HERE";
    }
    loadGame();
}