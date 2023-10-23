import {OptionsManager} from "./optionsmanager.js"
import {Selectable, MenuVector, MenuVectorField} from "./menulib.js"
import GlobalAnimManager from "../animationmanager.js";
import iniReader from "../configloader.js";
var ini;
/**
 * All of the classes for running the main menu. Win and lose transitions are also created here.
 * @file
 */
/**
 * All of the classes for running the main menu. Win and lose transitions are also created here.
 * @module menumanager
 */

/**
 * Handles the creation of the main menu and transition elements.
 * Also handles actual control of the main menu elements.
 * @tutorial adding-games
 */
class ElementCreator {
    /**
     * 
     * @param {string} elementId ID of the element to get and create for.
     * @param {Object} iniObj Object of .ini file.
     * @param {string} className Class name of the elements to create.
     * @param {string} srcDir Source directory of elements to load from.
     * @todo All of the associated variables should be previate.
     * @constructs ElementCreator
     */
    constructor(elementId, iniObj, className, srcDir){
        /**
         * The element we're going to be creating our derived elements from (using {@link module:menumanager~ElementCreator#drawElements}).
         * @type {Element}
         */
        this._element = document.getElementById(elementId);
        /**
         * The ini object file we're creating elements from in {@link module:menumanager~ElementCreator#drawElements}.
         * @tutorial adding-games
         * @type {Object}
         */
        this._iniObj = iniObj;
        /**
         * The class name associated with the elements we'll be creating.
         * @type {string}
         */
        this._className = className;
        /**
         * The source directory to load assets from.
         * @type {string}
         */
        this._srcDir = srcDir;
        /**
         * Child elements that this class has created.
         * @type {Array.<Element>}
         */
        this.elements = [];
        
        if (this._srcDir !== "") {
            this._srcDir += "/";
        }
    }

    /**
     * Create elements from {@link module:menumanager~ElementCreator#_iniObj}
     */
    drawElements(){
        var elementsToSearch = Object.entries(this._iniObj);

        for (var i = 0; i < elementsToSearch.length; i++) {
            var elementName = elementsToSearch[i][0];
            var element = elementsToSearch[i][1];

            // If it's actually an element:
            if (typeof element === "object" && ("img" in element || "text" in element)) {
                var offset = [0, 0, 0];
                if ("offset" in element) {
                    offset = element.offset.replace(/\(|\)/, "").split(",");
                    offset.forEach(function(o, i){
                        offset[i] = parseInt(o);
                    });
                }
                var newElement;
                if ("img" in element) {
                    newElement = document.createElement("img");
                    newElement.src = "jam-version-assets/art/" + this._srcDir + element.img;
                    newElement.draggable = false;
                } else if ("text" in element) {
                    newElement = document.createElement("p");
                    newElement.innerHTML = markdown.render(element.text);
                }

                newElement.className = this._className;
                newElement.id = elementName;
                
                
                newElement.style = `position: absolute; left: ${offset[0]}px; top: ${offset[1]}px; z-index: ${offset[2]};`;

                if ("div" in element) {
                    var div = document.getElementById(element.div);
                    div ??= document.createElement("div");
                    div.id = element.div;
                    div.className = this._className;
                    // So we can apply z-index:
                    div.style = `position: absolute; z-index: ${offset[2]}; top: 0; left: 0;`;
                    div.appendChild(newElement);

                    if (div.parentElement === null) {
                        this._element.appendChild(div);
                    }
                } else {
                    this._element.appendChild(newElement);
                }
                
                this.elements.push(newElement);

                var timesToDupe = 0;

                if ("count" in element) {
                    timesToDupe = parseInt(element.count) - 1;
                }

                var id = newElement.id;

                for (var j = 0; j < timesToDupe; j++){
                    var dupe = newElement.cloneNode();
                    dupe.id = id + j;
                    if ("individualDiv" in element) {
                        var dupeDiv = newElement.parentNode.cloneNode();
                        var dupeDivId = newElement.parentNode.id;
                        dupeDiv.id = dupeDivId + j;
                        newElement.parentNode.parentNode.appendChild(dupeDiv);
                        dupeDiv.appendChild(dupe);
                    } else {
                        newElement.parentNode.appendChild(dupe);
                    }
                    this.elements.push(dupe);
                }
            }
        }
    }
}

/**
 * The full main menu object for running the whole main menu system.
 */
class MicrogameJamMenu {
    /**
     * The current menu we've loaded
     * @type {string}
     */
    #currMenu = "main";
    /**
     * The menu we're transitioning to.
     * @type {string}
     */
    #destMenu;
    /**
     * @type {MicrogameJamMenuInputReader}
     */
    #inputReader;
    /**
     * @type {OptionsManager}
     */
    #optionsManager;

