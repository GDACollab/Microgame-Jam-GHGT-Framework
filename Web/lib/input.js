class MicrogameInput {
    // FIX to be a map for all games.
    static bindings = new Map([
        ["all", new Map([["ArrowUp", "ArrowUp"],
        ["ArrowDown", "ArrowDown"],
        ["ArrowRight", "ArrowRight"],
        ["ArrowLeft", "ArrowLeft"],
        [" ", " "]])]
    ]);
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
        this.#currBinding.forEach((keyToPress, binding) => {
            if (!this.#stateTracker.has(binding)) {
                this.#stateTracker.set(binding, {key: keyToPress, isDown: false});
            }
            var pastState = this.#stateTracker.get(binding);
            var currState = this.getInput(binding);
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
        document.body.addEventListener("keydown", this.#interruptInputDown.bind(this), {capture: true});
        document.getElementById("game").contentWindow.addEventListener("keydown", this.#interruptInputDown.bind(this), {capture: true});
        document.body.addEventListener("keyup", this.#interruptInputUp.bind(this), {capture: true});
        document.getElementById("game").contentWindow.addEventListener("keyup", this.#interruptInputUp.bind(this), {capture: true});
    }

    // TODO: Fix to work so that you can send keys in place of the standard arrows.
    #interruptInputDown(ev) {
        MicrogameKeyboard.allKeysDown.add(ev.key);
        if (this.constructor.baseBindings.includes(ev.key)) {
            return;
        } else {
            this.#keysToDown.add(ev.key);
            ev.preventDefault();
        }
    }

    #interruptInputUp(ev) {
        MicrogameKeyboard.allKeysDown.delete(ev.key);
        if (this.constructor.baseBindings.includes(ev.key)) {
            return;
        } else {
            this.#keysToDown.delete(ev.key);
            ev.preventDefault();
        }
    }

    getAnyInput() {
        var iter = MicrogameKeyboard.allKeysDown.values().next();
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
    
    #keysDown = new Set();
    #microgameInputs = { "keyboard": new MicrogameKeyboard()};

    constructor() {
        this.#defaultBindingStrings = this.getBindingsStrings("all");
    }

    get defaultBindingStrings() {
        return this.#defaultBindingStrings;
    }

    setBindingFromOption(game, direction, option) {
        option.forEach((bindingName, bindingObj) => {
            var map = bindingObj.type.bindings;
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
            map.set(game, binding.type.bindings.get("all"));
            this.#onUpdateDefaultBindingsCallbacks.delete(game);
        }
        
        map.get(game).set(binding.control, bindingName);
        if (game === "all") {
            this.#defaultBindingStrings = this.getBindingsStrings("all");
            this.#onUpdateDefaultBindingsCallbacks.forEach((callbackObj) => {
                if (callbackObj.dir === bindingName) {
                    callbackObj.callback(bindingName, binding);
                }
            });
        }
    }

    #onUpdateDefaultBindingsCallbacks = new Map();

    onUpdateDefaultBindings(gameName, dir, callback) {
        this.#onUpdateDefaultBindingsCallbacks.set(gameName, {callback: callback, dir: dir});
    }

    hasBinding(game, binding) {
        var map = binding.type.bindings;
        if (!map.has(game)) {
            return false;
        }
        return map.get(game).has(binding.control);
    }

    clearBindings(game, bindingName) {
        var map = binding.type.bindings;
        if (!map.has(game)) {
            map.set(game, binding.type.bindings.get("all"));
        }
        map.get(game).forEach((keyToPress, binding) => {
            if (keyToPress === bindingName) {
                map.get(game).delete(binding);
            }
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
            s[dirStringName] += "," + binding;
        });
        return s;
    }

    getBindingsStringsByBindingName(game) {
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
            s[dirStringName] += "," + binding;
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

    #pressKey(key, isDown) {
        document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent(`key${isDown}`, {
            key: key,
            code: (key === " ") ? "Space" : key
        }));
        
        document.body.dispatchEvent(new KeyboardEvent(`key${isDown}`, {
            key: key,
            code: (key === " ") ? "Space" : key
        }));
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
                        this.#pressKey(key, "down");
                    } else if (!isDown && this.#keysDown.has(key)) {
                        this.#keysDown.delete(key);
                        this.#pressKey(key, "up");
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