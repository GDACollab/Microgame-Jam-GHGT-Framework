// Harlowe Macro Framework, by Chapel; version 1.0.2
;!function(){"use strict";var r={major:1,minor:0,patch:2},e=[r.major,r.minor,r.patch].join(".");r.semantic=e,r=Object.freeze(r);var t=$("tw-storydata"),a=Object.freeze({name:t.attr("name"),ifid:t.attr("ifid")}),n=t.attr("format-version"),o=n.split("."),i=Object.freeze({major:o[0],minor:o[1],patch:o[2],semantic:n});window.Harlowe=window.Harlowe||{},window.Harlowe=Object.assign(window.Harlowe,{framework:r,API_ACCESS:Object.freeze({MACROS:require("macros"),STATE:require("state"),CHANGER:require("datatypes/changercommand"),ENGINE:require("engine")}),engine:i,story:a})}(),function(){"use strict";function e(r){return"number"==typeof r||"boolean"==typeof r||"string"==typeof r||null===r||Array.isArray(r)&&r.every(e)||r instanceof Set&&Array.from(r).every(e)||r instanceof Map&&Array.from(r.values()).every(e)||_changer.isPrototypeOf(r)}window.Harlowe=Object.assign(window.Harlowe,{helpers:{isSerialisable:e,isSerializable:e,arrayify:function(r,e){if(r){var t=[].slice.call(r);return void 0!==e&&(t=t.slice(e)),t}},getPassageData:function(r){var e=$('tw-passagedata[name="'+r+'"]');if(e[0])return e}}})}(),function(){"use strict";var n=window.localStorage||!1,o=Harlowe.story.ifid+"-tw-storage";function r(){try{if(!n)throw new Error("storage is inaccessible");n.setItem(o,JSON.stringify({ifid:Harlowe.story.ifid}))}catch(r){console.warn(r)}}function i(r){try{var e;if(n)return e=JSON.parse(n.getItem(o)),r&&r&&"string"==typeof r?e[r]:e;throw new Error("storage is inaccessible")}catch(r){console.warn(r)}}null==i()&&r(),Harlowe.storage={clear:r,save:function(r,e){try{if(!r||"string"!=typeof r)throw new TypeError("cannot store values without a valid storage key");if(void 0===e)throw new TypeError("cannot store undefined values");var t={};if(t[r]=e,!n)throw new Error("storage is inaccessible");var a=i();Object.assign(a,t),n.setItem(o,JSON.stringify(a))}catch(r){console.warn(r)}},load:i,remove:function(r){try{if(!r||"string"!=typeof r)throw new TypeError("cannot store values without a valid storage key");if(!n)throw new Error("storage is inaccessible");var e=i();e.hasOwnProperty(r)&&(delete e[r],n.setItem(o,JSON.stringify(e)))}catch(r){console.warn(r)}}}}(),function(){"use strict";function a(r,e,t){if(!(this instanceof a))return new a(r,e,t);this.name=r||"unknown",this.args=e||[],this.data=t||{},this.type=t&&t.type||"basic",this.fn=t&&t.fn||"handler","changer"===this.type&&("handler"===this.fn?this.instance=t&&t.instance||null:this.descriptor=t&&t.descriptor||null)}a.create=function(r,e,t){if(!r||"string"!=typeof r||!r.trim())throw new TypeError("Invalid macro name.");return e&&e instanceof Array||(e=[]),t&&"object"==typeof t||(t={type:"basic",fn:"handler"}),new a(r,e,t)},Object.assign(a.prototype,{clone:function(){return a.create(this.name,this.args,this.data)},syntax:function(){return"("+this.name+":)"},error:function(r,e){var t="Error in the "+this.syntax()+" macro: "+r;return e&&alert(t),console.warn("HARLOWE CUSTOM MACRO ERROR -> ",t),new Error(r)},typeCheck:function(r){r&&r instanceof Array||(r=Harlowe.helpers.arrayify(arguments));var n=this,o=[];if(r.forEach(function(r,e){var t=e+1,a=[];"string"==typeof r&&("any"===(a=r.includes("|")?r.split("|").map(function(r){return r.trim().toLowerCase()}):[r.trim().toLowerCase()])[0]||a.some(function(r){return typeof n.args[e]===r})||o.push("argument "+t+" should be a(n) "+a.join(" or ")))}),o.length)return n.error(o.join("; "))}}),window.Harlowe=Object.assign(window.Harlowe,{MacroContext:a})}(),function(){"use strict";var c=Harlowe.API_ACCESS.MACROS,l=Harlowe.API_ACCESS.CHANGER;window.Harlowe=Object.assign(window.Harlowe||{},{macro:function(r,e,t){if(!r||"string"!=typeof r||!r.trim())throw new TypeError("Invalid macro name.");if(!e||"function"!=typeof e)throw new TypeError("Invalid macro handler.");var a,n,o,i,s;t&&"function"==typeof t?(o=r,i=e,s=t,c.addChanger(o,function(){var r=Harlowe.helpers.arrayify(arguments,1),e=l.create(o,r),t=Harlowe.MacroContext.create(o,r,{type:"changer",fn:"handler",instance:e});return i.apply(t,r),e},function(){var r=Harlowe.helpers.arrayify(arguments),e=r.shift(),t=Harlowe.MacroContext.create(o,r,{type:"changer",fn:"changer",descriptor:e});s.apply(t,r)},c.TypeSignature.zeroOrMore(c.TypeSignature.Any))):(a=r,n=e,c.add(a,function(){var r=Harlowe.helpers.arrayify(arguments,1),e=Harlowe.MacroContext.create(a,r,{type:"basic",fn:"handler"}),t=n.apply(e,r);return null==t?"":t},c.TypeSignature.zeroOrMore(c.TypeSignature.Any)))}})}(),function(){"use strict";var t=Harlowe.API_ACCESS.STATE,e=Harlowe.API_ACCESS.ENGINE;function a(){return t.passage}window.Harlowe=Object.assign(window.Harlowe||{},{passage:a,tags:function(r){r=r||a();try{var e=Harlowe.helpers.getPassageData(r).attr("tags");return e?e.split(" "):[]}catch(r){return console.warn(r.message),[]}},goto:function(r){return e.goToPassage(r)},variable:function(r,e){if("$"!==r[0])throw new Error('cannot access variable "'+r+'"');if(r=r.substr(1),void 0!==e){if(!Harlowe.helpers.isSerialisable(e))throw new Error('The value passed to variable "'+r+'" cannot be serialized.');t.variables[r]=e}return t.variables[r]},visited:function(r){return t.passageNameVisited(r||a())},hasVisited:function(r){return 0<t.passageNameVisited(r||a())},turns:function(){return t.pastLength}})}();
// end Harlowe Macro Framework

