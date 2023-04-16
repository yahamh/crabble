package com.example.scrabblemobile.classes.game.game.card

import com.example.scrabblemobile.R

enum class CardType(val id: Int) {
    PassTurn(0),
    TransformTile(1),
    RemoveTime(2),
    SwapLetter(3),
    SwapRack(4),
    Steal(5),
    Points(6),
    Joker(7);

    companion object {
        fun getById(id: Int): CardType {
            return when (id) {
                0 -> PassTurn
                1 -> TransformTile
                2 -> RemoveTime
                3 -> SwapLetter
                4 -> SwapRack
                5 -> Steal
                6 -> Points
                7 -> Joker
                else -> PassTurn
            }
        }
    }
}
