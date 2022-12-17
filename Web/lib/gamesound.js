import iniReader from "./configloader.js";

var ini;

class AudioManager {
    #setupPromise;

    constructor(){
        this.#setupPromise = new Promise(async (resolve) => {
            ini = await iniReader;
            this.#constructSounds();
            resolve();
        });
    }

    get onSetup() {
        return this.#setupPromise;
    }

    #constructSounds(){
        this._sounds = ini["Sounds"];

        for (var soundKey in this._sounds){
            var sound = this._sounds[soundKey];
            this._sounds[soundKey] = new Audio("./jam-version-assets/sounds/" + sound);
            this._sounds[soundKey].autoplay = false;
        }
    }

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

    updateSound(sound, volume) {
        this._sounds[sound].volume = volume;
    }

    stop(sound){
        this._sounds[sound].pause();
        this._sounds.currentTime = 0;
        this._sounds[sound].onended = function(){};
    }
}

var GlobalAudioManager = new AudioManager();

export default GlobalAudioManager;