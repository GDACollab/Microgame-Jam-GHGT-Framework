Microgame Jam GameMaker Studio 2 Extension How-To

Preface note: You will need the HTML5 Export which is now under a monthly subscription. There might be a free trial available though!

- - - - - - - - - - - - - - - - - - - - - - -

Included in the Gamemaker Zip is...

"MicroGameJamExtension.yymps" - the actual extension, the only file you need
"README.txt" - this how-to guide!

- - - - - - - - - - - - - - - - - - - - - - -

Here are some Helper Functions for your use:

	SetMaxTimer(A);

	Parameter A -- how many seconds the game will last (5 seconds min, 15 seconds max)

	GetLives() - Returns the number of lives available
	GetDifficulty() - Returns the current difficulty level (between 1 and 3)
	GetTimer() - Returns the number of seconds until loseGame() is automatically called.
	WinGame() - Sends callback to main webpage/other js files to tell them that we won the game.
	LoseGame() - Sends callback to main webpage/other js files to tell them that we lost the game.

- - - - - - - - - - - - - - - - - - - - - - -

To set debug settings like what the game's difficulty is, go into the "gmcallback_debugSettings" script.

Debug settings include: Default Difficulty, Default Lives, and Allow Auto Restarts.

Note: These settings won't carry over to the full game, as the difficulty is set by the player in the beginning

	



