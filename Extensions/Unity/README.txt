# Installing
1. Create your Unity project.
2. Download the .ZIP (From the Releases page of the Github)
3. Extract the contents of the .ZIP to the Assets folder of your project.
4. If the add-on prompts you, make sure you update your settings to match the recommended project settings!
5. In your current scene, create an empty object and attach the Microgame Jam Controller component as a script.
6. To call the MicrogameJamController.FUNCTION functions, you have to use GameObject.Find(“EmptyObjectName”).GetComponent<MicrogameJamController>().FUNCTION.

# Exporting
1. Open File -> Build Settings
2. Click “WebGL”
  a. Click “Switch Project” if “Build” isn’t shown as a button
3. Click “Build”.
4. Select a blank folder to place your build into.
5. Zip the entire folder, and submit to the itch.io jam page.

# Testing Web Builds
1. The Microgame Jam recommends using GZip compression for web builds (it makes them smaller), and will turn this option on automatically if you update your settings to match the recommended project settings.
2. Because of this, some web servers without GZip compression specifically enabled will not be able to test the build.
3. There are a few ways to test your build:
  a. Unity automatically creates a web server to manage GZip compression if you use “Build and Run…” instead of “Build…”
  b. You can upload your game to itch.io, which should automatically handle compression for you.
  c. You can temporarily disable GZip compression:
    i. Go to Edit->Project Settings
    ii. Go to the Player Tab
    iii. Scroll down to “Publishing Settings”
    iv. Under “Publishing Settings”, change “Compression Format” from “GZip” to “None”.
    v. Make sure to change it back to GZip compression once you’re done with testing, as it helps drastically reduce file sizes.

# Using the Extension

Attach an object in your scene with a Microgame Jam Controller component, MicrogameJamController.FUNCTION at any time, in any script in order to use the functionality. Here are the associated functions:

## MicrogameJamController.SetMaxTimer(seconds)

This MUST be called in the Start function of any object. It won’t accept any inputs after that.

This will set the maximum time that your game will be allowed to run for. It will only accept a range of 5 to 15 seconds.

## MicrogameJamController.WinGame()

This tells the controller that your game has won. This should automatically restart your scene if your game is not part of our infrastructure.

## MicrogameJamController.LoseGame()

This tells the controller that your game has been lost. This should automatically restart your scene if your game is not part of our infrastructure.

This will be automatically called if MicrogameJamController.GetTimer() is <= 0.


## MicrogameJamController.GetDifficulty()

Returns a value from 1 to 3, where 1 is the easiest difficulty, and 3 is the highest difficulty. You can ignore this function if you don’t want your Microgame’s difficulty to change.

We will adjust this automatically in our infrastructure, but you can change the default value for testing/standalone builds with MicrogameJamController.dev_difficulty

## MicrogameJamController.GetLives()

Gets the number of lives the player currently has. When your game is not part of our infrastructure, this value can be set by default with MicrogameJamController.dev_lives.

## MicrogameJamController.GetTimer()

Returns the number of seconds until MicrogameJamController.LoseGame() is called.
