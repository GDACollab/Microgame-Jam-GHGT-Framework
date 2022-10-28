class CCSSAnimationBase {
    constructor(cssRule) {
        this.name = cssRule.name;

        // Use a map to guarantee insertion order:
        this.timeline = new Map();

        this.currTime = 0;
        this.playStack = [];
    }

    evaluateCCSSAnimProp(animProp) {
        var animDat = {};

        var animProps = animProp.split(" ");

        // It's always first the name of the animation to play, then how long it lasts:
        animDat.animName = animProps[0].replace(" ", "");
        animDat.duration = parseFloat(animProps[1].replace(/ |s/, ""));

        // Everything else is selectors:
        animDat.selectors = [];
        for (var i = 2; i < animProps.length; i++){
            animDat.selectors.push(animProps[i].replace(" ", ""));
        }

        return animDat;
    }

    readToAnimStore(frame){
        var animationStore = {};
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
            }
        }

        return animationStore;
    }

    frameUpdate(totalPlayTime, nextTime){
        // The offset is used for things like delays.
        if (totalPlayTime >= nextTime + this.nextTimeOffset) {
            var currAnimDat = this.timeline.get(nextTime);
            this.playStack.shift();

            var isFinished = this.playStack.length === 0;

            return {animations: (currAnimDat.animations !== undefined) ? currAnimDat.animations : [], isFinished: isFinished};
        }

        return null;
    }

    initPlay(time){
        this.currTime = time;
        this.nextTimeOffset = 0;
        this.playStack = Array.from(this.timeline.keys());
    }
}

// Regular CSS animation with some CCSS properties to use.
class CCSSAnimation extends CCSSAnimationBase {
    // Takes a CSSKeyframesRule class as input.
    constructor(cssRule){
        super(cssRule);

        this.duration = 0;
        this.elements = [];

        for (var frame of cssRule.cssRules) {
            var fraction = parseInt(frame.keyText.replace("%", ""))/100;

            this.timeline.set(fraction, {fraction: fraction, animations: this.readToAnimStore(frame)});
        }
    }

    frameUpdate(time) {
        // Adjust so that time works in percentages:
        var totalPlayTime = (time - this.currTime)/(this.duration * 1000);

        // Should be in chronological order, so we just need to pull the first value:
        var nextTime = this.playStack[0];
        return super.frameUpdate(totalPlayTime, nextTime);
    }

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

    initPlay(time, animationObj){
        super.initPlay(time);

        // Add a delay to how we evaluate this animation, so that timing doesn't have to be re-adjusted.
        if ("delay" in animationObj) {
            this.nextTimeOffset = parseFloat(animationObj["delay"].replace(/ |s/, ""));
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

    clearAnimation(){ //We keep animations so that CSS info can persist after something happens. Call this only after you want to stop ALL animations. 
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

// Keyframed animation that controls all other animations.
// Unique from other CSS animations that have keyframes in that it precisely controls when certain animations start and stop.
// See version-style.css for more info.
class CCSSGlobalAnimation extends CCSSAnimationBase {
    // Takes a CSSKeyframesRule class as input. This is with the assumption that the keyframes start with CCSSGLOBAL, and that you follow how CCSSGLOBAL animations are supposed to work according to version-style.css.
    constructor(cssRule){
        super(cssRule);

        for (var frame of cssRule.cssRules) {
            var time = parseFloat(frame.style.getPropertyValue("--time").replace(/ |s/, ""));

            var timeDat = {time: time};

            var animationStore = this.readToAnimStore(frame);

            timeDat.animations = animationStore;

            this.timeline.set(time, timeDat);
        }
    }

    frameUpdate(time){
        // Because the time we pull from in CSS is in terms of seconds, we convert to that here:
        var totalPlayTime = (time - this.currTime)/1000;

        // Should be in chronological order, so we just need to pull the first value:
        var nextTime = this.playStack[0];
        return super.frameUpdate(totalPlayTime, nextTime);
    }
}

class AnimationManager {
    constructor(stylesheetLink){
        for (const sheet of document.styleSheets) {
            if (sheet.href === stylesheetLink) {
                this.stylesheet = sheet;
            }
        }
        if (this.stylesheet === undefined) {
            console.error("[CCSS] Could not init AnimationManager for " + stylesheetLink);
        } else {
            this.animations = {};
            this.currAnimations = [];
            this.animationsToClean = [];
        }
    }

    evaluateSheet(){
        for(const rule of this.stylesheet.cssRules) {
            if (rule instanceof CSSKeyframesRule) {
                if (rule.name.substring(0, 10) === "CCSSGLOBAL") {
                    this.animations[rule.name] = new CCSSGlobalAnimation(rule);
                } else {
                    this.animations[rule.name] = new CCSSAnimation(rule);
                }
            }
        }
    }

    frameUpdate(time){
        // I might update to using the Javascript Web Animation API if current timings prove to be too inconsistent: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API
        
        for (var i = 0; i < this.currAnimations.length; i++) {
            var animation = this.currAnimations[i];

            var frameUpdateDat = animation.frameUpdate(time);
            if (frameUpdateDat !== null) {
                var animationsToTrigger = frameUpdateDat.animations;
                for (var animationName in animationsToTrigger) {
                    var animation = animationsToTrigger[animationName];

                    var animToPush = this.animations[animation.animName];
                    if (animToPush === undefined){
                        console.error("[CCSS] Could not find animation: " + animation.animName + ". Skipping.");
                    } else {
                        this.currAnimations.push(animToPush);
                        this.currAnimations[this.currAnimations.length - 1].initPlay(time, animation);
                    }
                }

                if (frameUpdateDat.isFinished) {
                    this.animationsToClean.push(this.currAnimations.splice(i, 1)); 
                    // To account for the offset:
                    i--;
                }
            }
        }

        if (this.currAnimations.length > 0){
            requestAnimationFrame(this.frameUpdate.bind(this))
        } else {
            this.animationsToClean.forEach(function(animation){
                if (animation instanceof CCSSAnimation){
                    animation.clearAnimation();
                }
            });
        }
    }

    playKeyframedAnimation(name){
        if (name.substring(0, 10) === "CCSSGLOBAL" && this.animations[name] instanceof CCSSGlobalAnimation) {
            // Duplicate the animation:
            this.currAnimations.push(this.animations[name]);
            // Performance.now() is an acceptable substitute for the timestamp from frameUpdate, see https://stackoverflow.com/questions/38360250/requestanimationframe-now-vs-performance-now-time-discrepancy
            this.currAnimations[this.currAnimations.length - 1].initPlay(performance.now());
            if (this.currAnimations.length === 1) {
                requestAnimationFrame(this.frameUpdate.bind(this));
            }
        } else {
            console.warn("[CCSS] " + name + " is not the name of a valid CCSSGLOBAL animation.");
        }
    }
}