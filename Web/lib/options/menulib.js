
class MenuVector {
    #x;
    #y;
    constructor() {
        if (arguments[0] instanceof Array) {
            this.#x = arguments[0][0];
            this.#y = arguments[0][1];
        } else if (arguments[0] instanceof MenuVector) {
            this.#x = arguments[0].x;
            this.#y = arguments[0].y;
        } else if (!isNaN(arguments[0]) && !isNaN(arguments[1])) {
            this.#x = arguments[0];
            this.#y = arguments[1];
        } else {
            console.error("Cannot create vector with arguments: ", arguments);
        }
    }
    get x() {
        return this.#x;
    }
    get y() {
        return this.#y;
    }

    dot(otherVector){
        return this.x * otherVector.x + this.y * otherVector.y;
    }
    dist(otherVector) {
        return Math.sqrt(Math.pow(this.x - otherVector.x, 2) + Math.pow(this.y - otherVector.y, 2));
    }
    // It is literally stupid that Javascript doesn't allow overloading of basic operations. WTF, Brendan Eich of Netscape.
    // What were you thinking.
    // Oh, you know what might be cool though? Without thinking about any security vulnerabilities this might pose  (probably why it'll be a bad idea):
    // Being able to set your own shorthand for macros in the script. Like .= for calling the dot product on a vector or something.
    add() {
        if (arguments[0] instanceof MenuVector) {
            this.#x += arguments[0].x;
            this.#y += arguments[0].y;
        } else if (!isNaN(arguments[0]) && !isNaN(arguments[1])) {
            this.#x += arguments[0];
            this.#y += arguments[1];
        } else {
            console.error("Cannot add vector with arguments " + arguments);
        }
        return this;
    }
    sub(otherVector) {
        if (arguments[0] instanceof MenuVector) {
            this.#x -= otherVector.x;
            this.#y -= otherVector.y;
        } else if (!isNaN(arguments[0]) && !isNaN(arguments[1])) {
            this.#x -= arguments[0];
            this.#y -= arguments[1];
        } else {
            console.error("Cannot sub vector with arguments " + arguments);
        }
        return this;
    }

    scalarMul(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    get length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)); 
    }

    normalized() {
        var size = this.length;
        this.#x /= size;
        this.#y /= size;
        return this;
    }

    static add(vec1, vec2) {
        return new MenuVector(vec1.x + vec2.x, vec1.y + vec2.y);
    }
    static sub(vec1, vec2) {
        return new MenuVector(vec1.x - vec2.x, vec1.y - vec2.y);
    }
    static scalarMul(vec, scalar) {
        return new MenuVector(vec.x * scalar, vec.y * scalar);
    }
    static normalized(vec) {
        var size = Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
        return new MenuVector(vec.x/size, vec.y/size);
    }
}

// Not actually a vector field (https://en.wikipedia.org/wiki/Vector_field), but a sloppy interpretation of one.
// Basically, given a 2D grid of positions, a present position, and a given direction, where will you go based on the direction?
class MenuVectorField {
    #selectables;
    #currPos;
    constructor(selectables, initialPos){
        // Validation would be easier with Typescript, but we're not in TS rn. Something to maybe fix in the future.
        // Copy array:
        this.#selectables = [...selectables];
        this.#currPos = initialPos;
    }

    raycast(from, direction){
        var closestDir = -1;
        var i = -1;
        this.#selectables.forEach(function(selectable, index){
            if (index !== this.#currPos) {
                var to = MenuVector.sub(selectable.position, from);
                var dot = direction.dot(MenuVector.normalized(to));
                if (dot > 0.5) {
                    var dirClose = MenuVector.scalarMul(direction, to.length).add(from);
                    var dist = dirClose.dist(selectable.position);
                    if (dist <= 100 && (dist < closestDir || closestDir === -1)) {
                        closestDir = dist;
                        i = index;
                    } 
                }
            }
        }, this);
        return i;
    }

    getFromDir(direction){
        // debugger;
        var pick = -1;
        if (direction.x !== 0 || direction.y !== 0) {
            pick = this.raycast(this.#selectables[this.#currPos].position, direction);

            if (pick  !== -1) {
                this.#currPos = pick;
            }
        }
        return pick;
    }

    get currPos() {
        return this.#currPos;
    }

    set currPos(pos){
        this.#currPos = pos;
    }
}

class Selectable {
    constructor(baseElement, existingPosition = null) {
        this.element = baseElement;
        if (existingPosition !== null) {
            this.position = new MenuVector(existingPosition.x + this.element.offsetLeft, existingPosition.y + this.element.offsetTop);
        } else {
            this.findPosition();
        }
    }

    // Based on the stuff I did for the twine extension.
    static generateSelectablesArr(element, position = new MenuVector(0, 0)){
        if (element instanceof Element === false) {
            return;
        }
        var arr = [];
        var select = new Selectable(element, position);

        if (select.isSelectableWithinBounds()) {
            arr.push(select);
        } else {
            for (var i = 0; i < element.children.length; i++) {
                var child = element.children[i];
                var newPos = new MenuVector(select.position);
                if (child.offsetParent === element.offsetParent) {
                    newPos.sub(element.offsetLeft, element.offsetTop);
                }
                var selectables = Selectable.generateSelectablesArr(child, newPos);
                arr.push(...selectables);
            }
        }
        return arr;
    }

    select() {
        this.element.classList.add("hover");
    }
    clearSelect() {
        this.element.classList.remove("hover");
    }
    click() {
        this.element.click();
    }
    
    findPosition(){
        this.position = new MenuVector(this.element.offsetLeft, this.element.offsetTop);
        var par = this.element.parentElement;
        while (par !== null) {
            if (par.parentElement !== null && par.parentElement.offsetParent !== par.offsetParent){
                this.position.add(par.offsetLeft, par.offsetTop);
            }
            par = par.parentElement;
        }
    }

    isSelectableWithinBounds(){
        var computedStyle = window.getComputedStyle(this.element);

        // Is the HTML element positioned within the bounds of the frame?
        var isWithinBounds = this.position.x > 0 && this.position.x < SCREEN_WIDTH && this.position.y > 0 && this.position.y < SCREEN_HEIGHT;
        
        // Next, does the CSS contribute to the position at all?
        // Assumes transforms only:
        var translateMatrix = computedStyle.transform.replace(")", "").split(",");
        var left = parseFloat(translateMatrix[4]);
        var top = parseFloat( translateMatrix[5]);
        var isWithinCSSBounds = false;
        if (!isNaN(left) && !isNaN(top)){
            isWithinCSSBounds = this.position.x + left > 0 && this.position.x + left < SCREEN_WIDTH && this.position.y + top > 0 && this.position.y + top < SCREEN_HEIGHT;
        } else if (computedStyle.transform === "none" && isWithinBounds) { // If no transform is set, we assume that the element's position is based solely on posLeft and posTop.
            isWithinCSSBounds = true;
        }

        return isWithinCSSBounds && computedStyle.display !== "none" && computedStyle.visibility !== "hidden" && computedStyle.cursor === "pointer";
    }
}

export {Selectable, MenuVector, MenuVectorField};