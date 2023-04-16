package com.example.scrabblemobile.classes.game.game.board

data class Tile(
    var letterObject: Letter = Letter(" ", 0),
    var letterMultiplicator: Int = 1,
    var wordMultiplicator: Int = 1
)
