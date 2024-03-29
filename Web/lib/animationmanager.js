import iniReader from "./configloader.js";
/**
 * Module for managing all custom CCSS animations
 * @module animationmanager
 * @tutorial adding-games
 */

var ini;
iniReader.then((dat) => {
    ini = dat;
});

/**
 * Base for all animations.
 */
class CCSSAnimationBase {
    /**
     * @constructs CCSSAnimationBase
     * @param {CSSRule} cssRule The associated CSSRule we're constructing this from (i.e., the relevant @keyframes bit)
     */
    constructor(cssRule) {
        /**
         * The animation name.
         * @type {string}
         */
        this.name = cssRule.name;
        /**
         * What animation this belongs to.
         * @type {string}
         */
        this.globalParent = "";

        /**
         * A map of all the keyframes by the time that they will play at.
         * Uses a map to guarantee insertion order.
         * some_store is actually not set here. Rather, it will either be "index" or "percent", depending on the descendant.
         * @type {Map.<number, {animations: Array.<CCSSAnimationBase>, some_store: number}>}
         */
        this.timeline = new Map();

        this.currTime = 0;
        this.playStack = [];

        
    }

    /**
     * Called exclusively by {@link module:animationmanager~CCSSAnimationBase#readToAnimStore} for reading an animation property and getting data.
     * @param {string} animProp Property value for animation
     * @returns {{animName: string, duration: number, selectors: Array.<string>}} An object containing animation data.
     */
    evaluateCCSSAnimProp(animProp) {
        var animDat = {};

        var animProps = animProp.split(" ");
        // If the browser doesn't remove the space in front, we will:
        if (animProps[0] === "") {
            animProps.shift();
        }

        // It's always first the name of the animation to play, then how long it lasts:
        animDat.animName = animProps[0].replaceAll(" ", "");
        animDat.duration = parseFloat(animProps[1].replaceAll(/ |s/g, ""));

        // Everything else is selectors:
        animDat.selectors = [];
        for (var i = 2; i < animProps.length; i++){
            animDat.selectors.push(animProps[i].replaceAll(" ", ""));
        }

        return animDat;
    }

    /**
     * Reads a CSSKeyframeRule and stores all the relevant CCSS Information (like variable and timing information from --ANIM- variables) to a store.
     * @param {CSSKeyframeRule} frame
     * @returns {Object.<string, {animName: string, duration: number, selectors: Array.<string>}>} Store of all frame animation values.
     */
    readToAnimStore(frame){
        var animationStore = {setVariables: {}};
        for (var i = 0; i < frame.style.length; i++) {
            var styleName = frame.style[i];
            if (styleName.substring(0, 7) === "--ANIM-") {
                var fullAnimName = styleName.substring(7);
                var isAnimProp = /-animation-(timing-function|delay|direction|iteration-count|play-state)$/.exec(fullAnimName);
                if(isAnimProp) {
                    var actualAnimName = fullAnimName.substring(0, isAnimProp.index);
                    var propName = isAnimProp[1];
                    if (!(actualAnimName in animationStore)) {
                        animationStore[actualAnimName] = {};
                    }
                    
                    animationStore[actualAnimName][propName] = frame.style.getPropertyValue(styleName);
                } else {
                    if (!(fullAnimName in animationStore)) {
                        animationStore[fullAnimName] = {};
                    }

                    var animProps = this.evaluateCCSSAnimProp(frame.style.getPropertyValue(styleName));

                    Object.keys(animProps).forEach(function(propName){
                        animationStore[fullAnimName][propName] = animProps[propName];
                    });
                }
            } else if (styleName.substring(0, 6) === "--SET-") {
                var setName = styleName.substring(6);

                var args = frame.style.getPropertyValue(styleName).replaceAll(/var\(|\s+|\)/g, "").split(",");
                animationStore.setVariables[setName] = {varName: args[0], selector: args[1], value: args[2]};
            }
        }

        return animationStore;
    }