    /**
     * Promise for waiting for ini to be loaded, then call {@link module:menumanager~MicrogameJamMenu#setUp}.
     * @type {Promise}
     */
    #setUpPromise;

    constructor(){
        this.#setUpPromise = new Promise(async (resolve) => {
            ini = await iniReader;
            this.#setUp();
            resolve();
        });
    }

    /**
     * Setter for a callback when the options' volume slider is set.
     * Set in {@link MicrogameJam} constructor.
     * @param {function} value
     */
    set onVolume(value) {
        this.#optionsManager.onVolume = value;
    }

    /**
     * Returns {@link module:menumanager~MicrogameJamMenu#setUpPromise}.
     * @readonly
     */
    get onSetup() {
        return this.#setUpPromise;
    }

    /**
     * Returns {@link module:optionsmanager.OptionsManager#enabledGames}.
     * @readonly
     */
    get enabledGames() {
        return this.#optionsManager.enabledGames;
    }

    /**
     * Initialize the main menu ({@link module:menumanager~MicrogameJamMenu#initMainMenu}) and initialize menu transitions ({@link module:menumanager~MicrogameJamMenu#initTransitions}).
     * @alias module:menumanager~MicrogameJamMenu#setUp
     */
    #setUp(){
        if (!(ini["Transitions"].debug === "win" || ini["Transitions"].debug === "lose")){
            this.#initMainMenu();
        }
        this.#initTransitions();

        this.#inputReader = new MicrogameJamMenuInputReader();
        this.#optionsManager = new OptionsManager(this);
    }

    /**
     * Pause recieving input for a bit. Used to avoid creating bugs with spamming inputs. Call {@link module:menumanager~MicrogameJamMenuInputReader#pauseInputs}.
     * @param {number} ms Time in miliseconds to pause inputs for.
     */
    pauseInputs(ms){
        this.#inputReader.pauseInputs(ms);
    }

    /**
     * Reset recieving input and menu selection. Call {@link module:menumanager~MicrogameJamMenuInputReader#resetMenuInputs}.
     */
    resetMenuInputs() {
        this.#inputReader.resetMenuInputs();
    }

    /**
     * Call {@link module:menumanager~MicrogameJamMenuInputReader#addSelectable}.
     * @param {Selectable} selectable 
     */
    addSelectable(selectable) {
        this.#inputReader.addSelectable(selectable);
    }
    
    /**
     * For drawing the credits.
     */
    #textY = 0;
    /**
     * Have the credits been drawn?
     */
    #creditsInputsDrawn = false;

    /**
     * Mapping menu states to various functions.
     * shouldLoop returns a boolean as to whether or not the menu's transition animation should loop.
     * backCallback is the function to call when you hit the "back" button.
     * onFinish is what to call when the menu's transition animation is finished.
     * @type {Object.<string, {shouldLoop: function, backCallback: function, onFinish: function}>}
     */
    #menuMapping = {
        "credits": {
            shouldLoop: function(time, animationObj){
                if (!this.#creditsInputsDrawn && animationObj.currFrame.index === 3) {
                    this.#inputReader.resetMenuInputs();
                    if (this.#inputReader.selectableElements.length > 0){
                        this.#creditsInputsDrawn = true;
                    }
                }
                return this.#currMenu === "credits";
            },
            backCallback: this.transitionTo.bind(this, "main")
        },
        "options": {
            backCallback: this.transitionTo.bind(this, "main"),
            onFinish: function() {
                this.#optionsManager.startManagingOptions();
            }
        },
        "main": {
            onFinish: function(){
                if (this.#currMenu === "credits"){
                    this.#creditsInputsDrawn = false;
                    document.getElementById("credits-text").style.setProperty("--text-y", 0);
                    this.#textY = 0;
                    GlobalAnimManager.stopAllKeyframedAnimationOf(`CCSSGLOBALmainTocredits`);
                }
                this.#currMenu = "main";
            },
            shouldLoop: function(){
                if (this.#currMenu === "options") {
                    this.#optionsManager.stopBinding();
                }
                if (this.#currMenu === "credits"){
                    this.#textY -= 150;
                    document.getElementById("credits-text").style.setProperty("--text-y", this.#textY);
                }
                return false;
            }
        }
    };

    /**
     * Transition to a menu and call its associated CCSSGLOBAL{{@link module:menumanager~MicrogameJamMenu#currMenu}}To{menu}.
     * @param {string} menu Menu state to transition to.
     */
    transitionTo(menu){
        var animName = `CCSSGLOBAL${this.#currMenu}To${menu}`;

        if (menu !== "main"){
            document.getElementById("backButton").onclick = this.#menuMapping[menu].backCallback;
        }

        // Are we currently heading AWAY from the main menu, or are we currently at the main menu?
        if (this.#currMenu === "main" || menu === "main"){
            this.#destMenu = menu;
            
            // We don't want to set the main menu to immediately clear because we want to wait for transitions to play out.
            if (this.#destMenu !== "main"){
                this.#currMenu = menu;
            }

            // Reset animation:
            GlobalAnimManager.stopAllKeyframedAnimationOf(animName);
            var menuMapping = this.#menuMapping;
            var destMenu = this.#destMenu;
            GlobalAnimManager.playKeyframedAnimation(animName, {
                keepAnims: this.#destMenu !== "main",
                shouldLoop: function(time, animationObj) {
                    if ("shouldLoop" in menuMapping[destMenu]){
                        return menuMapping[destMenu].shouldLoop.call(this, time, animationObj);
                    } else {
                        return false;
                    }
                }.bind(this),
                onFinish: function(){
                    if ("onFinish" in menuMapping[destMenu]) {
                        menuMapping[destMenu].onFinish.call(this);
                    }
                    this.#inputReader.resetMenuInputs();
                }.bind(this)
            });
        }
    }

    /**
     * Setter for {@link module:MicrogameJamMenuInputReader#isInMenu}.
     */
    set isInMenu(val) {
        this.#inputReader.isInMenu = val;
    }

    /**
     * Initialize the main menu with a bunch of {@link module:menumanager~ElementCreator}.
     * @alias module:menumanager~MicrogameJamMenu#initMainMenu
     */
    #initMainMenu() {
        var mainMenu = new ElementCreator("menu", ini["Menu"], "menu-art", "");
        mainMenu.drawElements();
    
        var credits = new ElementCreator("menu", ini["Credits"], "credits", "");
        credits.drawElements();
    
        document.getElementById("creditsButton").onclick = this.transitionTo.bind(this, "credits");
        document.getElementById("optionsButton").onclick = this.transitionTo.bind(this, "options");

        document.getElementById("game-over").setAttribute("hidden", "");
    }

    /**
     * Initialize transitions (i.e., win and lose) using {@link module:menumanager~ElementCreator}
     */
    #initTransitions(){
        var defaultTransition = new ElementCreator("transitionContainer", ini["Transitions"], "transition-art", "transitions");
        defaultTransition.drawElements();
    
        var intactLives = new ElementCreator("transitionLives", ini["Transitions"]["Lives"], "lives-transition-art", "transitions");
        intactLives.drawElements();
    
        var lostLives = new ElementCreator("transitionLives", ini["Transitions"]["Lives"]["Lost"], "lost-lives-transition-art", "transitions");
        lostLives.drawElements();
    
        var winTransition = new ElementCreator("winTransition", ini["Transitions"]["Win"], "win-transition-art", "transitions/win");
        winTransition.drawElements();
    
        var loseTransition = new ElementCreator("loseTransition", ini["Transitions"]["Lose"], "lose-transition-art", "transitions/lose");
        loseTransition.drawElements();
    }
}

