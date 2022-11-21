class MicrogameGamepad {
    constructor(gamepad) {
        this.gamepad = gamepad;
    }
    
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