    /**
     * 
     * @param {number} totalPlayTime Total duration this animation has been playing for.
     * @param {number} nextTime The time the next keyframe will start.
     * @returns {{animations: Object.<string, Object.<string, *>>, isFinished: boolean}} Animations is the result of (or an object in the shape of the result of) {@link module:animationmanager~CCSSAnimationBase#readToAnimStore}.
     */
    frameUpdate(totalPlayTime, nextTime){
        // The offset is used for things like delays.
        if (totalPlayTime >= nextTime + this.nextTimeOffset) {
            var currAnimDat = this.timeline.get(nextTime);
            this.playStack.shift();

            var isFinished = this.playStack.length === 0;

            if (Object.keys(currAnimDat.animations.setVariables).length > 0) {
                for (var variableName in currAnimDat.animations.setVariables) {
                    var variableInfo = currAnimDat.animations.setVariables[variableName];
                    document.querySelectorAll(variableInfo.selector).forEach(function(element){
                        element.style.setProperty(variableInfo.varName, variableInfo.value);
                    });
                }
            }

            return {animations: (currAnimDat.animations !== undefined) ? currAnimDat.animations : [], isFinished: isFinished};
        }

        return null;
    }

    /**
     * Starts playing the animation.
     * @param {number} time The time from {@link module:animationmanager~AnimationManager#frameUpdate}.
     * @param {Object.<string, Object>} options A set of options inherited from the parent {@link module:animationmanager~CCSSAnimationBase}, ultimately created by {@link module:animationmanager~CCSSGlobalAnimation#playKeyframedAnimation} 
     */
    initPlay(time, options){
        /**
         * The time when this animation started playing.
         */
        this.currTime = time;
        /**
         * If the animation is playing but needs to be delayed for a certain amount of time, how much time (in ms) we should wait. Not set in this class, but in its descendants.
         */
        this.nextTimeOffset = 0;
        /**
         * A stack of all the keyframes to play one after the other.
         */
        this.playStack = Array.from(this.timeline.keys());
        /**
         * The options inherited from the parent {@link module:animationmanager~CCSSAnimationBase}, ultimately created by {@link module:animationmanager~CCSSGlobalAnimation#playKeyframedAnimation}.
         */
        this.options = options;
    }
}

/**
 * Regular CSS animation with some CCSS properties to use.
 * @extends module:animationmanager~CCSSAnimationBase

*/ 
class CCSSAnimation extends CCSSAnimationBase {
    /** 
     * @constructs CCSSAnimation
     * @param {CSSKeyframesRule} cssRule The associated CSSRule we're constructing this from (i.e., the relevant @keyframes bit)
     */
    constructor(cssRule){
        super(cssRule);

        /**
         * How long the animation will last for. Set in {@link module:animationmanager~CCSSAnimation#initPlay}.
         * @type {number}
         */
        this.duration = 0;
        /**
         * The elements this animation is influencing. Set in {@link module:animationmanager~CCSSAnimation#initPlay}.
         */
        this.elements = [];

        for (var frame of cssRule.cssRules) {
            var fraction = parseInt(frame.keyText.replace("%", ""))/100;

            this.timeline.set(fraction, {fraction: fraction, animations: this.readToAnimStore(frame)});
        }
    }

    frameUpdate(time) {
        // Adjust so that time works in percentages:
        var totalPlayTime = (time - this.currTime)/(this.duration * 1000);
        
        this.elements.forEach(function(element){
            element.style.setProperty("--anim-time", Math.min(totalPlayTime, 1));
        }, this);

        // Should be in chronological order, so we just need to pull the first value:
        var nextTime = this.playStack[0];
        return super.frameUpdate(totalPlayTime, nextTime);
    }

    /**
     * Called by {@link module:animationmanager~CCSSAnimation#initPlay}. This should probably be a static function.
     * @param {Object.<string, Object>} animationObj Animation object. Ultimately generated by {@link module:animationmanager~CCSSAnimationBase#frameUpdate}.
     * @param {HTMLElement} element An element that this animation is attached to.
     */
    genProps(animationObj, element) {
        if ("timing-function" in animationObj) {
            element.style.animationTimingFunction = animationObj["timing-function"];
        }

        if ("delay" in animationObj) {
            element.style.animationDelay = animationObj["delay"];
        }

        if ("direction" in animationObj) {
            element.style.animationDirection = animationObj["direction"];
        }

        if ("iteration-count" in animationObj) {
            element.style.animationIterationCount = animationObj["iteration-count"];
        }

        if ("play-state" in animationObj) {
            element.style.animationPlayState = animationObj["play-state"];
        }
    }

    initPlay(time, animationObj, parent, options){
        this.globalParent = parent;
        super.initPlay(time, options);

        // Add a delay to how we evaluate this animation, so that timing doesn't have to be re-adjusted.
        if ("delay" in animationObj) {
            this.nextTimeOffset = parseFloat(animationObj["delay"].replaceAll(/ |s/g, ""));
        }

        this.duration = animationObj.duration;

        this.elements = [];
        animationObj.selectors.forEach(function(selector){
            this.elements = this.elements.concat(Array.from(document.querySelectorAll(selector)));
        }, this);

        this.elements.forEach(function(element){
            element.style.animationName = this.name;
            element.style.animationDuration = this.duration + "s";
            
            // We set fillMode to both so that animation data persists until we clear it:
            element.style.animationFillMode = "both";
            this.genProps(animationObj, element);
        }, this);
    }

