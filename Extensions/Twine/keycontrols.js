// TODO: Move this into twine.js (and minify):
var _selectableElements = [];

function init(){
    setInterval(function() {
        _selectableElements = [];
        selectElementRecurse(document.body)
    }, 500);
}

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