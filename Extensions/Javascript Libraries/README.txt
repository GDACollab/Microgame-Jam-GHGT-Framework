Microgame Jam JavaScript Extension

Preface Note: If your using a JavaScript game engine like Phaser, please refer
		  to the slide show for alternative instructions.
- - - - - - - - - - - - - - - - - - - - - - -

Included in the Javascript Libraries Zip is...

"microgamejamcontroller.js" - the actual extension, the only file you need
"ExampleTest" folder - an example use of this extension
"README.txt" - this function guide!

- - - - - - - - - - - - - - - - - - - - - - -

How to embed extension in your microgame.

1. Add the "microgamejamcontroller.js" into the same folder as your main JavaScript file

2. Inside your main JS file, add this line at the top

	import {MicrogameJamController} from "./microgamejamcontroller.js";

3. Now before you can use the Controller you need to instantiate it like this!

	var jamController = MicrogameJamController(A,B,C);

	Parameter A -- this will set the difficulty of the level -- (1-3)
	Parameter B -- this will set the default lives -- (1-3)
	Parameter C -- when you lose, should the game automatically restart -- (true or false)

	These settings won't carry over to the full game, as the difficulty is set by the player in the beginning.

4. Now the Microgame Jam Controller is installed!

- - - - - - - - - - - - - - - - - - - - - - -

How to use extension.

1. When your game starts, call this function to set how long the game will last.

	jamController.SetMaxTimer(A,B);

	Parameter A -- how many seconds the game will last (5 min, 15 max)
	Parameter B -- This takes a single function name that you want to be called on game restart, like a start method.
		This parameter is not necessary to use but helps if you need to reset variables in your game on restart.

2. Now the last thing you need to do is find when the player wins and loses.

	When they win, call jamController.WinGame();

	When they lose, call jamController.LoseGame();

	You don't need to call "LoseGame()" if the only time the player loses is when the clock runs out.

3. Ok now you have a Microgame!
  
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