    /**
     * We keep animations so that CSS info can persist after something happens. Call this only after you want to stop ALL animations.
     * Should probably be static.
     */
    clearAnimation(){
        this.elements.forEach(function(element) {
            element.style.animationTimingFunction = "";
            element.style.animationDirection = "";
            element.style.animationIterationCount = "";
            element.style.animationPlayState = "";
            element.style.animationDelay = "";
            element.style.animationName = "";
            element.style.animationDuration = "";
            element.style.animationFillMode = "";
        });
    }
}

/**
 * Keyframed animation that controls all other animations.
 * Unique from other CSS animations that have keyframes in that it precisely controls when certain animations start and stop.
 * See version-style.css for more info.
 * @see {@link module:versionstyle}
 */
class CCSSGlobalAnimation extends CCSSAnimationBase {
    /**
     * This constructor is with the assumption that the keyframes start with CCSSGLOBAL, and that you follow how CCSSGLOBAL animations are supposed to work according to version-style.css.
     * @param {CSSKeyframesRule} cssRule Associated @keyframes rule.
     * @constructs CCSSGlobalAnimation
     * @extends module:animationmanager~CCSSAnimationBase
     */
    constructor(cssRule){
        super(cssRule);

        var timings = {};

        for (var frame of cssRule.cssRules) {
            timings[frame.keyText] = parseFloat(frame.style.getPropertyValue("--time").replaceAll(/ |s/g, ""));
        }

        var index = 0;

        for (var frame of cssRule.cssRules) {
            var time = parseFloat(frame.style.getPropertyValue("--time").replaceAll(/ |s/g, ""));

            var timeDat = {time: time};

            var postLoop = frame.style.getPropertyValue("--post-loop");

            if (postLoop !== "") {
                timeDat.postLoop = timings[postLoop.replace(" ", "")];
            }

            var loop = frame.style.getPropertyValue("--loop");

            if (loop !== "") {
                timeDat.loop = timings[loop.replace(" ", "")];
            }

            var animationStore = this.readToAnimStore(frame);

            timeDat.animations = animationStore;

            timeDat.index = index;

            index++;

            this.timeline.set(time, timeDat);
        }
    }

    frameUpdate(time){
        // Because the time we pull from in CSS is in terms of seconds, we convert to that here:
        var totalPlayTime = (time - this.currTime)/1000;

        // Should be in chronological order, so we just need to pull the first value:
        var nextTime = this.playStack[0];
        
        this.currFrame = this.timeline.get(nextTime);

        var shouldLoop = this._shouldLoop(time, this);

        // We need to be able to transition out of a loop ASAP for loading.
        if ("postLoop" in this.currFrame && !shouldLoop) {
            var start = this.timeline.get(this.currFrame.postLoop).index;

            // Because we've been looping for who knows how long, we need to treat it as if we were playing the animation normally:
            this.playStack = Array.from(this.timeline.keys()).slice(start);

            // If we've gone above the current time for the post loop, reset it back to normal:
            
            if (totalPlayTime > this.currFrame.postLoop) {
                this.currTime += (totalPlayTime - this.currFrame.postLoop) * 1000;

                // Set totalPlayTime to 0 so we evaluate for one more frame.
                totalPlayTime = 0;
            }
        }

        var returnVal = super.frameUpdate(totalPlayTime, nextTime);
        
        // We do all this logic AFTER we get the animation data, because we might need some animation data to play right at the end of the loop.
        // Is this a valid frame?
        if (totalPlayTime >= nextTime + this.nextTimeOffset) {
            this.currKeyframePlaying = nextTime;

            // Loop if we need to continue:
            if ("loop" in this.currFrame && shouldLoop){
                var start = this.timeline.get(this.currFrame.loop).index;

                // We've started looping again! Forget the old play stack, we're on this now:
                this.playStack = Array.from(this.timeline.keys()).slice(start);

                // Reset time back to the start of the loop:
                
                // So let's say we start looping at --time=1 seconds or something, and we play for 2 seconds before hitting loop at --time 3 seconds. And so when we hit --loop,
                // That means we SHOULD rewind time back to 2 seconds. So our totalPlayTime is ~3 seconds, and we want to add time to this.currTime until totalPlayTime 
                // rewinds to hit 1 seconds.
                // So we need to rewind by (totalTime - startOfLoop) = (3 - 1) seconds = 2 seconds:
                this.currTime += (totalPlayTime - this.currFrame.loop) * 1000;
            }
        }

        return returnVal;
    }

