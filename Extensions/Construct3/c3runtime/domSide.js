"use strict";

{
    // In the C3 runtime's worker mode, all the runtime scripts (e.g. plugin.js, instance.js, actions.js)
	// are loaded in a Web Worker, which has no access to the document so cannot make DOM calls. To help
	// plugins use DOM elements the runtime internally manages a postMessage() bridge wrapped in some helper
	// classes designed to manage DOM elements. Then this script (domSide.js) is loaded in the main document
	// (aka the main thread) where it can make any DOM calls on behalf of the runtime. Conceptually the two
	// ends of the messaging bridge are the "Runtime side" in a Web Worker, and the "DOM side" with access
	// to the Document Object Model (DOM). The addon's plugin.js specifies to load this script on the
	// DOM side by making the call: this._info.SetDOMSideScripts(["c3runtime/domSide.js"])
	// Note that when NOT in worker mode, this entire framework is still used identically, just with both
	// the runtime and the DOM side in the main thread. This allows non-worker mode to work the same with
	// no additional code changes necessary. However it's best to imagine that the runtime side is in a
	// Web Worker, since that is when it is necessary to separate DOM calls from the runtime.
	
	// NOTE: use a unique DOM component ID to ensure it doesn't clash with anything else
	// This must also match the ID in instance.js
    const DOM_COMPONENT_ID = "GDACollab_MicrogameJamDOMComponent";

    const HANDLER_CLASS = class MicrogameJamControllerDOMHandler extends self.DOMHandler
    {
        constructor(iRuntime)
        {
            super(iRuntime, DOM_COMPONENT_ID);
            console.log("DOM constructed");
            this.AddRuntimeMessageHandlers([
                ["get-interface", () => this._getInterface()],
                ["set-max-timer", (duration) => this._setMaxTimer(duration)],
                ["get-timer", () => this._getTimer()],
                ["get-max-timer", () => this._getMaxTimer()],
                ["start-game", () => this._startGame()],
                ["win-game", () => this._winGame()],
                ["lose-game", () => this._loseGame()],
                ["get-lives", () => this._getLives()],
                ["get-difficulty", () => this._getDifficulty()],
                ["verify", () => this._verify()]
                
            ]);
        }

        _verify(){
            try {
                if(parent.GameInterface != null){
                    return{
                        "value": true 
                    };
                }
            } catch(e){
            }
            return{
                "value": false 
            };
            
        }

        _getInterface() {
            console.log("grabbing interface");
            return {
                "interface": parent.GameInterface
            };
        }

        _winGame(){
            parent.GameInterface.winGame();
        }

        _loseGame(){
            parent.GameInterface.loseGame();
        }

        _setMaxTimer(duration){
            parent.GameInterface.setMaxTimer(duration);
        }

        _getMaxTimer(){
            return{
                "max-timer": Math.floor(parent.GameInterface._maxTimer)
            };
        }

        _getTimer(){
            return{
                "timer": parent.GameInterface.getTimer()
            };
        }

        _getDifficulty(){
            return{
                "difficulty": parent.GameInterface.getDifficulty()
            };
        }

        _getLives(){
            return{
                "lives": parent.GameInterface.getLives()
            };
        }

        _startGame(){
            parent.GameInterface.gameStart();
        }


    };

    self.RuntimeInterface.AddDOMHandlerClass(HANDLER_CLASS);

}