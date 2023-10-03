# How to Add Games and Theming
Here’s how it works (for now, this is really inefficient though):

There’s a folder in the Github called Web. In that Web folder is jam-version-assets. In that folder is everything that is specific to the current iteration of the microgame jam. I.e., all the stuff that needs to be changed. So that contains:
Main menu images
Game data
Theme specific .js and .css files
And anything else that changes when the theme changes.

To add games, all you need to do is make a “games” folder in jam-version-assets. Then drag and drop each game with a .html file into its own folder (the games folder is ignored by the .gitignore to avoid cluttering the Github with a lot of data).

Then go into config.ini, and under `[Games]`, insert the game folder name and the location/name of the .html file. So for instance:
bead-fast = index.html

Would point to the bead-fast folder in Web/jam-version-assets/games.
And index.html points to Web/jam-version-assets/games/bead-fast/index.html

Then you need to add to `[GameNames]` to name each game (for user settings). It’s folder-name=Game Name. So for bead-fast, that’s:

`bead-fast = Bead Fast`


There are also special options that you can use for customizing the games if you have difficulty loading them. For instance, in the `[GamesConfig]` section. There are two options here:
`play-transition-prior=`
And
`slightly-more-time=`

Which both can be set to blank values, like so. They can also be set to a comma separated list of game names:

`play-transition-prior=bead-fast,rossfight,etc.`

`play-transition-prior` is for games that are chunky to load. Which means you should play the transition prior to loading them (otherwise your webpage will lag).

`slightly-more-time` games are for games where the developers cheated and only allow you to win a few seconds after an automatic lose. This should never happen, but does anyway. So you can give them some like a second more before they would autofail with this config setting.

## Custom Sounds
This is pretty simple. It’s drag and drop. There are sounds with certain IDs, you can just store them in the Web/jam-version-assets/sound folder to configure what sounds play (this is also ignored by the .gitignore to avoid clogging with data again).

Feel free to use the same naming conventions each time, though:
```ini
theme = theme.ogg ; the main menu theme
endTheme = endtheme.ogg ; the theme that plays for the lose screen
buttonHover = sfx_buttonHover.ogg ; button hover SFX
buttonClick = sfx_button.ogg ; button click SFX
winJingle = winJingle.wav ; The winning jingle
loseJingle = loseJingle.wav ; The losing jingle
```

## The Crap that should be changed if you have time
Ugh, my worst nightmare. I decided to include the theme specific .CSS and .JS animations as something configurable in config.ini

To make matters worse, the menu is also configurable in config.ini. What does that mean?

Instead of writing HTML, for writing the whole menu system that has to be done with config.ini

That makes some aspects easier. Like if you want to replace one menu image with another, you can just find where it’s defined in config.ini and change the source image (all stored in Web/jam-version-assets/art).

If you have the spare time, I’d encourage you to re-work this somehow in a way that makes sense. If not, I’d stick to just replacing images.

Config.Ini “HTML” Language
You start with the header:
`[HeaderName]`

Which defines a `<div>` element. Then you can add children:
`[HeaderName.p1]`

Which defines either `<p>` tags or `<img>` tags. Then, you can add specific info depending on the tag you want.

So for `[HeaderName.p1]`, you could add:
```ini
text=```
Text here
More text
`` `
```

To add some markdown formatted text.

For `[HeaderName.img]` you could add

`img=src.png`

To define a source from `Web/jam-version-assets/art/`

The Menu and Transitions art (as defined in `[Menu]` and `[Transitions]`) are created in `lib/options/menumanager.js` using the ElementCreator class.

There’s also:

`offset=(x,y,z)` to define the image’s absolute position.
`div=element-id-name` to define a `<div>` element (that will be created as a child of `[HeaderName]`) to store multiple elements under.
### Jam-Version-Assets .css and .js
Okay, this is the only advantage that this system provides. Sort of.


For .js, the only thing you should be concerned with is version-style.js, which defines initVersionStyle and versionStyleUpdate, both of which are used to control the timer based on the theme. That’s it.

And for CSS: you can define custom .css for all of the elements created to customize it according to the theme. The only trade-off is that you need to be knowledgeable about CSS. And worse still, if you’re looking to animate things (like in the transitions), you need to know about a special CSS language variant I made (this could probably be like an SCSS plugin if we transition to something like typescript): CCSS. The tutorial for using it is in Web/jam-version-assets/win-transition.css. But basically:

You define a global animation:
```css
@keyframes CCSSGLOBALanimationName {

/*A percentage to start at (just like a regular animation):*/
0% {
	/*A time that percentage starts:*/
	--time: Xs; /*(where Xs represents an arbitrary number of seconds, like 1s) */

	/* You define: */
	--ANIM-name: keyframesToPlay Ys selector; /*(where Ys is like Xs)*/

}
```
And that’s it. You can also chain CCSS animations by just using `--ANIM-name` in any `@keyframes` that is called by a CCSSGLOBAL keyframe object.

Feel free to also use @import to import more .css files to load in more styles and animations. That’s what version-style.css does.

To be honest, this should all be like a Blender/Adobe Animate script or something to automate the process. This makes things very complicated and very dependent on the idea that you know CSS. So my apologies.