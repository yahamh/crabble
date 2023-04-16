package com.example.scrabblemobile.classes.game.game.timer

enum class TimerControls(val id: Int) {
    Start(0),
    Stop(1);

    companion object {
        fun getById(id: Int): TimerControls {
            return when (id) {
                0 -> Start
                1 -> Stop
                else -> Start
            }
        }
    }
}
