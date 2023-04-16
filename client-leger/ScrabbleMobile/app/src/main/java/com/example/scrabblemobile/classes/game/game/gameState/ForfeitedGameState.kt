package com.example.scrabblemobile.classes.game.game.gameState

import com.example.scrabblemobile.classes.game.game.board.Letter
import com.example.scrabblemobile.classes.game.game.board.Tile

data class ForfeitedGameState(
    var players: Array<LightPlayer>,
    var activePlayerIndex: Int,
    var grid: Array<Array<Tile>>,
    var letterRemaining: Int,
    var letterList: Array<Letter>,
    var isEndOfGame: Boolean,
    var winnerIndex: Array<Int>,
    var turnTime: Int,
    var cardsAvailable: Array<Int>, // array of CardType
    var letterBag: Array<Letter>,
    var consecutivePass: Int,
)