/**
 * Read inputs for the main menu.
 */
class MicrogameJamMenuInputReader {

    /**
     * List of elements that we can select from.
     * @type {Array.<Selectable>}
     */
    #selectableElements = [];

    constructor() {
        this.#setUpMenuInputs();
        document.body.addEventListener("keydown", this.#readMenuInputs.bind(this));
        document.body.addEventListener("mousemove", function(){
            document.body.style.cursor = "inherit";
            if (this.#selectedElement !== -1){
                this.#clearSelect();
                this.#selectedElement = -1;
            }
        }.bind(this));
    }

    /**
     * Buffer of selectables to add as things we can select.
     * Not added immediately so we can transition between menu states.
     */
    #selectablesToAdd = [];

    /**
     * Add a selectable to {@link module:menumanager~MicrogameJamMenuInputReader#selectablesToAdd}
     * @param {Selectable} selectable 
     */
    addSelectable(selectable) {
        this.#selectablesToAdd.push(selectable);
    }

    /**
     * Return {@link module:menumanager~MicrogameJamMenuInputReader#selectableElements}.
     * @readonly
     */
    get selectableElements(){
        return this.#selectableElements;
    }

    /**
     * The vector field we're using for the current menu state.
     * @type {MenuVectorField}
     */
    #selectableVectorField;

    /**
     * Called with every state change to a new menu state. Set up the current selectables and MenuVectorField from those selectables.
     * @alias module:menumanager~MicrogameJamMenuInputReader#setUpMenuInputs
     */
    #setUpMenuInputs() {
        var menu = document.getElementById("menu");
        this.#selectableElements = Selectable.generateSelectablesArr(menu);
        this.#selectableElements.push(...this.#selectablesToAdd);
        this.#selectablesToAdd = [];

        this.#selectableVectorField = new MenuVectorField(this.#selectableElements, 0);

        if (this.#selectedElement !== -1) {
            this.#selectedElement = 0;
            this.#selectElement(new MenuVector(0, 0));
        }
    }