    initPlay(time, shouldLoop, options){
        super.initPlay(time, options);
        this._shouldLoop = shouldLoop;
        this.currKeyframePlaying = 0;
    }
}

/**
 * The manager for all {@link module:animationmanager~CCSSAnimationBase} animations.
 */
class AnimationManager {
    /**
     * Start building {@link module:animationmanager~CCSSAnimationBase}s from a given stylesheet. Factors in @import statements.
     * @constructs AnimationManager
     * @param {string} stylesheetLink HREF to the stylesheet. 
     */
    constructor(stylesheetLink){
        for (const sheet of document.styleSheets) {
            if (sheet.href === stylesheetLink) {
                /**
                 * The stylesheet that this animation manager represents.
                 * @param {StyleSheet}
                 */
                this.stylesheet = sheet;
            }
        }
        if (this.stylesheet === undefined) {
            console.error("[CCSS] Could not init AnimationManager for " + stylesheetLink);
        } else {
            /**
             * All possible animations, in a hierarchy tree.
             */
            this.animations = {};
            /**
             * A list of the animations currently playing.
             * @type {Array.<CCSSAnimationBase>}
             */
            this.currAnimations = [];
            /**
             * A list of animations done playing, but that we still need CSS properties to rest at. If we stop automatically, that can screw up some other animations that are dependent on the one we've stopped.
             * Called by {@link module:animationmanager~AnimationManager#cleanAnimsOfName} and {@link module:animationmanager~AnimationManager#cleanAllAnims}.
             * @type {Array.<CCSSAnimationBase>}
             */
            this.animationsToClean = [];
        }

        /**
         * Callbacks for when an animation of a given name finishes.
         * @type {Object.<string, function>}
         */
        this.onFinishes = {};
    }

    /**
     * Recursively find stylesheets to read with @import statements included.
     * @param {StyleSheet} stylesheet The stylesheet to read. 
     * @todo Make this a compilation process instead of real-time.
     */
    evaluateSheet(stylesheet){
        for(const rule of stylesheet.cssRules) {
            if (rule instanceof CSSKeyframesRule) {
                if (rule.name.substring(0, 10) === "CCSSGLOBAL") {
                    this.animations[rule.name] = new CCSSGlobalAnimation(rule);
                } else {
                    this.animations[rule.name] = new CCSSAnimation(rule);
                }
            } else if (rule instanceof CSSImportRule) {
                if (window.location.origin === new URL(rule.styleSheet.href).origin) {
                    this.evaluateSheet(rule.styleSheet);
                }
            }
        }
    }

    /**
     * Evaluate the main stylesheet.
     */
    evaluateMainSheet(){
        this.evaluateSheet(this.stylesheet);
    }

    /**
     * Run every frame to update {@link module:animationmanager~CCSSAnimationBase}s. Called by {@link MicrogameJam#update}.
     * @param {number} time The time in ms. 
     * @todo I might update to using the Javascript Web Animation API if current timings prove to be too inconsistent: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API
     */
    frameUpdate(time){
        
        for (var i = 0; i < this.currAnimations.length; i++) {
            var animation = this.currAnimations[i];

            var frameUpdateDat = animation.frameUpdate(time);
            if (frameUpdateDat !== null) {
                var animationsToTrigger = frameUpdateDat.animations;
                for (var animationName in animationsToTrigger) {
                    if (animationName === "setVariables") {
                        continue;
                    }
                    var localAnimation = animationsToTrigger[animationName];

                    var animToPush = this.animations[localAnimation.animName];
                    if (animToPush === undefined){
                        console.error("[CCSS] Could not find animation: " + localAnimation.animName + ". Skipping.");
                    } else {
                        // Duplicate the object instead of copying a reference. From https://stackoverflow.com/questions/41474986/how-to-clone-a-javascript-es6-class-instance
                        this.currAnimations.push(Object.assign(Object.create(Object.getPrototypeOf(animToPush)), animToPush));

                        // Uncomment to show that there's a difference for repeat animations (test in loops):
                        //console.log(this.currAnimations[this.currAnimations.length - 1].currTime);
                        //console.log(this.animations[localAnimation.animName].currTime);
                        var parent = animation.globalParent;
                        if (animation instanceof CCSSGlobalAnimation) {
                            parent = animation.name;
                        }
                        // Inherit the global parent and animation options.
                        this.currAnimations[this.currAnimations.length - 1].initPlay(time, localAnimation, parent, animation.options);
                    }
                }

                if (frameUpdateDat.isFinished) {
                    var finished = this.currAnimations.splice(i, 1)[0];

                    if (!("avoidAnimCleanup" in finished.options && finished.options.avoidAnimCleanup)) {
                        this.animationsToClean.push(finished);
                    }

                    if (this.currAnimations.find((anim) => {return anim.name === finished.globalParent || anim.globalParent === finished.name || finished.globalParent === anim.globalParent}) === undefined) {
                        if (finished.globalParent in this.onFinishes){
                            var toCall = this.onFinishes[finished.globalParent];
                            delete this.onFinishes[finished.globalParent];
                            toCall();
                        }

                        
                        var name = (finished.globalParent === "") ? finished.name : finished.globalParent; 
                        this.cleanAnimsOfName(name);
                    }

                    // To account for the offset:
                    i--;
                }
            }
        }
    }

