import {Selectable} from "./menumanager.js";

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
        for (var i = 0; i < this.#optionsSelect.children.length; i++) {
            this.#Controller.GameMenus.addSelectableElement(this.#optionsSelect.children[i]);
        }
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