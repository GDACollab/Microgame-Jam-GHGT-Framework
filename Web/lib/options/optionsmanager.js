import {Selectable} from "./menulib.js";

class GameList extends Selectable {
    #selected = 0;
    constructor(baseElement) {
        super(baseElement);
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
        
        while (selectedPos + selected.offsetHeight > this.element.offsetHeight) {
            this.element.scrollTop += selected.offsetHeight;
            selectedPos -= selected.offsetHeight;
        } 

        while (selectedPos - selected.offsetHeight < 0) {
            this.element.scrollTop -= selected.offsetHeight;
            selectedPos += selected.offsetHeight;
        }
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
            var div = document.createElement("div");
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
            div.appendChild(check);
            div.appendChild(label);

            div.id = "options-select-games-" + gameName;

            div.onclick = this.#swapToOptions.bind(this, gameName);

            var specificDiv = document.createElement("div");
            specificDiv.id = "game-options-" + gameName;

            var gameName = document.createElement("p");
            gameName.className = "game-options-name-" + gameName;

            specificDiv.appendChild(gameName);

            var dirs = ["Up", "Left", "Down", "Right", "Space"];
            dirs.forEach(function(d){
                var direction = document.createElement("div");
                direction.className = "remap-" + d;

                var text = document.createElement("p");
                text.innerText = d + " Alternate Binding:";

                direction.appendChild(text);

                var bindButtonP = document.createElement("p");
                var bindButton = document.createElement("button");

                bindButtonP.appendChild(bindButton);
                direction.appendChild(bindButtonP);

                var clearButtonP = document.createElement("p");
                var clearButton = document.createElement("button");

                clearButtonP.appendChild(clearButton);
                direction.appendChild(clearButtonP);

                specificDiv.appendChild(direction);
            });

            div.appendChild(specificDiv);

            specificDiv.setAttribute("hidden", "");

            this.#optionsSelect.appendChild(div);
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