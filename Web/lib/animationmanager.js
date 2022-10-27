function evaluateCCSSANIM(animProp){
    var animDat = {};

    var animProps = animProp.split(" ");

    // It's always first the name of the animation to play, then how long it lasts:
    animDat.animName = animProps[0].replace(" ", "");
    animDat.duration = parseInt(animProps[1].replace(/ |s/, ""));

    // Everything else is selectors:
    animDat.selectors = [];
    for (var i = 2; i < animProps.length; i++){
        animDat.selectors.push(animProps[i].replace(" ", ""));
    }

    return animDat;
}

// Regular CSS animation with some CCSS properties to use.
class CCSSAnimation {
    // Takes a CSSKeyframesRule class as input.
    constructor(cssRule){
        this.animations = {};

        for (var frame of cssRule.cssRules) {
            var fraction = parseInt(frame.keyText.replace("%", ""))/100;
            var animationList = [];

            for (var styleName in frame.style) {
                if (styleName.substring(0, 7) === "--ANIM-") {
                    animationList.push(evaluateAnimProp(frame.style[styleName]));
                }
            }

            this.animations[fraction] = animationList;
        }
    }
}

// Keyframed animation that controls all other animations.
// Unique from other CSS animations that have keyframes in that it precisely controls when certain animations start and stop.
// See version-style.css for more info.
class CCSSGlobalAnimation {
    // Takes a CSSKeyframesRule class as input. This is with the assumption that the keyframes start with CCSSGLOBAL, and that you follow how CCSSGLOBAL animations are supposed to work according to version-style.css.
    constructor(cssRule){
        this.timeline = {};

        for (var frame of cssRule.cssRules) {
            var time = parseInt(frame.style["--time"].replace(/ |s/, ""));

            var timeDat = {time: time};

            var animations = [];

            // We can't trigger CCSSGLOBAL animations from within other Global animations. We assume regular CSS Animations (with potential CCSSAnimation properties) from now on:
            for (var styleName in frame.style) {
                if(styleName.substring(0, 7) === "--ANIM-") {
                    animations.push(evaluateCCSSANIM(frame.style[styleName]));
                }
            }

            timeDat.animations = animations;
        }
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
            console.error("Could not init AnimationManager for " + stylesheetLink);
        } else {
            this.animations = {};
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

    playKeyframedAnimation(name){

    }
}