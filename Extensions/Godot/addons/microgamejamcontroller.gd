tool
extends EditorPlugin

func win():
    JavaScript.eval('parent.GameInterface.winGame();');

func lose():
    JavaScript.eval('parent.GameInterface.loseGame();');

func lives():
    var lives = JavaScript.eval('parent.GameInterface.getLives();');
    return lives;

func difficulty():
    var difficulty = JavaScript.eval('parent.GameInterface.getDifficulty();');
    return difficulty;

func timer():
    var timer = JavaScript.eval('parent.GameInterface.getTimer();');
    return timer;