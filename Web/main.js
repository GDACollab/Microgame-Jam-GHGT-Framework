var masterVolume = 1;
var GameSound;
var GameAnimation;
var gameLoaded = false;

function setUpLifeCounter(numLives, lostLife) {
    for (var i = 0; i < numLives; i++) {
        document.getElementById("intactLifeDiv" + ((i > 0)? (i - 1) : "")).classList.add("active-lives");
    }

    var lostLifeDiv = document.getElementById("lostLifeDiv");
    var currPar = lostLifeDiv.parentNode;
    lostLifeDiv.parentNode.removeChild(lostLifeDiv);
    
    if (lostLife) {
        document.getElementById("intact-life" + ((numLives > 1) ? (numLives - 2) : "")).style.display = "none";

        var div = document.getElementById("intactLifeDiv" + ((numLives > 1) ? (numLives - 2) : ""));
        div.appendChild(lostLifeDiv);
        
        // You can manually set delays in the CCSS animation itself:
        GameAnimation.playKeyframedAnimation("CCSSGLOBALloseLife", {
            keepAnims: true
        });
    } else {
        currPar.appendChild(lostLifeDiv);
    }
}

function removeLives(numLives, lifeLost){
    document.querySelectorAll(".active-lives").forEach(function(element){
        element.classList.remove("active-lives");
    });

    if (lifeLost){
        document.getElementById("intact-life" + ((numLives > 1) ? (numLives - 2) : "")).style.display = "inherit";
    }
}

function debugLoopTransition(isWin){
    var winOrLose = (isWin)? "win" : "lose";

    var numLives = ini["Transitions"]["debug-lives"];
    
    setUpLifeCounter(numLives, ini["Transitions"]["debug-life-lost"] === "true");

    GameAnimation.playKeyframedAnimation(`CCSSGLOBAL${winOrLose}Animation`, {
        shouldLoop: function(){
            return ini["Transitions"]["debug-loop"] === "loop-end";
        },
        onFinish: function(){
        if (ini["Transitions"]["debug-loop"] === "loop"){
            removeLives(numLives, ini["Transitions"]["debug-life-lost"] === "true");
            GameAnimation.stopAllKeyframedAnimationOf("CCSSGLOBALloseLife");
            debugLoopTransition(isWin);
        }
    }});
}

var ini;
getConfig("./jam-version-assets/config.ini").then(function(res){
    ini = res;
    GameSound = new AudioManager();
    GameAnimation = new AnimationManager(document.getElementById("version-style").href);

    initGameLoader();

    initMenus();

    GameAnimation.evaluateMainSheet();

    if (ini["Transitions"].debug === "win") {
        debugLoopTransition(true);
        document.getElementById("transitionContainer").hidden = false;
        document.getElementById("winTransition").hidden = false;
    }

    if (ini["Transitions"].debug === "lose"){
        debugLoopTransition(false);
        document.getElementById("transitionContainer").hidden = false;
        document.getElementById("loseTransition").hidden = false;
    }

    GameSound.play("theme", masterVolume * 0.6, false, true);

    for (const button of document.querySelectorAll("[id*=\"Button\"]")) {
        button.addEventListener("mouseover", function(){
            GameSound.play("buttonHover", masterVolume, true);
        });

        button.addEventListener("click", function(){
            GameSound.play("buttonClick", masterVolume, true);
        });
    }
});

function startMicrogames(){
    gameLoaded = false;

    GameSound.stop("theme");
    GameInterface.init(gameStarted, transition);

    GameSound.play("buttonClick", masterVolume, true, false, function(){
        GameSound.play("winJingle", masterVolume * 0.8, true);
    });
    
    playTransition("win");

    setTimeout(function(){
        document.getElementById("menu").setAttribute("hidden", "");
    }, 500);
}

function gameStarted(){
    document.getElementById("game").removeAttribute("hidden");
    document.getElementById("timer").removeAttribute("hidden");
    gameLoaded = true;
}

