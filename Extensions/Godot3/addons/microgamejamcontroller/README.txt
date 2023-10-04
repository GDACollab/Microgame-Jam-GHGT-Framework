# Installing
As per https://docs.godotengine.org/en/stable/tutorials/plugins/editor/installing_plugins.html:
1. Create your Godot project.
  a. It is recommended you use GLES 2 for your project.
2. Download the .ZIP (Releases page: https://github.com/GDACollab/Microgame-Jam-GHGT-Framework/releases)
3. Extract the contents of the .ZIP to the addons/ folder of your project.
4. Close your Godot project, and re-open it.
5. Open Project -> Project Settings
6. Go to the Plugins Tab
7. Enable the Plugin.
8. Click “OK” when the Plugin prompts you to update project settings.

# Exporting
1. Open Project -> Export
2. Click “Add…” in the top
3. Click “HTML5”.
4. You might see an error below with a “Manage Export Templates”. If so…
  a. Click “Manage Export Templates”
  b. In the new window that pops up, click “Download and Install”
5. Click “Export Project…”
6. Save the project to an empty folder
7. Zip the entire folder, and submit to the itch.io jam page.

# Using the Extension

Call MicrogameJamController.FUNCTION at any time, in any script in order to use the functionality. Here are the associated functions:

## MicrogameJamController.SetMaxTimer(seconds)

This MUST be called in the _ready function of any object. It won’t accept any inputs after that.

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

## MicrogameJamController.dev_difficulty

This can be set at any time in any script. This is the default value that MicrogameJamController.GetDifficulty() will return if our infrastructure is not detected.

DO NOT, and I repeat DO NOT USE THIS VALUE TO GET DIFFICULTY. That’s what MicrogameJamController.GetDifficulty() is for.

## MicrogameJamController.dev_lives

This can be set at any time in any script. This is the default value that MicrogameJamController.GetLives() will return if our infrastructure is not detected.

DO NOT, and I repeat DO NOT USE THIS VALUE TO GET LIVES. That’s what MicrogameJamController.GetLives() is for.
