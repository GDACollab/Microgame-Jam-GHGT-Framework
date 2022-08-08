class AudioManager {
    constructor(){
        this._sounds = {
            "theme": "theme.ogg",
            "buttonHover": "sfx_buttonHover.ogg",
            "buttonClick": "sfx_button.ogg",
            "winJingle": "winJingle.wav",
            "loseJingle": "loseJingle.wav"
        };

        for (var soundKey in this._sounds){
            var sound = this._sounds[soundKey];
            this._sounds[soundKey] = new Audio("./assets/sounds/" + sound);
            this._sounds[soundKey].autoplay = false;
        }
    }

    play(sound, volume = 1, varyPitch = false, looping = false){
        this._sounds[sound].loop = looping;
        this._sounds[sound].volume = volume;
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
    }

    stop(sound){
        this._sounds[sound].pause();
        this._sounds.currentTime = 0;
    }
}