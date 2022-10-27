class AudioManager {
    constructor(){
        this._sounds = ini["Sounds"];

        for (var soundKey in this._sounds){
            var sound = this._sounds[soundKey];
            this._sounds[soundKey] = new Audio("./jam-version-assets/sounds/" + sound);
            this._sounds[soundKey].autoplay = false;
        }
    }

    play(sound, volume = 1, varyPitch = false, looping = false, callback){
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

    stop(sound){
        this._sounds[sound].pause();
        this._sounds.currentTime = 0;
        this._sounds[sound].onended = function(){};
    }
}