/**
 * Okay, so config.ini as it currently works as stuff to be loaded in on the fly. At some point that will hopefully get actually compiled into useful data instead of being read on the fly. But I've already spent a lot of time on this system, so that improvement isn't happening this year.
 * So we need a list of globals for any Javascript file to read easy, and for developers (i.e., you) to mess around with.
 * I only thought of this close to finish. This is meant to be changeable for games that were developed with maybe different sizes in mind?
 * But there's no way to guarantee compatibility. It's just to make updating portions of the code slightly easier on you.
* @file
 */
/**
 * Width of games to be displayed. 
 * @type {number}
 * @default 960
*  */
const SCREEN_WIDTH = 960;
/**
 * Height of games to be displayed.
 * @type {number}
 * @default 540
 */
const SCREEN_HEIGHT = 540;

/**
 *  Maximum seconds that the timer is allowed to be set to.
 * @type {number}
 * @default 15
 *  */
const MAX_ALLOWED_TIMER = 15;
/**
 * Minimum amount of seconds that the timer must be set to.
 * @type {number}
 * @default 5
 */
const MIN_ALLOWED_TIMER = 5;

/**
 * The difficulty to set if DEBUG_TEST is set to sequential. 
 * @type {number} */
const DEBUG_DIFFICULTY = -1;
/** Pick a game to repeatedly test. Set "sequential" to go through all the games in order:
 * @type {string}
 * @default 
*/
const DEBUG_TEST = "";


/** 
 * Set to "win" to debug win transitions on loop, set to "lose" to debug lose transitions on loop. Set to "" or any other value to debug nothing.
 * @type {string}
 * @default 
 */
const DEBUG_TRANSITION = "";
/**
 * Set to "loop-end" to allow the animation to infinitely loop at the end. Set to "loop" to let the animation play normally (but restart after it finishes). Set to "pause" to "freeze" at the end of the animation (it actually just leaves animation settings at the end. Infinitely looping iterations will continue to loop). Set to "none" or any other value to allow the animation to play normally.
 * 
 */
const DEBUG_TRANSITION_LOOP = "loop";
/** 
 * set to the number of lives you want to debug.
 * @type {number}
 * @default 3
 */
const DEBUG_TRANSITION_LIVES = 3;
/**
 * set to "true" to debug a lost life animation.
 * @type {boolean}
 * @default false
  */
const DEBUG_TRANSITION_LIFE_LOST = false;