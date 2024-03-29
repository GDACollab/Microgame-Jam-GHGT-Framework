/**
 * For storing pico interface.
 * @file
 */

/**
 * For interfacing with PICO-8
 * @module picointerface
 */

/**
 * This is used for communicating with PICO8 games and setting information to the relevant GPIO pins.
 */
class PicoInterface {
    constructor() {
        this.gameStarted = false;
    }

    /**
     * 
     * @returns {boolean} If PICO-8 is detected as running.
     */
    static isPicoRunning() {
        // Search the game frame:
        return (typeof document.getElementById("game").contentWindow.pico8_gpio !== "undefined");
    }

    /**
     * Connect with a PICO-8 game.
     */
    interfaceWithPico() {
        // Tell PICO to start automatically if needed:
        var p8Button = document.getElementById("game").contentDocument.getElementById("p8_start_button");
        if (p8Button !== null){
            p8Button.click();
        }


        // Mute sound (That start-up sound that plays every time and gets annoying fast):
        document.getElementById("game").contentWindow.pico8_audio_context.suspend();

        /**
         * PICO-8's GPIO pins to connect with.
         * @type {Array.<number>}
         */
        this.pico8_gpio = document.getElementById("game").contentWindow.pico8_gpio;

        /**
         * Has PICO-8 started?
         * @type {boolean}
         */
        this.gameStarted = false;
        this.pico8_gpio[0] = 1;
        // Set max number of seconds:
        this.pico8_gpio[1] = 15;
    }

    /**
     * Update PICO-8 interface every frame to interface with the GPIO pins. Called by {@link module:gameloader~GameLoader#loadUpdate}.  
     * @param {PicoInterface} self 
     * @todo Is the parameter self even needed? What is this doing here? gameloader doesn't even set it.
     */
    picoUpdate(self){
        if (self.gameStarted === false) {
            // Set repeatedly until we're given the go-ahead to set otherwise:
            GameInterface.setMaxTimer(self.pico8_gpio[1]);
            if (self.pico8_gpio[2] === 1){
                self.gameStarted = true;
                // Unmute sound:
                document.getElementById("game").contentWindow.pico8_audio_context.resume();
                GameInterface.gameStart();
            }
        } else {
            self.pico8_gpio[3] = GameInterface.getLives();
            self.pico8_gpio[4] = GameInterface.getDifficulty();
            self.pico8_gpio[5] = GameInterface.getTimer();
            var didLose = self.pico8_gpio[6];
            if (didLose > 0){
                clearInterval(self.internalUpdate);
                if (didLose <= 128) {
                    GameInterface.loseGame();
                } else if (didLose > 128) {
                    GameInterface.winGame();
                }
            }
        }
    }
}

export {PicoInterface};