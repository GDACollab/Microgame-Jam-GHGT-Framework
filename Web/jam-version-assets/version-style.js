import { setUpGooglyEyes, updateGooglyEyes } from "./googly-eye.js";
import {TintColor} from "./TintColor.js";

var ini, MicrogameJamMainManager;

function versionStyleUpdate(isInGame) {
    updateGooglyEyes();

    if (isInGame) {
        timerUpdate();
    }
}

// Included in version-style because we might want to change how the timer animates based on the style.
function timerUpdate() {
    document.getElementById("timerFull").style.left = "-" + ((1 - GameInterface.getTimer()/GameInterface.getMaxTimer()) * 100) + "%";
    var timer = GameInterface.getTimer();
    if (timer !== -1 && timer <= 0) {
        if (ini["GamesConfig"]["slightly-more-time"].includes(MicrogameJamMainManager.GameLoader.currGame)) {
            if (GameInterface.getTimer() <= -0.2){
                GameInterface.loseGame();
            }
        } else {
            GameInterface.loseGame();
        }
    }
}

var yarnTintDat = [];

function initYarnTints(){
    var colors = ["#ff0000", "#00ff00", "#0000ff"];
    colors.forEach((c) => {
        new TintColor("./jam-version-assets/art/yarnpiece.png", c).run().then((dat) => {
            yarnTintDat.push(dat);
        }).catch((err) => {
            console.error(err);
        });
    });
}

function initVersionStyle(config, manager) {
    setUpGooglyEyes();
    initYarnTints();
    ini = config;
    MicrogameJamMainManager = manager;
}

export {initVersionStyle, versionStyleUpdate};