    /**
     * Called on a menu state change. Reset inputs for a new set of selectables.
     * Calls {@link module:menumanager~MicrogameJamMenuInputReader#setUpMenuInputs} and {@link module:menumanager~MicrogameJamMenuInputReader#clearSelect}.
     */
    resetMenuInputs() {
        this.#clearSelect();
        this.#setUpMenuInputs();
    }

    /**
     * Clear selection of current selectables.
     * @alias module:menumanager~MicrogameJamMenuInputReader#clearSelect
     */
    #clearSelect() {
        this.#selectableElements.forEach(function(e){
            e.clearSelect();
        });
    }

    /**
     * Select an element given an index.
     * @param {number} index 
     */
    setElement(index) {
        this.#selectedElement = index;
        this.#selectableVectorField.currPos = this.#selectedElement;
        this.#selectableElements[this.#selectedElement].select();
    }

    /**
     * Mostly a wrapper for {@link module:menumanager~MenuVectorField#getFromDir}, but has some functionality for picking an element to highlight if one cannot be found.
     * @param {MenuVector} direction 
     */
    #selectElement(direction){
        if (this.#selectableElements.length === 0){
            return;
        }

        // Does the selected element want to override our controls?
        if (this.#selectableElements[this.#selectedElement].selectElement instanceof Function) {
            // Don't do anything else if the element is still considered "selected".
            this.#selectableElements[this.#selectedElement].selectElement(direction, this);
            return;
        }
        
        var pick = this.#selectableVectorField.getFromDir(direction);
        if (pick !== -1){
            this.#selectedElement = pick;
        } else if (this.#selectedElement === -1) {
            this.#selectedElement = 0;
        }

        
        this.#selectableElements[this.#selectedElement].select();
    }

    /**
     * The current element we've selected.
     * @type {number}
     */
    #selectedElement = -1;
    /**
     * Are we currently in the menu? If not, we're in Microgames.
     * @type {boolean}
     */
    isInMenu = true;
    /**
     * Some time in the future that we should be pausing input for. Set in {@link module:menumanager~MicrogameJamMenuInputReader#pauseInputs}.
     * @type {number}
     */
    #pauseInputTimer = -1;

    /**
     * Read an input and apply it to the menu. Called by onkeydown by the constructor of {@link module:menumanager~MicrogameJamMenuInputReader}.
     * @param {Event} ev 
     * @alias module:menumanager~MicrogameJamMenuInputReader#readMenuInputs
     */
    #readMenuInputs(ev) {
        if (this.isInMenu) {
            ev.preventDefault();
        } else {
            return;
        }
        if (this.#pauseInputTimer > 0) {
            if (this.#pauseInputTimer > performance.now()){
                this.#pauseInputTimer = -1;
            }
            return;
        }
        if (this.#selectedElement === -1) {
            document.body.style.cursor = "none";
            this.#selectedElement = 0;
            this.#selectableVectorField.currPos = 0;
            this.#selectElement(new MenuVector(0, 0));
            return;
        }
        if (ev.key === " ") {
            this.#selectableElements[this.#selectedElement].click();
            return;
        }
        this.#clearSelect();
        var dir = [0, 0];
        if (ev.key === "ArrowLeft") {
            dir[0] = -1;
        } else if (ev.key === "ArrowRight") {
            dir[0] = 1;
        }
        if (ev.key === "ArrowDown") {
            dir[1] = 1;
        } else if (ev.key === "ArrowUp") {
            dir[1] = -1;
        }
        this.#selectElement(new MenuVector(dir));
    }

    /**
     * Pause recieving inputs. Set {@link module:menumanager~MicrogameJamMenuInputReader#pauseInputTimer}.
     * @param {number} ms The duration of the input pause. 
     */
    pauseInputs(ms) {
        this.#pauseInputTimer = performance.now() + ms;
    }
}

var MainMenuManager = new MicrogameJamMenu();

export default MainMenuManager;