package com.example.scrabblemobile.classes.game.game.gameState

import com.example.scrabblemobile.classes.game.game.card.CardType
import com.example.scrabblemobile.classes.game.game.board.Letter

data class Player(
    var name: String,
    var isVirtual: Boolean,
    var points: Int = 0,
    var isActive: Boolean = false,
    var letterRack: Array<Letter> = arrayOf(),
    var cards: Array<CardType> = arrayOf(),
    var wordsBeforeCard: Int = 3
)
