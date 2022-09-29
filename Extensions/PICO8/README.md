**Microgame Jam Pico-8 Extension**
 - - - - - - - - - - - - - - - - - - -- - - -


Files

-   "microgamejamcontroller.lua" - This is the extension that contains
    the functions you will need to communicate with the microgame
    interface. **This is the file you will need to import and use in
    your microgame!**
-   "README.txt" - ur already here lmao

------------------------------------------------------------------------

How to set up the Microgame Jam Controller in Pico-8.

1.  Boot up Pico-8 and type in the following command:

``` folder```

This should open up File Explorer (or an alternative) that contains your local Pico-8 files.

2. Drag the "microgamejamcontroller.lua" file into File Explorer or other file program. 

3. Press "Escape" to open your Pico-8 code editor. At the beginning of your code, type the following command:

```#include microgamejamcontroller.lua```

After this is included, the Microgame Controller will be installed and ready to use!

- - - - - - - - - - - - - - - - - - - - - - -

How to use the Microgame Jam Controller

1. In the "_init()" function, type the following command to set the maximum timer amount in your microgame. This should be anywhere from 5 to 15 seconds. Setting all of your initial state variables in _init() is very important as it will also be how you restart your game!

```
function _init() 
  microgamejamcontroller:setmaxtimer(X) 
  --Code here abour player variables, sprite positions, etc.
end 
```

Parameter X will be replaced by the number of maximum seconds your
microgame will be.

2. Once your timer is set up, there are a few extra lines of code you will need to add to make sure your game starts *after* the timer, creating a small "buffer" window. Don't worry too much about this works - just copy and paste the code in the correct function.

Anywhere in "_init()," type

```
game_started = false
```
Then, in "_update()," add these lines at the very top.

```
if not game_started and time() > .1 then
  game_started = true
  microgamejamcontroller:gamestart()
end
```
Once this is done, you will not need to worry about the buffer any longer - the game should start as intended!

3.  Whenever your player reaches the win condition of your microgame,
    call

```microgamejamcontroller:wingame()```

4.  If your game has a lose condition, call

```microgamejamcontroller:losegame()```

5. Due to the way Pico-8 works, you will need to add a few extra lines of code in your _update() function to set up automatic win/lose behaviors, as well as restart your game in dev testing.

The piece of code below will automatically reset the game and ensure that the player loses upon the timer reaching zero. This code MUST be used in order for your game to work in the web build.

```
if(microgamejamcontroller:gettimer() <= 0) then
  microgamejamcontroller:losegame()
end
```

This piece of code is optional but highly recommended, and will restart the game upon winning or losing, as well as reset the controller to play again while dev testing. 

```
if microgamejamcontroller:gameisover() then
  _init()
  microgamejamcontroller:resetcontroller()
end
```

6. (Optional) Dev Testing Help 

To test whether your game is correctly working, a few dev functions are included to print microgame jam controller data directly to your screen. Here is a sample, used in the "_draw()" function. 

The code below will print the last win/lose state of the game (defaulted to a loss until the game is won), then the in-game timer, the lives, and the difficulty. Remember to comment out or delete this code when publishing your game!

```
function _draw()
  cls()
  map(0,0)
  microgamejamcontroller:drawgameresult()
  print("timer: " .. microgamejamcontroller:gettimer(), 20, 10)
  print("lives: " .. microgamejamcontroller:getlives(), 20, 20)
  print("diff: " .. microgamejamcontroller:getdifficulty(), 20, 30)
end
```

7.  (Optional) If you want to make your game easier or harder depending
    on the difficulty level, call

```
if microgamejamcontroller:getdifficulty() == X then 
  --Insert code here 
end
```

Where X is the difficulty number between integers 1-3.

Note: You do NOT need to set the difficulty number at any time, it will
be set automatically.

------------------------------------------------------------------------

List of all Microgame Jam Controller functions:

Main Functions:
-   microgamejamcontroller:gamestart() - Starts the game
-   microgamejamcontroller:getlives() - Returns the number of lives
    available
-   microgamejamcontroller:getdifficulty() - Returns the current
    difficulty level (between 1 and 3)
-   microgamejamcontroller:gettimer() - Returns the number of seconds
    since the microgame has started or restarted.
-   microgamejamcontroller:wingame() - Tells the main microgame
    jam interface that the game has been won. Use this when the player
    has met the win condition.
-   microgamejamcontroller:losegame() - Tells the main microgame
    jam interface that the game has been lost. Use this when the player
    has met the lose condition (if your game has one other than the timer).
-   microgamejamcontroller:setmaxtimer(seconds) - Sets the starting timer value (between 5-15), which can be called in _init() to set your own timer length

Dev Testing Functions:
-   microgamejamcontroller:gameisover() - Returns game over status of the game. Used to check to see if the game should be reset in dev mode.
-   microgamejamcontroller:resetcontroller() - Resets the controller's state to be used again after a reset. Must be called after checking if the game is over and calling _init() to reset.
-   microgamejamcontroller:setdefaultlives(numLives) - Sets the default number of lives to the parameter "numLives" in dev mode
-   microgamejamcontroller:setdefaultdifficulty(diffNumber) - Sets the default difficulty to the parameter "diffNumber" in dev mode
-   microgamejamcontroller:drawgameresult() - Optional debug function to
    be called in the function \"\_draw()\" to print the outcome of the
    game to the screen.

------------------------------------------------------------------------

That's it! Have fun making your Microgame in Pico-8!
