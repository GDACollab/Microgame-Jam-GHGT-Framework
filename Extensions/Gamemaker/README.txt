Microgame Jam GameMaker Studio 2 Extension How-To

Preface note: You will need the HTML5 Export which is now under a monthly subscription. There might be a free trial available though!

- - - - - - - - - - - - - - - - - - - - - - -

Included in the Gamemaker Zip is...

"MicroGameJamExtension.yymps" - the actual extension, the only file you need
"README.txt" - this how-to guide!

- - - - - - - - - - - - - - - - - - - - - - -

How to embed extension in your Gamemaker 2 Project.

1. With your project open, go to "Tools" then "Import Local Package"

2. In this menu, select the "MicroGameJamExtension.yymps" package.

3. You now can import any of the package files, included are:

	Files Crucial to the Extension,

	Extensions > MicroGameJamController
	Scripts 	 > gmcallback_debugSettings
	Scripts 	 > gmcallback_restartGame

	Example files,

	Fonts   > fnt_test
	Objects > obj_test
	Rooms   > rm_test

3. You can individually select the crucial files, or press "Add All", then "Import"

4. Now the Microgame Jam Controller is installed!

- - - - - - - - - - - - - - - - - - - - - - -

How to use the extension!

1. When your game starts, call this function to set how long the game will last.

	SetMaxTimer(A);

	Parameter A -- how many seconds the game will last (5 seconds min, 15 seconds max)
	
2. Now find when the player wins and loses.

	When they win, call WinGame();

	When they lose, call LoseGame();

	You don't need to call "LoseGame()" if the only time the player loses is when the clock runs out.

3. Ok now you have a Microgame!

4. When you run on the HTML5 Target, the Game will give you a prompt when you lose or win, and on restart!

- - - - - - - - - - - - - - - - - - - - - - -

Here are some Helper Functions for your use:

	GetLives() - Returns the number of lives available
	GetDifficulty() - Returns the current difficulty level (between 1 and 3)
	GetTimer() - Returns the number of seconds until loseGame() is automatically called.
	WinGame() - Sends callback to main webpage/other js files to tell them that we won the game.
	LoseGame() - Sends callback to main webpage/other js files to tell them that we lost the game.

- - - - - - - - - - - - - - - - - - - - - - -

To set debug settings like what the game's difficulty is, go into the "gmcallback_debugSettings" script.

Debug settings include: Default Difficulty, Default Lives, and Allow Auto Restarts.

Note: These settings won't carry over to the full game, as the difficulty is set by the player in the beginning

	



