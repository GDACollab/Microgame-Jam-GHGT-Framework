// Left and right arrows to navigate through _selectableElements, up and down to scroll up and down (should be handled automatically by browser)?
// TODO: Also need helper text to tell people how to use the control scheme.
// Need to get this to work with different colors
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
    if ((computedStyle.display !== "none" && element.style.display !== "none") && (computedStyle.visibility !== "hidden" && element.style.visibility !== "hidden") && (computedStyle.cursor === "pointer" || element.style.cursor === "pointer")){
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
    element.style.backgroundColor = "#000000";
    element.style.color = "#ffffff";
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
