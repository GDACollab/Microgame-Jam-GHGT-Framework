-- Include in your PICO-8 cartridge with #include microgamejamcontroller.lua

-- The first GPIO pin, if it's equal to 1, just tells us that GameInterface is available.
-- I don't expect anything else to be messing with the GPIO pins within the Microgame Jam's context, so we shouldn't need anything more elaborate.

--[[
Here's the memory structure I expect (shouldn't be too complicated, all values here are between 0 and 256):
0x5f80 - Should be set to 1 by picointerface.js, tells us it's there.
0x5f81 - # of maximum seconds for the game to run for. Should initially be set by picointerface.js for whatever the default value is.
0x5f82 - Set to 1 by the controller to indicate to picointerface.js that the game has started.
0x5f83 - # of lives
0x5f84 - Difficulty #
0x5f85 - # of seconds left (Timer)
0x5f86 - Win or lose (Set to 0 < X <= 128 for lose, set to 128 < X <= 255 for win) 
]]--
microgamejamcontroller = {
    is_game = peek(0x5f80) == 1,
    lives = 3,
    difficulty = 1,
    timer = time(),
    max_time = 20,
    win = false,
    gameover = false
}

poke(0x5f82, 1)

function microgamejamcontroller:getlives()
    -- I forgot how much LUA sucks for not using curly braces.
    -- Python too. I see you.
    if (self.is_game) then
        self.lives = peek(0x5f83)
    end
    return self.lives
end

function microgamejamcontroller:getdifficulty()
    if(self.is_game) then
        self.difficulty = peek(0x5f84)
    end
    return self.difficulty
end

function microgamejamcontroller:gettimer()
    if(self.is_game) then
        self.timer = peek(0x5f85)
    else
        --self.timer = self.max_time - flr(time() - self.timer)
        self.timer = time()
    end
    return self.timer
end

function microgamejamcontroller:wingame()
    if (self.is_game) then
        poke(0x5f86, 255)
    elseif (not self.gameover) then
        self.gameover = true
        self.win = true
    end
end

function microgamejamcontroller:losegame()
    if (self.is_game) then
        poke(0x5f86, 1)
    elseif (not self.gameover) then
        self.gameover = true
        self.win = false
    end
end

function microgamejamcontroller:setmaxtimer(seconds)
    if (self.is_game) then
        poke(0x5f81, seconds)
    end
    self.max_time = seconds
end

function microgamejamcontroller:drawgameresult()
    if (self.win) then 
        print("You won!")
    else 
        print("You lost!")
    end
end