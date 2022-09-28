GDA Microgame Jam Twine Extension Documentation
by Ryan McCarty

Brief Explanation- This is an extension for letting you interact with and create Microgames
in Twine and have them work with the Microgame Jam framework in order to be part of the GDA 
microgame jam. It was designed for Twine version 2.4.1 and Harlowe 3.3 as the story format.

How to install-
1. If you haven't, go to twinery.org and either install Twine or use Twine in your browser 
(If your desktop version of Twine is very old, you may need to update it.)
2. Create a new story in Twine (this will be your microgame).
2. Make sure you are using the Harlowe story format. This can be checked in the Twine tab under 
Story Formats within your story.
3. Open the story JavaScript by going to the Story tab and clicking on JavaScript.
4. Copy the contents harlowe.js from this folder to the Story JavaScript


Functions of the Extension-
Note: These custom macros require some value inputted to function (even if it has no effect),
so when running WinGame or LoseGame, put something after the colon, like (WinGame:1).

(WinGame: )- When placed in a passage, tells the framework that the game is over and the player 
has won. If used in Developer mode, will cause an alert to appear that the game has been won.

(LoseGame: )- When placed in a passage, tells the framework that the game is over and the player 
has lost. If used in Developer mode, will cause an alert to appear that the game has been lost.

(SetMaxTimer: seconds)- Sets how long the player has to complete their microgame. It has a minimum 
of 5 and a maximum of 15, so please input a number in or between that range. In developer mode, if the 
number is smaller than 5, the macro will just treat it as 5, or larger than 15, the macro will 
treat it as 15.

Using the Functions-

-Make an unattached startup passage (a passage with a tag titled 'startup'), and run the 
(SetMaxTimer: ) macro for however many seconds you want the player to have to complete your 
microgame in that passage.

-Place the (WinGame:1) and (LoseGame:1) macros in passages where you want the game to end. 
(WinGame:1) if you want the player to win when they reach that passage, and (LoseGame:1) if you
want to player to lose when they reach the passage.




Have any questions about the extension or found any bugs? Feel free to message me on Discord
at LeftyDark#6886 and I'll try to get back to you as soon as I can!