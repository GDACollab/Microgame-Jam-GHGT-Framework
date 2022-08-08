class AudioManager {
    constructor(){
        this._sounds = {
            "theme": "example.wav",
            "buttonHover": "example.ogg",
            "buttonClick": "example.wav",
            "winJingle": "example.wav",
            "loseJingle": "example.ogg"
        };

        for (var soundKey in this.sounds){
            var sound = this._sounds[soundKey];
            this._sounds[soundKey] = new Audio("./assets/sounds/" + sound);
        }
    }

    play(sound, varyPitch = false, looping = false, volume = 1){
        this._sounds[sound].looping = looping;
        this._sounds[sound].volume = volume;
        // Because I don't want to do something as complicated as changing the pitch without changing speed by adding in a new library:
        if (varyPitch){
            this._sounds[sound].playBackRate = Math.floor(Math.random() * 0.1) + 0.95;
        }

        if (sound.ended){
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