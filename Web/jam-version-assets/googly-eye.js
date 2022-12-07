var googlyEyes = [];

function setUpGooglyEyes() {
    document.querySelectorAll(".googly-eye").forEach(function(eye){
        var elementId = eye.id.replace("-eye", "");
        var innerEye = eye.children[0];
        var rangeElement = document.getElementById(elementId);
    
        var innerUp = 0;
        var innerLeft = 0;
    
        var oldVal = rangeElement.value;
        var refTop = eye.offsetTop;
        var rangeElTop = rangeElement.offsetTop;
        var left = parseFloat(eye.getAttribute("left"));
    
        document.getElementById(elementId).oninput = function(ev) {
            eye.style.left = ((((parseInt(rangeElement.value) - parseInt(rangeElement.min))/parseInt(rangeElement.max)) * parseFloat(eye.getAttribute("scale"))) + rangeElement.offsetLeft + left) + "px";
            
            eye.style.top = (rangeElTop - refTop - 2) + "px";
    
            innerUp -= 40 * Math.abs(rangeElement.value - oldVal);
            innerLeft -= 1 * (rangeElement.value - oldVal);
    
            oldVal = rangeElement.value;
        }
        eye.style.left = ((((parseInt(rangeElement.value) - parseInt(rangeElement.min))/parseInt(rangeElement.max)) * parseFloat(eye.getAttribute("scale"))) + rangeElement.offsetLeft + left) + "px";
        
        eye.style.top = (rangeElTop - refTop - 2) + "px";
    
        var radius = 40;
        googlyEyes.push(function(){
            innerUp += 40;
    
            innerUp = Math.min(innerUp, radius);
            innerUp = Math.max(innerUp, -radius);
    
            innerLeft = Math.min(innerLeft, radius);
            innerLeft = Math.max(innerLeft, -radius);
            
            innerEye.style.transform = `translate(${innerLeft}%, ${innerUp}%)`;
        });
    });    
}

function updateGooglyEyes() {
    googlyEyes.forEach(function(func) { func(); });
}

export {setUpGooglyEyes, updateGooglyEyes};