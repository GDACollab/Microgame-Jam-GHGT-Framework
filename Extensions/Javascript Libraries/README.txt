Microgame Jam JavaScript Extension
- - - - - - - - - - - - - - - - - - - - - - -

Included in the Javascript Libraries Zip is...

"microgamejamcontroller.js" - the actual extension, the only file you need
"ExampleTest" folder - an example use of this extension
"README.txt" - this function guide!

- - - - - - - - - - - - - - - - - - - - - - -

Here are the functions available to you!

	test.SetMaxTimer(A,B)

	Parameter A -- How many seconds the game will last (5 min, 15 max)
	Parameter B -- This takes a single function name that you want to be called on game restart, like a start method.
		This parameter is not necessary to use but helps if you need to reset variables in your game on restart.

	test.GetLives() - Returns the number of lives available

	test.GetDifficulty() - Returns the current difficulty level (between 1 and 3)

	test.GetTimer() - Returns the number of seconds until loseGame() is automatically called.

	test.WinGame() - Sends callback to main webpage/other js files to tell them that we won the game.
	
	test.LoseGame() - Sends callback to main webpage/other js files to tell them that we lost the game.

- - - - - - - - - - - - - - - - - - - - - - -

Note: "test" variable name can be replaced with whatever name you want!


