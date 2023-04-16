package com.example.scrabblemobile.classes.game.game.action

import com.example.scrabblemobile.classes.game.game.board.Letter

data class Action(
    val type: String, // ActionType
    val placementSettings: PlacementSetting? = null,
    val letters: String? = null,
    val letterRack: Array<Letter>? = null
)
