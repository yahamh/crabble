package com.example.scrabblemobile.classes.game.game.gameSettings

data class GameSettings(
    val gameMode: String, // GameMode.id
    val timePerTurn: Int,
    var players: Array<String>,
    val randomBonus: Boolean,
    val dictTitle: String,
    val isPrivate: Boolean,
    val password: String,
    var id: String,
    val bots: Array<String>,
    val cards: Array<Int> = arrayOf(), // [CardType.id, ...]
    val capacity: Int = 4,
    val dictDesc: String = "",
)
