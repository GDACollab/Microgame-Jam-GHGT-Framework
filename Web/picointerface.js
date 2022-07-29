// This is NOT part of the extension (actually, Imma move this out of the extensions folder and into the web folder).
// This is used for communicating with PICO8 games and setting information to the relevant GPIO pins.

class PicoInterface {
    constructor() {
        this.gameStarted = false;
    }

    static isPicoRunning() {
        return (typeof pico8_gpio !== "undefined");
    }

    interfaceWithPico() {
        this.gameStarted = false;
        pico8_gpio[0] = 1;
        // Set max number of seconds:
        pico8_gpio[1] = 20;
        var update = this.picoUpdate;
        this.internalUpdate = window.setInterval(update, 100);
    }

    picoUpdate(){
        if (this.gameStarted === false) {
            // Set repeatedly until we're given the go-ahead to set otherwise:
            GameInterface.setMaxTimer(pico8_gpio[1]);
            if (pico8_gpio[2] === 1){
                this.gameStarted = true;
                GameInterface.gameStart();
            }
        } else {
            pico8_gpio[3] = GameInterface.getLives();
            pico8_gpio[4] = GameInterface.getDifficulty();
            pico8_gpio[5] = GameInterface.getTimer();
            var didLose = pico8_gpio[6];
            if (didLose > 0){
                clearInterval(this.internalUpdate);
                if (didLose <= 128) {
                    GameInterface.loseGame();
                } else if (didLose > 128) {
                    GameInterface.winGame();
                }
            }
        }
    }
}