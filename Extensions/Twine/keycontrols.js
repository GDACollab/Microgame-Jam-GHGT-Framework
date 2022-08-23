// From https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
function invertColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

// From https://stackoverflow.com/questions/13070054/convert-rgb-strings-to-hex-in-javascript
function rgbToHex(rgb){
    var rgbNoParen = rgb.split("(")[1].split(")")[0];
    var separate = rgbNoParen.split(",");
    // Ignore alpha values:
    if (rgb.includes("rgba")){
        separate = separate.slice(0, 3);
    }
    var hexArr = separate.map(function(num){
        num = parseInt(num).toString(16);
        return (num.length === 1) ? "0" + num : num;
    });
    return "#" + hexArr.join("");
}


// Left and right arrows to navigate through _selectableElements, up and down to scroll up and down (should be handled automatically by browser)?
// TODO: Also need helper text to tell people how to use the control scheme.
// Selecting scrolls you to where you need to be?
// Move into twine.js and minify:
var _selectableElements = [];
var _selectablePos = 0;
var _selected = {
    
};

function selectElementRecurse(element){
    if (element instanceof Element === false){
        return;
    }
    var computedStyle = window.getComputedStyle(element);
    if (computedStyle.display !== "none" && computedStyle.visibility !== "hidden" && computedStyle.cursor === "pointer"){
        _selectableElements.push(element);
    } else {
        for (var child in element.children){
            selectElementRecurse(element.children[child]);
        }
    }
}

function selectElement(element) {
    if (Object.keys(_selected).length > 0) {
        _selected.element.style.color = _selected.color;
        _selected.element.style.backgroundColor = _selected.backgroundColor;
    }

    
    _selected = {
        element: element,
        color: element.style.color,
        backgroundColor: element.style.backgroundColor
    };
    var computedStyle = window.getComputedStyle(document.body);

    var invertedBackground = invertColor(rgbToHex(computedStyle.backgroundColor));

    var invertedColor = invertColor(rgbToHex(computedStyle.color));

    element.style.backgroundColor = invertedBackground;
    element.style.color = invertedColor;
}

document.body.onkeydown = function (e) {
    _selectableElements = [];
    selectElementRecurse(document.body);
    if (e.key === 'ArrowLeft') {
        _selectablePos--;
        if (_selectablePos <= 0) {
            _selectablePos = 0;
        }
        if (_selectableElements.length > 0) {
            selectElement(_selectableElements[_selectablePos]);
        }
    }
    if (e.key === 'ArrowRight') {
        _selectablePos++;
        if (_selectablePos >= _selectableElements.length) {
            _selectablePos = _selectableElements.length - 1;
        }
        if (_selectableElements.length > 0) {
            selectElement(_selectableElements[_selectablePos]);
        } else {
            _selectablePos = 0;
        }
    }

    if (e.key === ' ') {
        e.preventDefault();
        _selectableElements[_selectablePos].click();
        _selectablePos = -1;
    }
}
