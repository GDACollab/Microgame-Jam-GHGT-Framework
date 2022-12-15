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

    #currBinding = MicrogameInput.bindings.get("all");
    update() {
        var keysToPress = [];
        this.#currBinding.forEach((value, key) => {
            var i = this.getInput(key);
            keysToPress.push({"key": value, "isDown": i});
        }, this);
        return keysToPress;
    }


    gameStartInputUpdate(game) {
        if (this.constructor.bindings.has(game)){
            this.#currBinding = this.constructor.bindings.get(game);
        } else {
            this.#currBinding = this.constructor.bindings.get("all");
        }
    }
}

// Because the Keyboard API is still experimental, we're just going to use standard oninput stuff.
class MicrogameKeyboard extends MicrogameInput {

    #keysToDown = new Set();
    #allKeysDown = new Set();

    constructor() {
        super();
        document.body.addEventListener("keydown", this.#interruptInputDown.bind(this), {capture: true});
        document.getElementById("game").contentWindow.addEventListener("keydown", this.#interruptInputDown.bind(this), {capture: true});
        document.body.addEventListener("keyup", this.#interruptInputUp.bind(this), {capture: true});
        document.getElementById("game").contentWindow.addEventListener("keyup", this.#interruptInputUp.bind(this), {capture: true});
    }

    // TODO: Fix to work so that you can send keys in place of the standard arrows.
    #interruptInputDown(ev) {
        this.#allKeysDown.add(ev.key);
        if (this.constructor.baseBindings.includes(ev.key)) {
            return;
        } else {
            this.#keysToDown.add(ev.key);
            ev.preventDefault();
        }
    }

    #interruptInputUp(ev) {
        this.#allKeysDown.delete(ev.key);
        if (this.constructor.baseBindings.includes(ev.key)) {
            return;
        } else {
            this.#keysToDown.delete(ev.key);
            ev.preventDefault();
        }
    }

    getAnyInput() {
        var iter = this.#allKeysDown.values().next();
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
    #defaultBindings = new Map(MicrogameInput.bindings.get("all"));
    
    #keysDown = new Set();
    #microgameInputs = { "keyboard": new MicrogameKeyboard()};

    constructor() {
        this.#defaultBindingStrings = this.getBindingsStrings("all");
    }

    get defaultBindingStrings() {
        return this.#defaultBindingStrings;
    }

    addBinding(game, bindingName, binding){
        var map = binding.type.bindings;
        if (!map.has(game)) {
            map.set(game, this.#defaultBindings);
        }
        
        map.get(game).set(binding.control, bindingName);
    }

    getBindingsStrings(game) {
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
            if (dir === " ") {
                dirStringName = "space";
            }
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
            if (any !== null){
                this.#captureNextCallback(any);
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

export default GlobalInputManager;