import GlobalGameLoader from "../gameloader.js";

class MicrogameInput {
    // FIX to be a map for all games.
    static bindings = new Map([["all", new Map([["w", "ArrowUp"], ["s", "ArrowDown"], ["a", "ArrowLeft"], ["d", "ArrowRight"]])]]);
    static baseBindings = ["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", " "];
    
    #stateTracker = new Map();
    #currBinding = MicrogameInput.bindings.get("all");
    constructor() {
        this.#currBinding.forEach((keyToPress, binding) => {
            this.#stateTracker.set(binding, {key: keyToPress, isDown: false});
        }, this);
    }

    update() {
        var keysToPress = [];
        
        // We also want to include the "all" inputs:
        MicrogameInput.bindings.get("all").forEach((keyToPress, binding) => {
            if (!this.#stateTracker.has(binding)) {
                this.#stateTracker.set(binding, {key: keyToPress, isDown: false, binding: binding});
            }
            var pastState = this.#stateTracker.get(binding);
            var currState = this.getInput(binding);
            if (pastState.isDown !== currState) {
                var updatedState = {key: keyToPress, isDown: currState, binding: binding};
                keysToPress.push(updatedState);
                this.#stateTracker.set(binding, updatedState);
            }
        });

        this.#currBinding.forEach((keyToPress, binding) => {
            if (!this.#stateTracker.has(binding)) {
                this.#stateTracker.set(binding, {key: keyToPress, isDown: false, binding: binding});
            }
            var pastState = this.#stateTracker.get(binding);
            var currState = this.getInput(binding);
            // We prioritize the current binding's keybinds:
            if (pastState.key !== keyToPress) {
                var update = keysToPress.findIndex(key => key.binding === binding);
                if (update !== undefined) {
                    keysToPress.splice(update, 1);
                }
            }
            if (pastState.isDown !== currState) {
                var updatedState = {key: keyToPress, isDown: currState};
                keysToPress.push(updatedState);
                this.#stateTracker.set(binding, updatedState);
            }
        }, this);
        return keysToPress;
    }


    gameStartInputUpdate(game) {
        if (this.constructor.bindings.has(game)){
            this.#currBinding = this.constructor.bindings.get(game);
        } else {
            this.#currBinding = this.constructor.bindings.get("all");
        }
        this.#stateTracker = new Map();
        this.#currBinding.forEach((keyToPress, binding) => {
            this.#stateTracker.set(binding, {key: keyToPress, isDown: false});
        }, this);
    }
}

// Because the Keyboard API is still experimental, we're just going to use standard oninput stuff.
class MicrogameKeyboard extends MicrogameInput {

    #keysToDown = new Set();
    static allKeysDown = new Set();

    constructor() {
        super();
        window.addEventListener("keydown", this.#interruptInputDown.bind(this), {capture: true});
        document.getElementById("game").contentWindow.addEventListener("keydown", this.#interruptInputDown.bind(this), {capture: true});
        window.addEventListener("keyup", this.#interruptInputUp.bind(this), {capture: true});
        document.getElementById("game").contentWindow.addEventListener("keyup", this.#interruptInputUp.bind(this), {capture: true});
    }

    // TODO: Fix to work so that you can send keys in place of the standard arrows.
    #interruptInputDown(ev) {
        MicrogameKeyboard.allKeysDown.add(ev.key);
        if (this.constructor.baseBindings.includes(ev.key)) {
            if (GlobalGameLoader.inGame && !(("location" in ev.target) && ev.target.location.href === document.getElementById("game").contentWindow.location.href)) {
                // For Unity games, we have to pass keyboard controls directly to the game in the iframe:
                MicrogameInputManager.pressKey(ev.key, "down");
            }
            return;
        } else {
            this.#keysToDown.add(ev.key);
            ev.preventDefault();
        }
    }

    #interruptInputUp(ev) {
        MicrogameKeyboard.allKeysDown.delete(ev.key);
        if (this.constructor.baseBindings.includes(ev.key)) {
            if (GlobalGameLoader.inGame && !(("location" in ev.target) && ev.target.location.href === document.getElementById("game").contentWindow.location.href)) {
                // For Unity games, we have to pass keyboard controls directly to the game in the iframe:
                MicrogameInputManager.pressKey(ev.key, "up");
            }
            return;
        } else {
            this.#keysToDown.delete(ev.key);
            ev.preventDefault();
        }
    }

    getAnyInput() {
        var iter = this.#keysToDown.values().next();
        if (!iter.done) {
            return {control: iter.value, type: MicrogameKeyboard};
        }
        return null;
    }

    getInput(control) {
        return this.#keysToDown.has(control);
    }

    gameStartInputUpdate(game) {
        super.gameStartInputUpdate(game);
        document.getElementById("game").contentWindow.addEventListener("keydown", this.#interruptInputDown.bind(this), {capture: true});
        document.getElementById("game").contentWindow.addEventListener("keyup", this.#interruptInputUp.bind(this), {capture: true});
    }
}

class MicrogameGamepad extends MicrogameInput {
    #gamepad;
    #sensitivity = 0.4;
    static bindings = new Map([
        ["all", new Map([["-axes1", "ArrowUp"],
        ["axes1", "ArrowDown"],
        ["-axes0", "ArrowLeft"],
        ["axes0", "ArrowRight"],
        ["buttons0", " "]])]
    ]);

    constructor(gamepad) {
        super();
        this.#gamepad = gamepad;
    }

    #inputMatch = /(-)?(axes|buttons)(\d)+/;

    getInput(control) {
        if (typeof control === "string"){
            var inputVal = this.#inputMatch.exec(control);
            var val = this.#gamepad[inputVal[2]][inputVal[3]];
            if (val instanceof GamepadButton){
                val = val.value;
            }
            return ((inputVal[1] === "-") ? -1 : 1) * val >= this.#sensitivity;
        }
    }

    getAnyInput() {
        this.#gamepad.axes.forEach((axis, index) => {
            if (this.getInput("axes" + index)) {
                return { control: "axes" + index, type: MicrogameGamepad};
            } else if (this.getInput("-axes" + index)) {
                return {control: "-axes" + index, type: MicrogameGamepad};
            }
        }, this);
        this.#gamepad.buttons.forEach((button, index) => {
            if (this.getInput("buttons" + index)) {
                return {control: "buttons" + index, type: MicrogameGamepad};
            }
        }, this);
        return null;
    }
}

