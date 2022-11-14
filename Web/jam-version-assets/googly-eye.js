window.addEventListener("load", function(){
    document.querySelectorAll(".googly-eye").forEach(function(eye){
        var elementId = eye.id.replace("-eye", "");
        var innerEye = eye.children[0];
        var rangeElement = document.getElementById(elementId);

        var innerUp = 0;
        var innerLeft = 0;

        var oldVal = rangeElement.value;

        document.getElementById(elementId).oninput = function(ev) {
            eye.style.left = (((parseInt(rangeElement.value) - parseInt(rangeElement.min))/parseInt(rangeElement.max)) * parseFloat(eye.getAttribute("scale"))) + rangeElement.offsetLeft + "px";
            eye.style.top = (rangeElement.offsetTop - 2) + "px";

            innerUp -= 40 * Math.abs(rangeElement.value - oldVal);
            innerLeft -= 1 * (rangeElement.value - oldVal);

            oldVal = rangeElement.value;
        }
        eye.style.left = (((parseInt(rangeElement.value) - parseInt(rangeElement.min))/parseInt(rangeElement.max)) * parseFloat(eye.getAttribute("scale"))) + rangeElement.offsetLeft + "px";
        eye.style.top = (rangeElement.offsetTop - 2) + "px";

        var radius = 40;
        setInterval(function(){
            innerUp += 40;

            innerUp = Math.min(innerUp, radius);
            innerUp = Math.max(innerUp, -radius);

            innerLeft = Math.min(innerLeft, radius);
            innerLeft = Math.max(innerLeft, -radius);
            
            innerEye.style.transform = `translate(${innerLeft}%, ${innerUp}%)`;
        }, 50);
    });
});