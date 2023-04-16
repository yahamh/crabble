package com.example.scrabblemobile.classes

import android.app.Application
import com.example.scrabblemobile.classes.account.AccountHandler
import com.example.scrabblemobile.classes.game.communication.NewGameSocketHandler
import com.example.scrabblemobile.classes.game.game.Game
import com.example.scrabblemobile.classes.game.game.gameSettings.GameSettings
import com.example.scrabblemobile.classes.personalization.LangHandler
import com.example.scrabblemobile.classes.personalization.ThemeHandler

class CrabblApplication : Application() {

    lateinit var accountHandler: AccountHandler
    lateinit var langHandler: LangHandler
    lateinit var themeHandler: ThemeHandler

    lateinit var newGameSocketHandler: NewGameSocketHandler
    var observe: Boolean = false
    var host: Boolean = false
    var gameSettings: GameSettings? = null

    var game: Game? = null

    fun isFr(): Boolean {
        return langHandler.isFr()
    }

    override fun onCreate() {
        super.onCreate()

        accountHandler = AccountHandler(applicationContext)
        accountHandler.tryLoginBack()

        langHandler = LangHandler(applicationContext)
        themeHandler = ThemeHandler(applicationContext)
    }

}
