
const C3 = self.C3;

// NOTE: use a unique DOM component ID to ensure it doesn't clash with anything else
// This must also match the ID in domSide.js.
const DOM_COMPONENT_ID = "GDACollab_MicrogameJamDOMComponent";

C3.Plugins.GDACollab_MicrogameJamController.Instance = class SingleGlobalInstance extends C3.SDKInstanceBase
{
	constructor(inst, properties)
	{
		super(inst, DOM_COMPONENT_ID);

		this._isGame = false;
		this.GameInterface = null;

		// While the game is loading:
		this._runtime.AddLoadPromise(
			this.PostToDOMAsync("get-interface")
			.then(data => 
			{
				this.GameInterface = data["interface"];
				this._isGame = this.GameInterface !== undefined && this.GameInterface !== null;
				console.log("found interface");
			})
		);

		// After we're done loading:
		this._runtime.Dispatcher().addEventListener("afterload", function(){
			this._maxTimer = 20;
			this._timer = Date.now();
			if (this._isGame) {
				this.GameInterface.gameStart();
				console.log("starting game!");
			}
		});
	}
	
	Release()
	{
		super.Release();
	}

	_GetLives() {
		if (this._isGame){
			log("getting lives");
			return this.GameInterface.getLives();
		} else {
			return 3;
		}
	}

	_GetDifficulty() {
		if (this._isGame) {
			return this.GameInterface.getDifficulty();
		} else {
			return 1;
		}
	}

	_GetTimer(){
		if (this._isGame) {
			console.log("timer is currently" + this.GameInterface.getTimer());
			return this.GameInterface.getTimer();
		} else {
			return this._maxTimer - Math.floor((Date.now() - this._timer)/1000);
		}
	}

	_WinGame() {
		if (this._isGame) {
			console.log("game won");
			this.GameInterface.winGame();
			
		} else {
			alert("Game won!");
		}
	}

	_LoseGame() {
		if (this._isGame) {
			console.log("game lost");
			this.GameInterface.loseGame();
			
		} else {
			alert("Game lost!");
		}
	}

	_SetMaxTimer(seconds){
		if (this._isGame) {
			console.log("max timer set to " + seconds);
			this.GameInterface.setMaxTimer(seconds);
		} else {
			this._maxTimer = seconds;
			this._timer = Date.now();
		}
	}

	_GetMaxTimer(){
		if (this._isGame) {
			return this.GameInterface.getMaxTimer();
		} else {
			return this._maxTimer;
		}
	}

	SaveToJson()
	{
		return {
			// data to be saved for savegames
		};
	}
	
	LoadFromJson(o)
	{
		// load state for savegames
	}

	GetScriptInterfaceClass()
	{
		return self.IMicrogameJamControllerInstance;
	}
};

// Script interface. Use a WeakMap to safely hide the internal implementation details from the
// caller using the script interface.
const map = new WeakMap();

// Should be accessible through JS by IMicrogameControllerInstance
self.IMicrogameJamControllerInstance = class IMicrogameJamControllerInstance extends self.IInstance {
	constructor()
	{
		super();

		// Map by SDK instance
		map.set(this, self.IInstance._GetInitInst().GetSdkInstance());
	}

	GetLives(){
		return map.get(this)._GetLives(); 
	}

	GetDifficulty() {
		return map.get(this)._GetDifficulty();
	}

	GetTimer() {
		return map.get(this)._GetTimer();
	}

	WinGame() {
		map.get(this)._WinGame();
	}

	LoseGame(){
		map.get(this)._LoseGame();
	}

	SetMaxTimer(seconds) {
		map.get(this)._SetMaxTimer(seconds);
	}

	GetMaxTimer() {
		return map.get(this)._GetMaxTimer();
	}
};