class MicrogameInputManager {
    #defaultBindingStrings = {};
    #defaultBindingStringsByBindingName = {};
    #defaultBindings;
    
    #keysDown = new Set();
    #microgameInputs = { "keyboard": new MicrogameKeyboard()};

    constructor() {
        this.#defaultBindings = this.getAllBindings("all");
        this.#defaultBindingStrings = this.getBindingsStrings("all");
        this.#defaultBindingStringsByBindingName = this.getBindingsStringsByBindingName("all");
    }

    get defaultBindingStrings() {
        return this.#defaultBindingStrings;
    }

    setBindingFromOption(game, direction, option) {
        option.forEach((bindingObj, bindingName) => {
            var type = bindingObj.type;
            if (type === "MicrogameKeyboard") {
                type = MicrogameKeyboard;
            } else if (type === "MicrogameGamepad") {
                type = MicrogameGamepad;
            }
            var map = type.bindings;
            if (!map.has(game)){
                map.set(game, bindingObj.type.bindings.get("all"));
            }
            map.get(game).set(bindingName, direction);
        });
    }

    hasAdjustedBindings(game) {
        return MicrogameKeyboard.bindings.has(game) || MicrogameGamepad.bindings.has(game);
    }

    getAllBindings(game) {
        var bindings = {};

        MicrogameKeyboard.bindings.get(game).forEach((keyToPress, binding) => {
            var bindingObj = {control: binding, type: MicrogameKeyboard};
            if (keyToPress in bindings) {
                bindings[keyToPress].set(binding, bindingObj);
            } else {
                bindings[keyToPress] = new Map([[binding, bindingObj]]);
            }
        });
        MicrogameGamepad.bindings.get(game).forEach((keyToPress, binding) => {
            var bindingObj = {control: binding, type: MicrogameGamepad};
            if (keyToPress in bindings) {
                bindings[keyToPress].set(binding, bindingObj);
            } else {
                bindings[keyToPress] = new Map([[binding, bindingObj]]);
            }
        });
        return bindings;
    }

    addBinding(game, bindingName, binding){
        var map = binding.type.bindings;
        if (!map.has(game)) {
            MicrogameGamepad.bindings.set(game, MicrogameGamepad.bindings.get("all"));
            MicrogameKeyboard.bindings.set(game, MicrogameKeyboard.bindings.get("all"));
        }
        
        map.get(game).set(binding.control, bindingName);
    }

    hasBinding(game, binding) {
        var map = binding.type.bindings;
        if (!map.has(game)) {
            return false;
        }
        return {has: map.get(game).has(binding.control), bindingName: map.get(game).get(binding.control)};
    } 

    clearBindings(game, bindingName) {
        if (!this.hasAdjustedBindings(game)) {
            MicrogameGamepad.bindings.set(game, MicrogameGamepad.bindings.get("all"));
            MicrogameKeyboard.bindings.set(game, MicrogameKeyboard.bindings.get("all"));
        }

        MicrogameGamepad.bindings.get(game).forEach((keyToPress, binding) => {
            if (keyToPress === bindingName) {
                MicrogameGamepad.bindings.get(game).delete(binding);
            }
        });
        MicrogameKeyboard.bindings.get(game).forEach((keyToPress, binding) => {
            if (keyToPress === bindingName) {
                MicrogameKeyboard.bindings.get(game).delete(binding);
            }
        });
    }

