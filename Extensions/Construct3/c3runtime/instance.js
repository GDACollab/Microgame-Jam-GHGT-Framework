
const C3 = self.C3;

// NOTE: use a unique DOM component ID to ensure it doesn't clash with anything else
// This must also match the ID in domSide.js.
const DOM_COMPONENT_ID = "GDACollab_MicrogameJamDOMComponent";

C3.Plugins.GDACollab_MicrogameJamController.Instance = class SingleGlobalInstance extends C3.SDKInstanceBase {
	constructor(inst, properties) {
		super(inst, DOM_COMPONENT_ID);

		this._isGame = false;
		this.GameInterface = null;
		this._currentTimer = 15;
		this._currentLives = 3;
		this._maxTimer = 5;
		this._difficulty = 1;
		this._gameOver = false;
		this._preMaxTimer = 15;
		this._hasSetMaxTimerForReal = false;
		this._timer = Date.now();
		// While the game is loading:
		this._runtime.AddLoadPromise(
			this.PostToDOMAsync("verify")
				.then(data => {

					console.log("construct3 - THIS IS BEING RUN ON WEB");
					if (data["value"] == true) {
						console.log("construct3 - starting game!");
						
						// this._runtime.AddLoadPromise(this.PostToDOMAsync("start-game"));
						setTimeout(() => {
							this._isGame = true;
							this._runtime.AddLoadPromise(this.PostToDOMAsync("start-game"));
						}, 5000); // delay in ms

					}
					else{
						this._hasSetMaxTimerForReal = true;
					}
				})
		);

		setTimeout(() => {
			// this._GetMaxTimer();
			this._StartTicking();
			this._SetMaxTimerForReal();
		}, 5000); // delay in ms

		// After we're done loading:


		// this._runtime.Dispatcher().addEventListener("afterload", function () {
		// 	this._maxTimer = 15;

		// 	console.log("starting game!");
		// 	if (this._isGame) {
		// 		this._runtime.AddLoadPromise(this.PostToDOMAsync("start-game"));
		// 	}
		// });


	}

	Tick() {

		if (this._GetTimer() <= 0 && !this._gameOver) {
			this._LoseGame();
		}
	}

	Release() {
		super.Release();
	}

	_GetLives() {
		if (this._isGame) {
			this._runtime.AddLoadPromise(
				this.PostToDOMAsync("get-lives")
					.then(data => {
						this._currentLives = data["lives"];

					}));
			return this._currentLives;
		} else {
			return 3;
		}
	}

	_GetDifficulty() {
		if (this._isGame) {
			this._runtime.AddLoadPromise(
				this.PostToDOMAsync("get-difficulty")
					.then(data => {
						this._difficulty = data["difficulty"];

					}));
			return this._difficulty;
		} else {
			return 1;
		}
	}

	_GetTimer() {
		if (this._isGame) {
			this._runtime.AddLoadPromise(
				this.PostToDOMAsync("get-timer")
					.then(data => {
						this._currentTimer = data["timer"];

					}));


			return this._currentTimer;

		} else {
			return this._maxTimer - Math.floor((Date.now() - this._timer) / 1000);
		}
	}

	_GetMaxTimer() {
		if (this._isGame) {
			this._runtime.AddLoadPromise(
				this.PostToDOMAsync("get-max-timer")
					.then(data => {
						this._maxTimer = data["max-timer"];

					}));
			return this._maxTimer;
		} else {
			return this._maxTimer;
		}
	}

	_WinGame() {
		if (this._isGame && this._gameOver == false) {
			console.log("game won");
			this._runtime.AddLoadPromise(this.PostToDOMAsync("win-game"));
			this._gameOver = true;

		} else {
			alert("Game won!");
		}
	}

	_LoseGame() {
		if (this._isGame && this._gameOver == false) {
			console.log("construct3 - game lost");
			this._runtime.AddLoadPromise(this.PostToDOMAsync("lose-game"));
			this._gameOver = true;

		} else {
			alert("Game lost!");
		}
	}

	_SetMaxTimer(seconds) {
		this._preMaxTimer = seconds;
		if (this._isGame) {
			this._maxTimer = seconds;
			
			console.log("construct3 - max timer set to " + seconds);
			// this._setMaxTimer(seconds);

			// this._runtime.AddLoadPromise(this.PostToDOMAsync("set-max-timer", seconds));
			// this._timer = Date.now();




		} else {
			this._maxTimer = seconds;
			this._timer = Date.now();
		}
	}

	_SetMaxTimerForReal(){
		if(!this._hasSetMaxTimerForReal){
			console.log("construct3 - max timer set to " + this._preMaxTimer + "FOR REAL!");
			this._runtime.AddLoadPromise(this.PostToDOMAsync("set-max-timer", this._preMaxTimer));
			this._timer = Date.now();
			this._hasSetMaxTimerForReal = true;
		}
		
	}



	SaveToJson() {
		return {
			// data to be saved for savegames
		};
	}

	LoadFromJson(o) {
		// load state for savegames
	}

	GetScriptInterfaceClass() {
		return self.IMicrogameJamControllerInstance;
	}
};

// Script interface. Use a WeakMap to safely hide the internal implementation details from the
// caller using the script interface.
const map = new WeakMap();

// Should be accessible through JS by IMicrogameControllerInstance
self.IMicrogameJamControllerInstance = class IMicrogameJamControllerInstance extends self.IInstance {
	constructor() {
		super();

		// Map by SDK instance
		map.set(this, self.IInstance._GetInitInst().GetSdkInstance());
	}

	GetLives() {
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

	LoseGame() {
		map.get(this)._LoseGame();
	}

	SetMaxTimer(seconds) {
		map.get(this)._SetMaxTimer(seconds);
	}

	GetMaxTimer() {
		return map.get(this)._GetMaxTimer();
	}
};
