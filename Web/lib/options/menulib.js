/**
 * For storing various main menu functions and classes to help with navigation.
 * @file
 */
/**
 * For storing various utilities for navigating the main menu.
 * @module menulib
 */

/**
 * Vector implementation.
 */
class MenuVector {
    /**
     * X position. (Call this.#x)
     * @type {number} 
     */
    #x;
    /**
     * Y position.
     * @type {number}
     */
    #y;
    /**
     * @param {({x: number, y: number}|Tuple.<number, number>|...number)} arguments An object representing x and y, a tuple of x and y, or an arg list of x and y.
     * @constructs MenuVector
     */
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
    /**
     * Return {@link module:menulib~MenuVector#x}
     * @readonly
     */
    get x() {
        return this.#x;
    }
    /**
     * Return {@link module:menulib~MenuVector#y}
     * @readonly
     */
    get y() {
        return this.#y;
    }

    /**
     * 
     * @param {MenuVector} otherVector 
     * @returns {number} Dot product of the two vectors.
     */
    dot(otherVector){
        return this.x * otherVector.x + this.y * otherVector.y;
    }
    /**
     * 
     * @param {MenuVector} otherVector 
     * @returns {number} The distance between this vector and otherVector.
     */
    dist(otherVector) {
        return Math.sqrt(Math.pow(this.x - otherVector.x, 2) + Math.pow(this.y - otherVector.y, 2));
    }
    // It is literally stupid that Javascript doesn't allow overloading of basic operations. WTF, Brendan Eich of Netscape.
    // What were you thinking.
    // Oh, you know what might be cool though? Without thinking about any security vulnerabilities this might pose  (probably why it'll be a bad idea):
    // Being able to set your own shorthand for macros in the script. Like .= for calling the dot product on a vector or something.
    /**
     * Add arguments to self.
     * @param {({x: number, y: number}|Tuple.<number, number>|...number)} arguments An object representing x and y, a tuple of x and y, or an arg list of x and y.
     * @returns {MenuVector} Self.
     */
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
    /**
     * Subtract arguments from self.
     * @param {({x: number, y: number}|Tuple.<number, number>|...number)} arguments An object representing x and y, a tuple of x and y, or an arg list of x and y.
     * @returns {MenuVector} Self.
     */
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

    /**
     * Multiply x and y by scalar.
     * @param {number} scalar 
     * @returns {MenuVector} self.
     */
    scalarMul(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * The length of this vector.
     * @type {number}
     */
    get length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)); 
    }

    /**
     * Normalize self.
     * @returns {MenuVector} self.
     */
    normalized() {
        var size = this.length;
        this.#x /= size;
        this.#y /= size;
        return this;
    }

    /**
     * Add two vectors together.
     * @param {MenuVector} vec1 
     * @param {MenuVector} vec2 
     * @returns {MenuVector}
     */
    static add(vec1, vec2) {
        return new MenuVector(vec1.x + vec2.x, vec1.y + vec2.y);
    }
    /**
     * Subtract vec2 from vec1.
     * @param {MenuVector} vec1 
     * @param {MenuVector} vec2 
     * @returns {MenuVector}
     */
    static sub(vec1, vec2) {
        return new MenuVector(vec1.x - vec2.x, vec1.y - vec2.y);
    }
    /**
     * Multiply vec1 by scalar.
     * @param {MenuVector} vec1 
     * @param {number} scalar
     * @returns {MenuVector}
     */
    static scalarMul(vec, scalar) {
        return new MenuVector(vec.x * scalar, vec.y * scalar);
    }
    /**
     * Return a normalized vector.
     * @param {MenuVector} vec1 
     * @returns {MenuVector}
     */
    static normalized(vec) {
        var size = Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
        return new MenuVector(vec.x/size, vec.y/size);
    }
}

/**
 * Not actually a vector field (https://en.wikipedia.org/wiki/Vector_field), but a sloppy interpretation of one.
 * Basically, given a 2D grid of positions, a present position, and a given direction, where will you go based on the direction?
 */
class MenuVectorField {
    /**
     * List of selectables associated with this MenuVectorField.
     * @type {Array.<Selectable>}
     */
    #selectables;
    /**
     * The current selectable we're at.
     * @type {number}
     */
    #currPos;
    /**
     * @constructs MenuVectorField
     * @param {Array.<Selectable>} selectables 
     * @param {number} initialPos 
     */
    constructor(selectables, initialPos){
        // Validation would be easier with Typescript, but we're not in TS rn. Something to maybe fix in the future.
        // Copy array:
        this.#selectables = [...selectables];
        this.#currPos = initialPos;
    }