    resetBindings(game, bindingName) {
        this.#defaultBindings[bindingName].forEach((bindingObj, binding) => {
            bindingObj.type.bindings.get(game).set(binding, bindingName);
        });
    }

    getBindingsStrings(game) {
        if (!this.hasAdjustedBindings(game)) {
            return this.#defaultBindingStrings;
        }
        var s = {};
        MicrogameKeyboard.bindings.get(game).forEach((dir, binding) => {
            var dirStringName = dir.replace("Arrow", "").toLowerCase();
            if (dir === " ") {
                dirStringName = "space";
            }
            var stringToAdd = binding;
            if (stringToAdd === " ") {
                stringToAdd = "Space";
            }
            if (dirStringName in s) {
                s[dirStringName] += "," + stringToAdd;
            } else {
                s[dirStringName] = stringToAdd;
            }
        });

        MicrogameGamepad.bindings.get(game).forEach((dir, binding) => {
            var dirStringName = dir.replace("Arrow", "").toLowerCase();
            if (dir === " ") {
                dirStringName = "space";
            }
            if (dirStringName in s) {
                s[dirStringName] += "," + binding;
            } else {
                s[dirStringName] = binding;
            }
        });
        return s;
    }

    getBindingsStringsByBindingName(game) {
        if (!this.hasAdjustedBindings(game)) {
            return this.#defaultBindingStringsByBindingName;
        }
        var s = {};
        MicrogameKeyboard.bindings.get(game).forEach((dir, binding) => {
            var dirStringName = dir;
            var stringToAdd = binding;
            if (stringToAdd === " ") {
                stringToAdd = "Space";
            }
            if (dirStringName in s) {
                s[dirStringName] += "," + stringToAdd;
            } else {
                s[dirStringName] = stringToAdd;
            }
        });

        MicrogameGamepad.bindings.get(game).forEach((dir, binding) => {
            var dirStringName = dir;
            if (dirStringName in s) {
                s[dirStringName] += "," + binding;
            } else {
                s[dirStringName] = binding;
            }
        });
        return s;
    }

    getAnyInput() {
        for (var input in this.#microgameInputs) {
            var any = this.#microgameInputs[input].getAnyInput();
            if (any !== null) {
                return any;
            }
        }
        return null;
    }

    #captureNextCallback = null;
    captureNextInput(callback) {
        this.#captureNextCallback = callback;
    }
    cancelCaptureInput() {
        this.#captureNextCallback = null;
    }

    static pressKey(key, isDown) {
        if (GlobalGameLoader.inGame) {
            var keyCodeConvert = {
                "ArrowLeft": 37,
                "ArrowRight": 39,
                "ArrowUp": 38,
                "ArrowDown": 40,
                " ": 32
            };
            document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent(`key${isDown}`, {
                key: key,
                charCode: 0,
                code: (key === " ") ? "Space" : key,
                // It's no surprise that Untiy WebGL is completely archaic and requires key codes to function properly:
                keyCode: keyCodeConvert[key],
                // Construct 3 is just like Unity in that it uses a deprecated keyCode feature...
                // Except it uses an entirely different property that has the same value. Go figure.
                which: keyCodeConvert[key]
            }));
        } else {
            document.body.dispatchEvent(new KeyboardEvent(`key${isDown}`, {
                key: key,
                code: (key === " ") ? "Space" : key
            }));
        }
    }

    updateInput() {
        if (!!navigator.getGamepads) {
            for (var gamepad of navigator.getGamepads()) {
                if (gamepad === null) {
                    continue;
                }
                if (!(gamepad.id in this.#microgameInputs)) {
                    this.#microgameInputs[gamepad.id] = new MicrogameGamepad(gamepad);
                }
            }
        }
        if (this.#captureNextCallback !== null) {
            var any = this.getAnyInput();
            // If the callback accepts the input we give it.
            if (this.#captureNextCallback(any)) {
                this.#captureNextCallback = null;
            }
        } else {
            for (var input in this.#microgameInputs) {
                var keysToPress = this.#microgameInputs[input].update();
                keysToPress.forEach((keyObj) => {
                    var isDown = keyObj.isDown;
                    var key = keyObj.key;
                    if (isDown && !this.#keysDown.has(key)) {
                        this.#keysDown.add(key);
                        MicrogameInputManager.pressKey(key, "down");
                    } else if (!isDown && this.#keysDown.has(key)) {
                        this.#keysDown.delete(key);
                        MicrogameInputManager.pressKey(key, "up");
                    }
                });
            }
        }
    }

    gameStartInputUpdate(game) {
        for (var input in this.#microgameInputs) {
            this.#microgameInputs[input].gameStartInputUpdate(game);
        }
    }
}

var GlobalInputManager = new MicrogameInputManager();

export {GlobalInputManager as default, MicrogameKeyboard};