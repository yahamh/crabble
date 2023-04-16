package com.example.scrabblemobile.classes.game.game.gameState

import com.example.scrabblemobile.classes.game.game.board.Letter

data class LightPlayer(
    var name: String,
    var points: Int,
    var letterRack: Array<Letter>,
    var wordsBeforeCard: Int? = null,
    var cards: Array<Int>? = null // array of CardType
)
