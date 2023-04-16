package com.example.scrabblemobile.classes.game.game.gameSettings

data class GameSettingsUI(
    val gameMode: String, // GameMode.id
    val timePerTurn: Int,
    val players: Array<String>,
    val randomBonus: Boolean,
    val dictTitle: String,
    val isPrivate: Boolean,
    val password: String,
    val cards: Array<Int> = arrayOf(), // [CardType.id, ...]
    val capacity: Int = 4,
    val dictDesc: String = "",
)
