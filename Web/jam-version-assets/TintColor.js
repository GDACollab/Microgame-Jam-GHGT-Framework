/* 
MIT License

Copyright (c) 2018 Lam Pham

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

export class TintColor {
  constructor(_srcImage, _tintColor, _width=-1, _height=-1) {
    this._srcImage = _srcImage;
    this._tintColorArray = this._getRGBAArray(_tintColor);
    this._scale = [_width, _height];
  }
  setSourceImage(_srcImage) {
    this._srcImage = _srcImage;
    return this;
  }
  setTintColorArray(_tintColor) {
    this._tintColorArray = this._getRGBAArray(_tintColor);
    return this;
  }
  setScale(_width, _height){
    this._scale = [_width, _height];
  }
  run() {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      let image = new Image();
	    image.crossOrigin = "Anonymous";
      image.onload = () => {
        var width = image.width;
        if (this._scale[0] !== -1){
          width = this._scale[0];
        }

        var height = image.height;
        if (this._scale[1] !== -1){
          height = this._scale[1];
        }

        canvas.width  = width;
        canvas.height = height;

        context.drawImage(image, 0, 0, width, height);

        let imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        let data = imgData.data;

        // This tinting code sucks. I'm gonna "fix" it. It was originally just setting *any* pixel to the color.
        // With a normalized color array, we can instead mix more of the colors:
        for (let i = 0; i < data.length; i += 4) {
          // Change color of pixel which is different from transparent
          if (data[i + 0] || data[i + 1] || data[i + 2] || data[i + 3]) {
            data[i + 0] *= this._tintColorArray[0];
            data[i + 1] *= this._tintColorArray[1];
            data[i + 2] *= this._tintColorArray[2];
            data[i + 3] *= this._tintColorArray[3];
          }
        }
        context.putImageData(imgData, 0, 0);
        resolve({url: canvas.toDataURL(), width: width, height: height});
      };
      image.onerror = error => reject(this._srcImage, error);
      image.src = this._srcImage;
    });  
  }
  _getRGBAArray(color) {
    var colArr = [];
    // Check input as rgba/rgb color
    let m = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/.exec(color);
    if(m) {
      if(m[4]) return [m[1], m[2], m[3], m[4] * 255];
      colArr = [m[1], m[2], m[3], 255];
    }

    // Check input as hex 6-digit color
    m = /^#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/.exec(color);
    if(m) {
      colArr = [parseInt(m[1], 16), parseInt(m[2], 16) , parseInt(m[3], 16), 255];
    }

    // Treat color as a vector, so we're gonna "normalize" the rgb:
    var len = Math.sqrt(Math.pow(colArr[0], 2)  + Math.pow(colArr[1], 2) + Math.pow(colArr[2], 2));
    return [colArr[0]/len, colArr[1]/len, colArr[2]/len, colArr[3]/255];
  }
}
