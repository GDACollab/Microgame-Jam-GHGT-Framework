import iniReader from "./configloader.js";

var ini;
/**
 * For playing sounds.
 * @file
 */

/**
 * For playing sounds.
 * @module gamesound
 */

/**
 * A way to play sounds and vary their pitch.
 * Used for the main menu.
 */
class AudioManager {
    #setupPromise;

    /**
     * @constructs AudioManager
     */
    constructor(){
        /**
         * Promise for waiting for the ini file from {@link module:configloader}, then calls {@link module:gamesound~AudioManager#constructSounds}.
         */
        this.#setupPromise = new Promise(async (resolve) => {
            ini = await iniReader;
            this.#constructSounds();
            resolve();
        });
    }

    /**
     * Returns {@link module:gamesound~AudioManager#setupPromise}
     */
    get onSetup() {
        return this.#setupPromise;
    }

    /**
     * Set up sounds from the ini file loaded from {@link module:configloader}.
     * @alias module:gamesound~AudioManager#constructSounds
     * @private
     */
    #constructSounds(){
        /**
         * Dictionary of sounds to play based on their names.
         * Initialized in {@link module:gamesound~AudioManager#constructSounds}
         * @type {Object.<string, Audio>}
         * @todo I don't know why this isn't a private variable. (Should be #sounds instead of _sounds).
         */
        this._sounds = ini["Sounds"];

        for (var soundKey in this._sounds){
            var sound = this._sounds[soundKey];
            this._sounds[soundKey] = new Audio("./jam-version-assets/sounds/" + sound);
            this._sounds[soundKey].autoplay = false;
        }
    }

    /**
     * Play a sound.
     * @param {string} sound Sound name that exists in {@link module:gamesound~AudioManager#_sounds}
     * @param {number} volume The volume to play the sound at.
     * @param {boolean} varyPitch Randomize the pitch on play?
     * @param {boolean} looping Loop the sound?
     * @param {function} callback Callback to play on sound stop.
     */
    play(sound, volume, varyPitch = false, looping = false, callback){
        this._sounds[sound].loop = looping;
        this._sounds[sound].volume = volume;
        this._sounds[sound].onended = function(){};
        // Because I don't want to do something as complicated as changing the pitch without changing speed by adding in a new library:
        if (varyPitch){
            this._sounds[sound].playbackRate = Math.floor((Math.random() * 100))/1000 + 0.95;
        }

        if (this._sounds[sound].paused){
            this._sounds[sound].play();
        } else {
            // Restart the sound if it's already being played:
            this._sounds[sound].currentTime = 0;
        }

        if (typeof callback === "function"){
            this._sounds[sound].onended = callback;
        }
    }

    /**
     * Update a sound playing.
     * @param {string} sound The sound to update from {@link module:gamesound~AudioManager#_sounds}.
     * @param {number} volume The volume to update the sound with.
     */
    updateSound(sound, volume) {
        this._sounds[sound].volume = volume;
    }

    /**
     * Stop a sound from playing.
     * @param {string} sound The sound to stop playing from {@link module:gamesound~AudioManager#_sounds}.
     */
    stop(sound){
        this._sounds[sound].pause();
        this._sounds.currentTime = 0;
        this._sounds[sound].onended = function(){};
    }
}

var GlobalAudioManager = new AudioManager();

export default GlobalAudioManager;