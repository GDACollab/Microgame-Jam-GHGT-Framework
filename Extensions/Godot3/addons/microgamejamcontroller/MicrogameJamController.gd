extends Node

# Set this to set the difficulty you get from GetDifficulty() when the full Microgame Jam Controller is not detected.
# (I.E., for dev builds or solo web builds)
var dev_difficulty = 1;
# Set this to set the lives you get from GetLives() when the full Microgame Jam Controller is not detected
# (I.E., for dev builds or solo web builds)
var dev_lives = 3;
var _is_game = false;
var _game_started = false;
var _max_time = 15;
var _dev_timer = 0;
var _current_scene;
var _game_ended = false;

const MAX_TIMER_VALUE = 15;
const MIN_TIMER_VALUE = 5;

func WinGame():
	if not _game_ended:
		_game_ended = true;
		if _is_game:
			JavaScript.eval('parent.GameInterface.winGame();');
		else:
			print("Game Won! Restarting...");
			if (_current_scene == get_tree().get_current_scene()):
				get_tree().reload_current_scene();
			else:
				get_tree().change_scene_to(_current_scene.filename);
			_game_ended = false;
			_dev_timer = _max_time;
			_game_started = false;
			yield(get_tree(), "idle_frame");
			_current_scene = get_tree().get_current_scene();
			_game_started = true;
	else:
		print("[Microgame Jam Controller] Attempted to call WinGame() after game has ended.");

func LoseGame():
	if not _game_ended:
		_game_ended = true;
		if _is_game:
			JavaScript.eval('parent.GameInterface.loseGame();');
		else:
			print("Game Lost! Restarting...");
			if (_current_scene == get_tree().get_current_scene()):
				get_tree().reload_current_scene();
				_current_scene = get_tree().get_current_scene();
			else:
				get_tree().change_scene_to(_current_scene.filename);
			_game_ended = false;
			_dev_timer = _max_time;
			_game_started = false;
			yield(get_tree(), "idle_frame");
			_current_scene = get_tree().get_current_scene();
			_game_started = true;
	else:
		print("[Microgame Jam Controller] Attempted to call LoseGame() after game has ended.");

func GetLives():
	if _is_game:
		var lives = JavaScript.eval('parent.GameInterface.getLives();');
		return lives;
	else:
		return dev_lives;

func GetDifficulty():
	if _is_game:
		var difficulty = JavaScript.eval('parent.GameInterface.getDifficulty();');
		return difficulty;
	else:
		return dev_difficulty;

func GetTimer():
	if _is_game:
		var timer = JavaScript.eval('parent.GameInterface.getTimer();');
		return timer;
	else:
		return _dev_timer;
	
func SetMaxTimer(seconds):
	if not _game_started:
		if seconds > MAX_TIMER_VALUE:
			seconds = MAX_TIMER_VALUE;
			print("MicrogameJamController.SetMaxTimer(seconds) called with a seconds value > " + str(MAX_TIMER_VALUE) + ". Setting to " + str(MAX_TIMER_VALUE) + "s.");
		if seconds < MIN_TIMER_VALUE:
			seconds = MIN_TIMER_VALUE;
			print("MicrogameJamController.SetMaxTimer(seconds) called with a seconds value < " + str(MIN_TIMER_VALUE) + ". Setting to " + str(MIN_TIMER_VALUE) + "s.");
		if _is_game:
			JavaScript.eval('parent.GameInterface.setMaxTimer(' + seconds + ');');
		else:
			_max_time = seconds;
	else:
		printerr("Attempted to call MicrogameJamController.SetMaxTimer(seconds) after ready function.")

func _ready():
	if OS.has_feature('JavaScript') and JavaScript.eval('parent.GameInterface !== undefined && parent.GameInterface !== null'):
		_is_game = true;
		# Wait for the next frame before starting the game:
		# This way, other scripts can call SetMaxTimer during the _ready function:
		yield(get_tree(), "idle_frame");
		JavaScript.eval('parent.GameInterface.gameStart();');
	else:
		yield(get_tree(), "idle_frame");
		_current_scene = get_tree().get_current_scene();
		_dev_timer = _max_time;

	_game_started = true;

func _process(delta):
	if not _is_game and not _game_ended:
		_dev_timer -= delta;
		if (_dev_timer <= 0):
			LoseGame();
