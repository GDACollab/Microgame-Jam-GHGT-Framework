import GlobalGameLoader from "../gameloader.js";
/**
 * For managing global inputs.
 * @file
 */

/** 
 * Input module, for detecting global keyboard and controller input.
 * @module input
*/

/**
 * Controls keyboard and controller support for interacting with menus and games. Will disable some inputs from going through unless it recognizes them.
 *
 * @class MicrogameInput
 */
class MicrogameInput {
    /**
     * A map of maps.
     * The bindings to use for each game (or all of them).
     * @todo FIX to be a map for all games.
     * @static
     */
    static bindings = new Map([["all", new Map([["w", "ArrowUp"], ["s", "ArrowDown"], ["a", "ArrowLeft"], ["d", "ArrowRight"]])]]);
    /**
     * Bindings to allow input for no matter what.
     * @static
     */
    static baseBindings = ["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", " "];
    
    /** 
     * What keys/controls are currently being used. Used in {@link module:input~MicrogameInput#update} exclusively.
    */
    #stateTracker = new Map();
    /** 
     * The current set of bindings we’re using from this.bindings. Set in {@link module:input~MicrogameInput#gameInputStartUpdate} based on the current game being played.
    */
    #currBinding;
    constructor() {
        this.#currBinding = this.constructor.bindings.get("all");
        this.#currBinding.forEach((keyToPress, binding) => {
            this.#stateTracker.set(binding, {key: keyToPress, isDown: false});
        }, this);
    }

    /**
     * Called by MicrogameInputManager. Updates {@link module:input~MicrogameInput#stateTracker} based on inputs it detects.
     * @returns The keys that we're going to be pressing based on our recieved inputs.
     */
    update() {
        var keysToPress = [];
        
        // We also want to include the "all" inputs:
        this.constructor.bindings.get("all").forEach((keyToPress, binding) => {
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
        }, this);

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


    /**
     * Resets {@link module:input~MicrogameInput#stateTracker} and {@link module:input~MicrogameInput#currBinding} based on game. If the game’s bindings exist in MicrogameInput.baseBindings, use those. Otherwise, use “all”.
     * @param {string} game Current game being played.
     */
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

/**
 * Keyboard bindings.
 * Because the Keyboard API is still experimental, we're just going to use standard oninput stuff.
 * @class MicrogameKeyboard
 * @extends module:input~MicrogameInput
 */
class MicrogameKeyboard extends MicrogameInput {

    /** 
     * Set of keys that are currently being pressed. Accessed through {@link module:input~MicrogameKeyboard#getAnyInput} and {@link module:input~MicrogameKeyboard#getInput}.
    */
    #keysToDown = new Set();
    /**
     *
     * Set of keys used across all MicrogameKeyboards to list all keys currently being pressed.
     * Set in {@link module:input~MicrogameKeyboard#interruptInputUp} and {@link module:input~MicrogameKeyboard#interruptInputDown}.
     * Used only in {@link module:optionsmanager}.
     * @static
     */
    static allKeysDown = new Set();

    /**
     * The HREF of the current game loaded. Used to ignore key presses if a keyboard event is targeting the gameLocation.
     * @private
     */
    #gameLocation;

    constructor() {
        super();
        window.addEventListener("keydown", this.#interruptInputDown.bind(this), {capture: true});
        document.getElementById("game").contentWindow.addEventListener("keydown", this.#interruptInputDown.bind(this), {capture: true});
        window.addEventListener("keyup", this.#interruptInputUp.bind(this), {capture: true});
        document.getElementById("game").contentWindow.addEventListener("keyup", this.#interruptInputUp.bind(this), {capture: true});
    }

    /**
     * When any key is pressed, check to see if it’s a {@link module:input~MicrogameKeyboard#baseBindings|baseBinding} (i.e., an allowed keyboard press). If so, press it. If not, add it to the list of keys to be queried for input ({@link module:input~MicrogameKeyboard#keysToDown}).
     * @private
     * @alias module:input~MicrogameKeyboard#interruptInputDown
     * @todo Fix to work so that you can send keys in place of the standard arrows.
     */
    #interruptInputDown(ev) {
        MicrogameKeyboard.allKeysDown.add(ev.key);
        if (this.constructor.baseBindings.includes(ev.key)) {
            if (GlobalGameLoader.inGame && !(("location" in ev.target && ev.target.location.href === this.#gameLocation) || (("baseURI" in ev.target) && ev.target.baseURI === this.#gameLocation))) {
                // For Unity games, we have to pass keyboard controls directly to the game in the iframe:
                MicrogameInputManager.pressKey(ev.key, "down");
            }
            return;
        } else {
            this.#keysToDown.add(ev.key);
            ev.preventDefault();
        }
    }

    /**
     * {@link module:input~MicrogameKeyboard#interruptInputDown}, but for when keys are released. And so delete from {@link module:input~MicrogameKeyboard#keysToDown}.
     * @alias module:input~MicrogameKeyboard#interruptInputUp
     */
    #interruptInputUp(ev) {
        MicrogameKeyboard.allKeysDown.delete(ev.key);
        if (this.constructor.baseBindings.includes(ev.key)) {
            if (GlobalGameLoader.inGame && !(("location" in ev.target && ev.target.location.href === this.#gameLocation) || (("baseURI" in ev.target) && ev.target.baseURI === this.#gameLocation))) {
                // For Unity games, we have to pass keyboard controls directly to the game in the iframe:
                MicrogameInputManager.pressKey(ev.key, "up");
            }
            return;
        } else {
            this.#keysToDown.delete(ev.key);
            ev.preventDefault();
        }
    }

    /**
     * @returns {object} {control: key, type: MicrogameKeyboard} being pressed if it detects any input. null otherwise.
     */
    getAnyInput() {
        var iter = this.#keysToDown.values().next();
        if (!iter.done) {
            return {control: iter.value, type: MicrogameKeyboard};
        }
        return null;
    }

    /**
     * 
     * @param {string} control The key code that we’re checking for
     * @returns {boolean} Is the key code that we’re checking for being pressed?
     */
    getInput(control) {
        return this.#keysToDown.has(control);
    }

    /**
     * Called whenever a game starts. Resets the {@link module:input~MicrogameKeyboard#interruptInput} Down and Up bindings. Also sets {@link module:input~MicrogameKeyboard#gameLocation}.
     * @param {string} game {@link module:gameloader~GameLoader#game}
     */
    gameStartInputUpdate(game) {
        super.gameStartInputUpdate(game);
        document.getElementById("game").contentWindow.addEventListener("keydown", this.#interruptInputDown.bind(this), {capture: true});
        document.getElementById("game").contentWindow.addEventListener("keyup", this.#interruptInputUp.bind(this), {capture: true});
        this.#gameLocation = document.getElementById("game").contentWindow.location.href;
    }
}

/**
 * For controlling the game by gamepad.
 * Translates gamepad input to keyboard output.
 * @extends module:input~MicrogameInput
 */
class MicrogameGamepad extends MicrogameInput {
    /**
     * Reference to the gamepad from the [Gamepad API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API}
     */
    #gamepad;
    /**
     * How much input do we want to recieve from a gamepad before we translate it into output?
     */
    #sensitivity = 0.4;
    /**
     * Binding of [Gamepad API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API} specific controls to key codes.
     */
    static bindings = new Map([
        ["all", new Map([["-axes1", "ArrowUp"],
        ["axes1", "ArrowDown"],
        ["-axes0", "ArrowLeft"],
        ["axes0", "ArrowRight"],
        ["buttons0", " "]])]
    ]);

    /**
     * @constructs MicrogameGamepad
     * @param {Gamepad} gamepad A gamepad from the [Gamepad API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API}
     */
    constructor(gamepad) {
        super();
        this.#gamepad = gamepad;
    }

    /**
     * Regex to match input values.
     * @default /(-)?(axes|buttons)(\d)+/
     */
    #inputMatch = /(-)?(axes|buttons)(\d)+/;

    /**
     * 
     * @param {string} control 
     * @returns {boolean} if the control is being pressed.
     */
    getInput(control) {
        if (typeof control === "string"){
            var inputVal = this.#inputMatch.exec(control);
            if (inputVal !== null) {
                var val = this.#gamepad[inputVal[2]][inputVal[3]];
                if (val instanceof GamepadButton){
                    val = val.value;
                }
                return ((inputVal[1] === "-") ? -1 : 1) * val >= this.#sensitivity;
            } else {
                return false;
            }
        }
    }

    /**
     * 
     * @returns If any input from the gamepad is being pressed.
     */
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

/**
 * Manages ALL inputs for the Microgame Jam.
 */
class MicrogameInputManager {
    /**
     * Default dictionary of how arrow key presses are controlled by bindings.
     * @default getBindingsStrings("all")
     * @see {@link module:input~MicrogameInputManager#getBindingsStrings}
     * @type {Object.<string, string>}
     */
    #defaultBindingStrings = {};
    /**
     * Default list of how arrow key presses are controlled by bindings.
     * @default getBindingsStringsByBindingName("all")
     * @see {@link module:input~MicrogameInputManager#getBindingsStringsByBindingName}
     * @type {Object.<string, string>}
     */
    #defaultBindingStringsByBindingName = {};
    /**
     * Default bindings for controls.
     * Set in constructor.
     * @default getBindings("all")
     * @see {@link module:input~MicrogameInputManager#getAllBindings, getAllBindings("all")}
     * @type {Object.<string, Map.<string, type>>}
     */
    #defaultBindings;
    
    /**
     * The keys currently being pressed.
     * @type {Set}
     */
    #keysDown = new Set();
    /**
     * List of all input methods.
     * @default {"keyboard": new MicrogameKeyboard()};
     */
    #microgameInputs = { "keyboard": new MicrogameKeyboard()};

    /**
     * @constructs MicrogameInputManager
     */
    constructor() {
        this.#defaultBindings = this.getAllBindings("all");
        this.#defaultBindingStrings = this.getBindingsStrings("all");
        this.#defaultBindingStringsByBindingName = this.getBindingsStringsByBindingName("all");
    }

    /**
     * Returns {@link module:input~MicrogameInputManager#defaultBindingStrings}
     * @readonly
     */
    get defaultBindingStrings() {
        return this.#defaultBindingStrings;
    }

    /**
     * Called exclusively by {@link module:optionsmanager.OptionsManager}.
     * @param {string} game Game Name 
     * @param {string} direction Something like "ArrowUp" or "ArrowLeft".
     * @param {Array.<{type: type, control: string}, string>} option Settings array for one direction from one game.
     */
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

    /**
     * Does the current game differ from our default bindings?
     * @param {string} game  Game Name
     * @returns {boolean}
     */
    hasAdjustedBindings(game) {
        return MicrogameKeyboard.bindings.has(game) || MicrogameGamepad.bindings.has(game);
    }

    /**
     * 
     * @param {string} game Game Name 
     * @returns {Object.<string, Map.<string, type>>} A dictionary of bindings by the keys to press. Each binding associates with a map that associates with a specific control (i.e., an input from {@link module:input~MicrogameInput}) and the associated type of {@link module:input~MicrogameInput}. 
     */
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

    /**
     * 
     * @param {string} game  Game Name
     * @param {string} bindingName The arrow key to bind to as what's pressed when binding is pressed (it's confusing, I'm sorry)
     * @param {{control: string, type: type}} binding The control pressed to add as a binding. Grabbed from {@link module:input~MicrogameInput} from children's getAnyInput function.
     */
    addBinding(game, bindingName, binding){
        var map = binding.type.bindings;
        if (!map.has(game)) {
            MicrogameGamepad.bindings.set(game, MicrogameGamepad.bindings.get("all"));
            MicrogameKeyboard.bindings.set(game, MicrogameKeyboard.bindings.get("all"));
        }
        
        map.get(game).set(binding.control, bindingName);
    }

    /**
     * 
     * @param {string} game Game Name 
     * @param {{control: string, type: type}} binding The control that's been pressed.
     * @returns {boolean} Is this control bound somewhere?
     */
    hasBinding(game, binding) {
        var map = binding.type.bindings;
        if (!map.has(game)) {
            return false;
        }
        return {has: map.get(game).has(binding.control), bindingName: map.get(game).get(binding.control)};
    } 

    /**
     * Clear all the bindings for a given game and direction.
     * @param {string} game Game Name 
     * @param {string} bindingName Direction (ArrowUp, ArrowLeft, etc.)
     */
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

    /**
     * Reset a game's bindings to their default values.
     * @param {string} game Game Name 
     * @param {string} bindingName Direction (ArrowUp, ArrowLeft, etc.)
     */
    resetBindings(game, bindingName) {
        this.#defaultBindings[bindingName].forEach((bindingObj, binding) => {
            bindingObj.type.bindings.get(game).set(binding, bindingName);
        });
    }

    /**
     * 
     * @param {string} game Game Name
     * @returns {Object.<string, string>} Dictionary of how arrow key presses relate to input bindings (i.e., what bindings represent what arrow key presses, but in reverse.)
     */
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

    /**
     * Like {@link module:input~MicrogameInputManager#getBindingsStrings}, except meant to be formatted in a more display friendly format. Used exclusively by {@link module:optionsmanager}.
     * @param {string} game Game Name 
     * @returns {Object.<string, string>} Dictionary of how arrow key presses relate to input bindings (i.e., what bindings represent what arrow key presses, but in reverse.)
     */
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

    /**
     * From all of {@link module:input~MicrogameInputManager#microgameInputs}, check if any controls are being pressed from one.
     * @returns {{control: iter.value, type: MicrogameInput}} A given control, or null if no input is down.
     */
    getAnyInput() {
        for (var input in this.#microgameInputs) {
            var any = this.#microgameInputs[input].getAnyInput();
            if (any !== null) {
                return any;
            }
        }
        return null;
    }

    /**
     * Callback to call after an input is recieved. Set in {@link module:input~MicrogameInputManager#captureNextInput}.
     */
    #captureNextCallback = null;
    /**
     * Set {@link module:input~MicrogameInputManager#captureNextCallback}
     * @param {function} callback To call in {@link module:input~MicrogameInputManager#updateInput}
     * @see {@link module:input~MicrogameInputManager#cancelCaptureInput} 
     */
    captureNextInput(callback) {
        this.#captureNextCallback = callback;
    }
    /**
     * Clear {@link module:input~MicrogameInputManager#captureNextCallback}
     * @see {@link module:input~MicrogameInputManager#captureNextInput}
     */
    cancelCaptureInput() {
        this.#captureNextCallback = null;
    }

    /**
     * The current iframe to target.
     * @type {Element}
     * @static
     */
    static gameTarget = null;
    /**
     * Press a key to the active game.
     * @param {string} key Keycode 
     * @param {boolean} isDown Are we pressing up or down?
     * @static
     */
    static pressKey(key, isDown) {
        if (GlobalGameLoader.inGame) {
            var keyCodeConvert = {
                "ArrowLeft": 37,
                "ArrowRight": 39,
                "ArrowUp": 38,
                "ArrowDown": 40,
                " ": 32
            };
            MicrogameInputManager.gameTarget.dispatchEvent(new KeyboardEvent(`key${isDown}`, {
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

    /**
     * Run every frame or so by {@link MicrogameJam#update}.
     */
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

    /**
     * Calls gameStartInput update on all the child {@link module:input~MicrogameInput}s.
     * Sets the current game target to send inputs to.
     * Called by {@link MicrogameJam#gameStarted}.
     * @param {string} game Game Name
     */
    gameStartInputUpdate(game) {
        for (var input in this.#microgameInputs) {
            this.#microgameInputs[input].gameStartInputUpdate(game);
        }
        
        MicrogameInputManager.gameTarget = document.getElementById("game").contentWindow;
        var potentialCanvas = MicrogameInputManager.gameTarget.document.querySelector("canvas");
        // Might want to fix this logic structure if it gets more complicated than this. I don't want a tree of if-elses.
        
        // Unity is absolutely picky with how it wants to recieve inputs (same with Construct 3). On the absolute converse, Godot wants us to send inputs to canvases. So Javascript? Meet cheap workaround.
        if (potentialCanvas !== null && potentialCanvas.id !== "unity-canvas" && !("C3_IsSupported" in MicrogameInputManager.gameTarget)) {
            MicrogameInputManager.gameTarget = potentialCanvas;
        } else {
            // Our Twine script is similarly (and unintentionally) finnicky:
            var potentialTwine = MicrogameInputManager.gameTarget.document.querySelector("tw-story");
            if (potentialTwine !== null) {
                MicrogameInputManager.gameTarget = MicrogameInputManager.gameTarget.document.body;
            }
        }
    }
}

var GlobalInputManager = new MicrogameInputManager();

export {GlobalInputManager as default, MicrogameKeyboard};