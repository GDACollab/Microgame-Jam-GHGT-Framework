import {Selectable} from "./menulib.js";

class GameList extends Selectable {
    #selected = 0;
    #prevSelected = 0;
    #baseOffset = 0;
    constructor(baseElement) {
        super(baseElement);
        this.#baseOffset = this.element.children[0].offsetTop;
    }

    // Pick an element to select from a direction.
    selectElement(direction){
        // We return false to return control to the regular menu.
        if (direction.x === -1) {
            return false;
        }
        
        this.clearSelect();

        if (direction.y === 1 && this.#selected < this.element.children.length - 1) {
            this.#selected++;
        }
        if (direction.y === -1 && this.#selected > 0) {
            this.#selected--;
        }
        this.select();

        // Return true to tell the menumanager to keep going.
        return true;
    }

    // Actually hover over the selected element. 
    // Called when this element is first selected (and gets overrided by selectElement for subsequent calls with the arrow keys).
    select() {
        var selected = this.element.children[this.#selected];
        selected.classList.add("hover");

        var selectedPos = selected.offsetTop - this.element.scrollTop;
        
        while (selectedPos + selected.offsetHeight/2 > this.element.offsetHeight) {
            this.element.scrollTop += selected.offsetHeight;
            selectedPos -= selected.offsetHeight;
        } 

        while (selectedPos - selected.offsetHeight/2 < 0) {
            this.element.scrollTop -= selected.offsetHeight;
            selectedPos += selected.offsetHeight;
        }

        this.#prevSelected = this.#selected;
    }

    click() {
        this.element.children[this.#selected].click();
    }

    clearSelect() {
        this.element.children[this.#selected].classList.remove("hover");
    }
}

export class OptionsManager {
	#currentOption = "all";
    #Controller;
    #enabledGames = new Set();
    #optionsSelect;

	constructor(Controller) {
		this.#Controller = Controller;

        this.#optionsSelect = document.getElementById("options-select-games");

		var gameNames = this.#Controller.GameLoader.gameNames;

        Object.keys(gameNames).forEach((game) => {
            var p = document.createElement("p");
            this.#enabledGames.add(game);
            var check = document.createElement("input");
            var gameName = gameNames[game];
            check.type = "checkbox";
            check.id = game + "enable";
            check.checked = true;
            check.name = game + "enable";
            var label = document.createElement("label");
            label.innerText = gameName;
            // We want to be able to click each game to set individual settings.
            // label.htmlFor = game + "enable";
            p.appendChild(check);
            p.appendChild(label);

            p.id = "options-select-games-" + gameName;

            p.onclick = this.#swapToOptions.bind(this, gameName);

            this.#optionsSelect.appendChild(p);
        });

		document.getElementById("options-select-games-all").onclick = this.#swapToOptions.bind(this, "all");
	}

    startManagingOptions() {
        this.#Controller.GameMenus.addSelectableElement(new GameList(this.#optionsSelect));
    }

    get enabledGames() {
        return this.#enabledGames;
    }

	#swapToOptions(gameName) {
        document.getElementById("options-select-games-" + this.#currentOption).classList.remove("active");
		document.getElementById("options-select-games-" + gameName).classList.add("active");
        this.#currentOption = gameName;
	}
}