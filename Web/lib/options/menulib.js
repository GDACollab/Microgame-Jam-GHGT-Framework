
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
            this.#x += otherVector.x;
            this.#y += otherVector.y;
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
        } else if (arguments[0] instanceof Number && arguments[1] instanceof Number) {
            this.#x -= arguments[0];
            this.#y -= arguments[1];
        } else {
            console.error("Cannot sub vector with arguments " + arguments);
        }
        return this;
    }
    normalized() {
        var size = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
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
    static normalized(vec) {
        var size = Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
        return new MenuVector(vec.x/size, vec.y/size);
    }
}

// Not actually a vector field (https://en.wikipedia.org/wiki/Vector_field), but a sloppy interpretation of one.
// Basically, given a 2D grid of positions, a present position, and a given direction, where will you go based on the direction?
class MenuVectorField {
    #positions;
    #currPos;
    constructor(positions, initialPos){
        this.#positions = positions;
        this.#currPos = initialPos;
    }

    getFromDir(direction){
        if (direction.x !== 0 || direction.y !== 0) {
            var oldSelect = this.#currPos;
            this.#currPos = -1;

            var closestDist = -1;
            var currPosVec = this.#positions[oldSelect];

            this.#positions.forEach(function(pos, index){
                if (index !== oldSelect) {
                    var searchVec = MenuVector.sub(pos, currPosVec);

                    var dist = direction.dist(MenuVector.normalized(pos));
                    var dot = direction.dot(searchVec);
                    if (dot > 0.5 && (dist < closestDist || closestDist === -1)) {
                        closestDist = dist;
                        this.#currPos = index;
                    }
                }
            }, this);

            if (this.#selectedElement === -1) {
                this.#selectedElement = oldSelect;
            }
        }
        return this.#currPos;
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
            this.position.add(par.offsetLeft, par.offsetTop);
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