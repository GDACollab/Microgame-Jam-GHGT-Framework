// This is a test script

// Fetch the MicrogameJamController Singleton
import {MicrogameJamController} from "./microgamejamcontroller.js";

// Instantiates Game Controller
var test = MicrogameJamController(1,3,true);

// Choose how many seconds the game will last, max 15 seconds.
test.SetMaxTimer(15, restartMethod);

// Test one of the methods, should output 3 into the console.
console.log(test.GetLives());

// Method will be called everytime game is restarted
function restartMethod(){
    console.log("Game just restarted!");
}

// Note: On Chrome to see console.log outputs, go to "more tools" then "developer tools"
