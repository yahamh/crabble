package com.example.scrabblemobile.classes.game.game.card

import com.example.scrabblemobile.classes.game.game.board.Letter

data class CardAction(
    var card: Int, // CardType
    var user: String,

    var letterFromRack: Letter? = null,
    var letterToGet: Letter? = null,

    var playerToSwap: String? = null,

    var tileToTransformX: Int? = null,
    var tileToTransformY: Int? = null,
    var letterMultiplicator: Int? = null,
    var wordMultiplicator: Int? = null,

    var cardChoice: Int? = null, // CardType

    var bestPlayers: Array<String>? = null,
    var pointsForEach: Int? = null,

    var bonusPoints: Int? = null,

    var turnPassedOf: String? = null
)