// Should be inserted into your Javascript story format:
var isGame = parent.GameInterface !== undefined && parent.GameInterface !== null;
var time = Date.now();
var maxSeconds = 20;

if (isGame) {
    parent.GameInterface.gameStart();
}

function updateVariables() {
    var variableNames = {};

    if (isGame){
        variableNames = {
            'seconds': parent.GameInterface.getTimer,
            'lives': parent.GameInterface.getLives,
            'difficulty': parent.GameInterface.getDifficulty
        };
    } else {
        variableNames = {
            'seconds': () => {var seconds = Math.floor(maxSeconds - ((Date.now() - time) / 1000));
            if (seconds <= 0) {
                if (isGame) {
                    parent.GameInterface.loseGame();
                } else {
                    alert("Game Lost!");
                }
            }
            return seconds;
        },
            'lives': () => { return 3; },
            // Allow this to be set:
            'difficulty': () => { return 1; }
        };
    }
    Object.entries(variableNames).forEach(function([key, value]) {
        State.variables[key] = value();
    });
}

function functionCalls(){
    var functionNames = {};
    
    if (isGame){
        functionNames = {
            'WinGame': parent.GameInterface.winGame,
            'LoseGame': parent.GameInterface.loseGame,
            'SetMaxTimer': parent.GameInterface.setMaxTimer
        };
    } else {
        functionNames = {
            'WinGame': () => { alert("Game Won!"); },
            'LoseGame': () => { alert("Game Lost!"); },
            'SetMaxTimer': (seconds) => { maxSeconds = seconds; }
        }
    }

    Object.entries(functionNames).forEach(function([key, value]) {
        Harlowe.macro(key, value);
    });
}

function twineUpdate(){
    updateVariables();
}

functionCalls();
setInterval(twineUpdate, 100);