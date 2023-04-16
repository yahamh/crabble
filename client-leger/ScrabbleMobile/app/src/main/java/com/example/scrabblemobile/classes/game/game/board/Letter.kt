package com.example.scrabblemobile.classes.game.game.board

data class Letter(
    var char: String,
    var value: Int,
    var isTemp: Boolean? = null
)
