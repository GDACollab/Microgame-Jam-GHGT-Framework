**Microgame Jam Pico-8 Extension** - - - - - - - - - - - - - - - - - - -
- - - -

Files

-   "microgamejamcontroller.lua" - This is the extension that contains
    the functions you will need to communicate with the microgame
    interface. **This is the file you will need to import and use in
    your microgame!**
-   "picointerface.js" - Communicates with the Pico-8 controller and
    sends relevant information to the main microgame jam interface by
    setting GPIO pins. You don't need to worry about how this works!
-   "README.txt" - ur already here lmao

------------------------------------------------------------------------

How to set up the Microgame Jam Controller in Pico-8.

1.  Boot up Pico-8 and type in the following command:

``` {.folder```}
This should open up File Explorer (or an alternative) that contains your local Pico-8 files.

2. Drag the "microgamejamcontroller.lua" file into File Explorer or other file program. 

3. Press "Escape" to open your Pico-8 code editor. At the beginning of your code, type the following command:

```#include microgamejamcontroller.lua```

After this is included, the Microgame Controller will be installed and ready to use!

- - - - - - - - - - - - - - - - - - - - - - -

How to use the Microgame Jam Controller

1. In the "_init()" function, type the following command to set the maximum timer amount in your microgame. This should be anywhere from 5 to 20 seconds.
```

function \_init() microgamejamcontroller:setmaxtimer(X) end \`\`\`
Parameter X will be replaced by the number of maximum seconds your
microgame will be.

2.  Whenever your player reaches the win condition of your microgame,
    call

`microgamejamcontroller:wingame()`

3.  If your game has a lose condition, call

`microgamejamcontroller:losegame()`

Your game MUST also call the lose game function if the player runs out
of time. To add this condition, in the \"\_update()\" function, add this
code:

`function _update()   if(microgamejamcontroller:gettimer() >= microgamejamcontroller.max_time) then     microgamejamcontroller:losegame()   end end`

4.  (Optional) If you want to make your game easier or harder depending
    on the difficulty level, call

\`\`if microgamejamcontroller:getdifficulty() == X then --Insert code
here end\`\`\`

Where X is the difficulty number between integers 1-3.

Note: You do NOT need to set the difficulty number at any time, it will
be set automatically.

------------------------------------------------------------------------

List of all Microgame Jam Controller functions:

-   microgamejamcontroller:getlives() - Returns the number of lives
    available
-   microgamejamcontroller:getdifficulty() - Returns the current
    difficulty level (between 1 and 3)
-   microgamejamcontroller:gettimer() - Returns the number of seconds
    since the microgame has started.
-   microgamejamcontroller:wingame() - Sends callback to main microgame
    jam interface that the game has been won. Use this when the player
    has met the win condition.
-   microgamejamcontroller:losegame() - Sends callback to main microgame
    jam interface that the game has been lost. Use this when the player
    has met the lose condition (if your game has one).
-   microgamejamcontroller:drawgameresult() - Optional debug function to
    be called in the function \"\_draw()\" to print the outcome of the
    game to the screen.

------------------------------------------------------------------------

That's it! Have fun making your Microgame in Pico-8!