    /**
     * Play a {@link module:animationmanager~CCSSGlobalAnimation} as long as it starts with the name CCSSGLOBAL, and it has been evaluated by this animation manager.
     * @param {string} name the name of the animation. 
     * @param {Object.<string, *>} options A set of options to load into this animation.
     */
    playKeyframedAnimation(name, options = {}){
        if (name.substring(0, 10) === "CCSSGLOBAL" && this.animations[name] instanceof CCSSGlobalAnimation) {
            // Duplicate the animation:
            this.currAnimations.push(this.animations[name]);
            // Performance.now() is an acceptable substitute for the timestamp from frameUpdate, see https://stackoverflow.com/questions/38360250/requestanimationframe-now-vs-performance-now-time-discrepancy
            var shouldLoop = () => {return false;};
            if ("shouldLoop" in options) {
                shouldLoop = options.shouldLoop;
            }
            
            var animOptions = {};

            if ("keepAnims" in options) {
                animOptions["avoidAnimCleanup"] = options.keepAnims;
            }

            this.currAnimations[this.currAnimations.length - 1].initPlay(performance.now(), shouldLoop, animOptions);
            if ("onFinish" in options){
                this.onFinishes[name] = options.onFinish;
            }
        } else {
            console.warn("[CCSS] " + name + " is not the name of a valid CCSSGLOBAL animation.");
        }
    }

    /**
     * Clean all animations of a given name (i.e., stop them from playing)
     * @param {string} name Name of animation to stop.
     */
    cleanAnimsOfName(name){
        for (var i = 0; i < this.animationsToClean.length; i++) {
            var anim = this.animationsToClean[i];
            if (anim.name === name || anim.globalParent === name) {
                if (anim instanceof CCSSAnimation && ini["Transitions"]["debug-loop"] !== "pause"){
                    anim.clearAnimation();
                }
                this.animationsToClean.splice(i, 1);
                i--;
            }
        }
    }

    /**
     * Clean every animation (i.e., stop them all from playing)
     */
    cleanAllAnims() {
        for (var i = 0; i < this.animationsToClean.length; i++) {
            var anim = this.animationsToClean[i];
            if (anim instanceof CCSSAnimation && ini["Transitions"]["debug-loop"] !== "pause") {
                anim.clearAnimation();
            }
            this.animationsToClean.splice(i, 1);
            i--;
        }
    }

    /**
     * Prepare a set of animations to be cleaned, then clean them using {@link module:animationmanager~AnimationManager#cleanAnimsOfName}.
     * @param {string} name Animation to stop playing. 
     */
    stopAllKeyframedAnimationOf(name) {
        for (var i = 0; i < this.currAnimations.length; i++) {
            var anim = this.currAnimations[i];
            if (anim.name === name || anim.globalParent === name) {
                this.animationsToClean.push(this.currAnimations.splice(i, 1)[0]);
                i--;
            }
        }
        this.cleanAnimsOfName(name);
    }

    /**
     * Stop all animations from playing.
     */
    stopAllAnimations() {
        this.animationsToClean = this.animationsToClean.concat(this.currAnimations.splice(0, this.currAnimations.length));
        this.cleanAllAnims();
    }
}

var GlobalAnimManager = new AnimationManager(document.getElementById("version-style").href);
GlobalAnimManager.evaluateMainSheet();

export default GlobalAnimManager;