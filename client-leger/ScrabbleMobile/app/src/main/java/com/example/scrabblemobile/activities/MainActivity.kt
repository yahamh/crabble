package com.example.scrabblemobile.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.game.communication.NewGameSocketHandler
import com.example.scrabblemobile.classes.personalization.Lang
import com.example.scrabblemobile.classes.personalization.LangHandler
import com.example.scrabblemobile.classes.personalization.Theme
import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers
import io.reactivex.rxjava3.schedulers.Schedulers

class MainActivity : AppCompatActivity() {
    private lateinit var btnProfile: Button
    private lateinit var btnChat: Button
    private lateinit var btnCreateGame: Button
    private lateinit var btnJoinGame: Button
    private lateinit var btnObserveGame: Button

    private lateinit var app: CrabblApplication

    private lateinit var currentTheme: Theme

    override fun onCreate(savedInstanceState: Bundle?) {
        app = application as CrabblApplication

        app.themeHandler.changeTheme(this)
        currentTheme = app.themeHandler.getTheme()

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        app.newGameSocketHandler = NewGameSocketHandler()

        app.accountHandler.connectedSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe { success ->
                btnChat.isEnabled = success
            }

        btnProfile = findViewById(R.id.button_profil_utilisateur)
        btnChat = findViewById(R.id.button_menu_clavardage)
        btnCreateGame = findViewById(R.id.button_creer_partie)
        btnJoinGame = findViewById(R.id.button_rejoindre_partie)
        btnObserveGame = findViewById(R.id.button_observer_partie)

        btnProfile.setOnClickListener { startProfileActivity() }
        btnChat.setOnClickListener { startChatActivity() }
        btnCreateGame.setOnClickListener { startCreateGameActivity() }
        btnJoinGame.setOnClickListener {
            app.observe = false
            startJoinGameActivity()
        }
        btnObserveGame.setOnClickListener {
            app.observe = true
            startJoinGameActivity()
        }

        btnChat.isEnabled = app.accountHandler.connected
        translate()
    }

    private fun startProfileActivity() {
        val profileActivityIntent = Intent(this, UserProfileActivity::class.java)
        startActivity(profileActivityIntent)
    }

    private fun startChatActivity() {
        val chatActivityIntent = Intent(this, ChatActivity::class.java)
        startActivity(chatActivityIntent)
    }

    private fun startCreateGameActivity() {
        val createGameActivityIntent = Intent(this, CreateGameActivity::class.java)
        startActivity(createGameActivityIntent)
    }

    private fun startJoinGameActivity() {
        val joinGameActivityIntent = Intent(this, JoinGameActivity::class.java)
        startActivity(joinGameActivityIntent)
    }

    override fun onResume() {
        super.onResume()
        btnChat.isEnabled = app.accountHandler.connected
        translate()

        app.newGameSocketHandler = NewGameSocketHandler()

        if (currentTheme != app.themeHandler.getTheme()) {
            recreate()
        }
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            btnProfile.text = resources.getString(R.string.profil_utilisateur_fr)
            btnChat.text = resources.getString(R.string.clavardage_fr)
            btnCreateGame.text = resources.getString(R.string.creer_partie_fr)
            btnJoinGame.text = resources.getString(R.string.rejoindre_partie_fr)
            btnObserveGame.text = resources.getString(R.string.observer_partie_fr)
        } else {
            btnProfile.text = resources.getString(R.string.profil_utilisateur_en)
            btnChat.text = resources.getString(R.string.clavardage_en)
            btnCreateGame.text = resources.getString(R.string.creer_partie_en)
            btnJoinGame.text = resources.getString(R.string.rejoindre_partie_en)
            btnObserveGame.text = resources.getString(R.string.observer_partie_en)
        }
    }
}