    /**
     * Like a raycast, except this also accounts for rays that are CLOSE enough for the MenuVector field to qualify as "good enough".
     * So that means that this raycast returns some kind of Selectable, provided that Selectable is either:
     * Hit by the ray (the ray at some point is within its rectangle).
     * This will return the selectable that has the closest distance to where the raycast "hits", provided the distance is within the "threshold".
     * We prioritize elements that are closer to the current element, since this is meant to be used for navigation.
     * @param {MenuVector} from 
     * @param {MenuVector} direction 
     * @param {number} threshold The maximum distance a given Selectable from `from` can have to be selected.
     * @returns {number} Index of closest selectable from raycast.
     */
    raycastEstimate(from, direction, threshold = 100){
        var closestDir = -1;
        var i = -1;
        
        // Time to do some cool Calculus ***t *** ********.
        // Optimization! https://tutorial.math.lamar.edu/Classes/CalcI/Optimization.aspx

        // Direction = (dx/dt, dy/dt).
        // So direction.y = dy/dt, y = direction.y * t + C_1.
        // And direction.x = dx/dt, x = direction.x * t + C_2.
        // C_1 and C_2 are just from.y and from.x respectively.
        this.#selectables.forEach(function(selectable, index){
            if (index !== this.#currPos) {
                // The ray gives us an equation that we can solve for:
                
                var to = MenuVector.sub(selectable.center, from);
                var dot = direction.dot(MenuVector.normalized(to));
                if (dot > 0.5) {
                    // Now we construct a function that, given some value t, gives us the distance to the center of the rect.
                    // If you look at the problem on graph paper, you'll see that (For STRAIGHT LINES) the closest distance to any rect is also the closest point to that rect's center.
                    // Then we want to find the global minima of that function.

                    // sqrt( (direction.y * t + C_1 - center.y, 2)^2 + (direction.x * t + C_2 - center.x)^2 )
                    // Is the function that gives us the distance between any given point on our line constructed from the ray and the center.
                    // Taking the derivative with respect to t, we get
                    // (direction.y * (direction.y * t + C_1 - center.y) + direction.x * (direction.x * t + C_2 - center.x))/the whole sqrt from before, I'm not gonna write it all out.
                    // We want the smallest value, so we need to find where the values of dt are zero. Setting the LHS to zero, we get:
                    // 0 = direction.y * (direction.y * t + C_1 - center.y) + direction.x * (direction.x * t + C_2 - center.x).
                    // And there's only one value of t, which is our global minima:
                    // t = (direction.y * (center.y - C_1) + direction.x * (center.x - C_2))/(direction.x^2 + direction.y^2).

                    // Visualization: https://www.desmos.com/calculator/kl2oypib1f
                    var t = (direction.y * (selectable.center.y - from.y) + direction.x * (selectable.center.x - from.x))/(Math.pow(direction.x, 2) + Math.pow(direction.y, 2));
                    // And so we get the x and y from our t-value:
                    var dirClose = new MenuVector(direction.x * t + from.x, direction.y * t + from.y);
                    // And now we just find the distance, and see if it's closer than the other distances we've calculated.
                    var dist = dirClose.dist(selectable.center);

                    var selectFullPos = selectable.fullPos;
                    var withinRectBounds = dirClose.x >= selectFullPos.x && dirClose.x <= selectFullPos.x + selectable.element.offsetWidth && dirClose.y >= selectFullPos.y && dirClose.y <= selectFullPos.y + selectable.element.offsetHeight;

                    var actualElementDist = from.dist(selectable.center);
                    if ((dist <= threshold || withinRectBounds) && (actualElementDist < closestDir || closestDir === -1)) {
                        closestDir = actualElementDist;
                        i = index;
                    } 
                }
            }
        }, this);
        return i;
    }

    /**
     * Given our current selector ({@link module:menulib~MenuVectorField#currPos}), pick another close-by selector in the given direction.
     * @param {MenuVector} direction A unit vector.
     * @returns {number} Index from {@link module:menulib~MenuVectorField#selectables}
     */
    getFromDir(direction){
        var pick = -1;
        if (direction.x !== 0 || direction.y !== 0) {
            pick = this.raycastEstimate(this.#selectables[this.#currPos].center, direction);

            if (pick  !== -1) {
                this.#currPos = pick;
            }
        }
        return pick;
    }

    /**
     * Getter and setter for {@link module:menulib~MenuVectorField#currPos}
     */
    get currPos() {
        return this.#currPos;
    }

    set currPos(pos){
        this.#currPos = pos;
    }
}

/**
 * Selectable element. Treated as a 2D box shape.
 */
class Selectable {
    /**
     * Center of the box shape.
     */
    #center;
    /**
     * 
     * @param {Element} baseElement The element that the selectable is using.
     * @param {{x: number, y: number}} existingPosition The existing position of the element.
     * @constructs Selectable
     */
    constructor(baseElement, existingPosition = null) {
        this.element = baseElement;
        if (existingPosition !== null) {
            /**
             * The current position of the Selectable in HTML space (CSS not included, that's added in {@link module:menulib~MenuVectorField#fullPos})
             */
            this.position = new MenuVector(existingPosition.x + this.element.offsetLeft, existingPosition.y + this.element.offsetTop);
        } else {
            this.findPosition();
        }
        this.#center = new MenuVector(this.position.x + this.element.offsetWidth/2, this.position.y + this.element.offsetHeight/2);
    }

