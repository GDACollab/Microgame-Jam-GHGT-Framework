var state = "Main";

function initMainMenu(){
    for (var artName in ini["Menu"]) {
        var art = ini["Menu"][artName];
        var offset = art.offset.replace(/\(|\)/, "").split(",");
        offset.forEach(function(o, i){
            offset[i] = parseInt(o);
        });
        document.getElementById("menu").innerHTML += `<img src="./jam-version-assets/art/${art.img}" class="menu-art" id="${artName}" style="position: absolute; left: ${offset[0]}px; top: ${offset[1]}px; z-index: ${offset[2]}"/>`;
    }

    document.getElementById("playButton").onclick = startMicrogames;
}