function playTransition(winOrLose){
    document.getElementById("timer").setAttribute("hidden", "");
    document.getElementById("transitionContainer").removeAttribute("hidden");
    document.getElementById(winOrLose + "Transition").removeAttribute("hidden");

    let gameToLoad = getGameToLoad();

    var playTransitionPriorLoaded = false;

    var numLives = GameInterface.getLives();
    if (winOrLose === "lose") {
        // This is used purely for animation, so if we've lost a life, we add one to show the losing animation.
        numLives++;
    }

    setUpLifeCounter(numLives, winOrLose === "lose");

    GameAnimation.playKeyframedAnimation("CCSSGLOBAL" + winOrLose + "Animation", {
        shouldLoop: function(timestamp, animationObj){
            // Should we load when we're looping? If yes, we have to actually wait until we're looping.
            if (gamesConfig["play-transition-prior"].includes(gameToLoad) && !playTransitionPriorLoaded && "loop" in animationObj.timeline.get(animationObj.currKeyframePlaying)) {
                playTransitionPriorLoaded = true;
                loadGame(gameToLoad);
            }
            // Loop while our game isn't ready to start.
            return gameLoaded === false; 
        },
        onFinish: function () {
            document.getElementById(winOrLose + "Transition").setAttribute("hidden", "");
            document.getElementById("transitionContainer").setAttribute("hidden", "");
            removeLives(numLives, winOrLose === "lose");
        }
    });

    if (!(gamesConfig["play-transition-prior"].includes(gameToLoad))) {
        loadGame(gameToLoad);
    }
}

// TODO: Make game picking more robust, add difficulty increases, etc.
function transition(didWin, modifyDifficulty){
    gameLoaded = false;

    // Because Twine saves things to the session:
    sessionStorage.removeItem("Saved Session");

    // Difficulty change:
    if (DEBUG_DIFFICULTY >= 1 && DEBUG_DIFFICULTY <= 3 && Number.isInteger(DEBUG_DIFFICULTY)) {
        modifyDifficulty(DEBUG_DIFFICULTY);
    } else {
        modifyDifficulty(1);
    }
    
    
    var transitionName = (didWin)? "win" : "lose";

    GameSound.play(transitionName + "Jingle", masterVolume * 0.8, true);

    playTransition(transitionName);
}

// Gamepads support:

if (!!navigator.getGamepads) {
    var keysDown = new Set();
    window.setInterval(function(){
        for (var gamepad of navigator.getGamepads()) {
            if (gamepad === null){
                continue;
            }
            // Press "Up Arrow":
            if (gamepad.buttons[12].value > 0 || gamepad.axes[1] < -0.2 || gamepad.axes[3] < -0.2){
                // Send keydown event to the window of the iframe:
                document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'ArrowUp',
                    keyCode: 38,
                    which: 38,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false
                }));
                keysDown.add("up");
            } else if (keysDown.has("up")) {
                // Then cancel keydown once the input is done:
                document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent('keyup', {
                    key: 'ArrowUp',
                    keyCode: 38,
                    which: 38,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false
                }));
                keysDown.delete("up");
            }

            // Press "Down Arrow":
            if (gamepad.buttons[13].value > 0 || gamepad.axes[1] > 0.2 || gamepad.axes[3] > 0.2) {
                document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'ArrowDown',
                    keyCode: 40,
                    which: 40,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false
                }));
                keysDown.add("down");
            } else if (keysDown.has("down")) {
                document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent('keyup', {
                    key: 'ArrowDown',
                    keyCode: 40,
                    which: 40,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false
                }));
                keysDown.delete("down");
            }

            // Press "Left Arrow":
            if (gamepad.buttons[14].value > 0 || gamepad.axes[0] < -0.2 || gamepad.axes[2] < -0.2) {
                document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'ArrowLeft',
                    keyCode: 37,
                    which: 37,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false
                }));
                keysDown.add("left");
            } else if (keysDown.has("left")) {
                document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent('keyup', {
                    key: 'ArrowLeft',
                    keyCode: 37,
                    which: 37,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false
                }));
                keysDown.delete("left");
            }
            // Press "Right Arrow":
            if (gamepad.buttons[15].value > 0 || gamepad.axes[0] > 0.2 || gamepad.axes[2] > 0.2) {
                document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'ArrowRight',
                    keyCode: 39,
                    which: 39,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false
                }));
                keysDown.add("right");
            } else if (keysDown.has("right")) {
                document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent('keyup', {
                    key: 'ArrowRight',
                    keyCode: 39,
                    which: 39,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false
                }));
                keysDown.delete("right");
            }
            // Press "Space":
            if (gamepad.buttons[0].value > 0 || gamepad.buttons[6].value > 0.2 || gamepad.buttons[7].value > 0.2 || gamepad.buttons[9].value > 0.2) {
                document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent('keydown', {
                    key: ' ',
                    keyCode: 32,
                    which: 32,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false
                }));
                keysDown.add(" ");
            } else if (keysDown.has(" ")) {
                document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent('keyup', {
                    key: ' ',
                    keyCode: 32,
                    which: 32,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false
                }));
                keysDown.delete(" ");
            }
        }
    }, 50);
}