    /**
     * Returns {@link module:menulib~MenuVectorField#position} plus the CSS offsets.
     * @type {MenuVector}
     * @readonly
     */
    get fullPos() {
        var toReturn = new MenuVector(this.position);
        var translateMatrix = window.getComputedStyle(this.element).transform.replace(")", "").split(",");
        var left = parseFloat(translateMatrix[4]);
        var top = parseFloat( translateMatrix[5]);
        if (!isNaN(left) && !isNaN(top)){
            toReturn.add(left, top);
        }
        return toReturn;
    }

    /**
     * Return the full center from our element plus the CSS offsets.
     * @type {MenuVector}
     * @readonly
     */
    get center() {  
        var toReturn = new MenuVector(this.#center);
        var translateMatrix = window.getComputedStyle(this.element).transform.replace(")", "").split(",");
        var left = parseFloat(translateMatrix[4]);
        var top = parseFloat( translateMatrix[5]);
        if (!isNaN(left) && !isNaN(top)){
            toReturn.add(left, top);
        }
        return toReturn;
    }

    /**
     * Generate an array of {@link module:menulib~Selectable} from the children of a given element. Recursively called.
     * Based on the stuff I did for the twine extension.
     * @param {Element} element Element's children to search.
     * @param {*} position Offset of position to start from.
     * @param {*} selectableFunc The {@link module:menulib~Selectable} function to call with a position to determine whether or not it's added to the array.
     * @param {*} globalParentPos The position of the current parent.
     * @returns {Array.<Selectable>}
     */
    static generateSelectablesArr(element, position = new MenuVector(0, 0), selectableFunc = "isSelectableWithinBounds", globalParentPos = null){
        if (element instanceof Element === false) {
            return;
        }
        var arr = [];
        var select = new Selectable(element, position);

        if (globalParentPos === null) {
            globalParentPos = new MenuVector(select.position);
        }

        if (select[selectableFunc](globalParentPos)) {
            arr.push(select);
        } else if (element.getAttribute("hidden") === null) { // If the child elements aren't hidden, keep going:
            for (var i = 0; i < element.children.length; i++) {
                var child = element.children[i];
                var newPos = new MenuVector(select.position);
                if (child.offsetParent === element.offsetParent) {
                    newPos.sub(element.offsetLeft, element.offsetTop);
                }
                var selectables = Selectable.generateSelectablesArr(child, newPos, selectableFunc, globalParentPos);
                arr.push(...selectables);
            }
        }
        return arr;
    }

    /**
     * Selects this element.
     */
    select() {
        this.element.classList.add("hover");
    }
    /**
     * Unselects this element.
     */
    clearSelect() {
        this.element.classList.remove("hover");
    }
    /**
     * Clicks this element.
     */
    click() {
        this.element.click();
    }
    
    /**
     * Calculate this element's position based on its current HTML offset and its parent's HTML offsets.
     */
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

    /**
     * Returns whether or not this element is selectable.
     * @returns {boolean}
     */
    isSelectable() {
        var computedStyle = window.getComputedStyle(this.element);
        return computedStyle.display !== "none" && computedStyle.visibility !== "hidden" && computedStyle.cursor === "pointer";
    }

    /**
     * Calculates the visibility of the Selectable given its current position within the frame, and returns true if it's visible within the HTML frame, and false otherwise.
     * @param {MenuVector} baseOffset How much the Selectable is offset from its given position (i.e., how do its parents offset it?).
     * @returns {boolean}
     */
    isSelectableWithinBounds(baseOffset){
        var computedStyle = window.getComputedStyle(this.element);

        // Is the HTML element positioned within the bounds of the frame?
        var isWithinBounds = this.position.x > baseOffset.x && this.position.x < SCREEN_WIDTH + baseOffset.x && this.position.y > baseOffset.y && this.position.y < SCREEN_HEIGHT + baseOffset.y;
        
        // Next, does the CSS contribute to the position at all?
        // Assumes transforms only:
        var translateMatrix = computedStyle.transform.replace(")", "").split(",");
        var left = parseFloat(translateMatrix[4]);
        var top = parseFloat( translateMatrix[5]);
        var isWithinCSSBounds = false;
        if (!isNaN(left) && !isNaN(top)){
            isWithinCSSBounds = this.position.x + left > baseOffset.x && this.position.x + left < SCREEN_WIDTH + baseOffset.x && this.position.y + top > baseOffset.y && this.position.y + top < SCREEN_HEIGHT + baseOffset.y;
        } else if (computedStyle.transform === "none" && isWithinBounds) { // If no transform is set, we assume that the element's position is based solely on posLeft and posTop.
            isWithinCSSBounds = true;
        }

        return isWithinCSSBounds && computedStyle.display !== "none" && computedStyle.visibility !== "hidden" && computedStyle.cursor === "pointer";
    }
}

export {Selectable, MenuVector, MenuVectorField};