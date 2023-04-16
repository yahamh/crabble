package com.example.scrabblemobile.activities

import android.content.Intent
import android.os.Bundle
import android.os.PersistableBundle
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.TextView
import com.example.scrabblemobile.R
import androidx.appcompat.app.AppCompatActivity
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.personalization.Lang
import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers
import io.reactivex.rxjava3.disposables.Disposable
import io.reactivex.rxjava3.schedulers.Schedulers

class WaitingRoomActivity : AppCompatActivity() {
    private lateinit var buttonStartGame: Button
    private lateinit var buttonLeave: Button
    private lateinit var app: CrabblApplication
    private lateinit var textViewPlayers: Array<TextView>
    private lateinit var buttonKicks: Array<ImageButton>
    private var isGameStarted: Boolean = false

    private var playerSubscription: Disposable? = null
    private var pendingGameIdSubscription: Disposable? = null
    private var disconnectedSubscription: Disposable? = null
    private var startGameSubscription: Disposable? = null

    private lateinit var textWaiting: TextView
    private lateinit var textPlayers: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        app = application as CrabblApplication
        app.themeHandler.changeTheme(this)

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_waiting_room)

        textWaiting = findViewById(R.id.text_view_attente)
        textPlayers = findViewById(R.id.text_view_joueurs_attente)

        buttonStartGame = findViewById(R.id.button_lancer_partie)
        buttonLeave = findViewById(R.id.button_quitter)

        textViewPlayers = arrayOf(
            findViewById(R.id.textView_player1_attente),
            findViewById(R.id.textView_player2_attente),
            findViewById(R.id.textView_player3_attente),
            findViewById(R.id.textView_player4_attente)
        )

        initializeNames()

        buttonKicks = arrayOf(
            findViewById(R.id.button_kick_2),
            findViewById(R.id.button_kick_3),
            findViewById(R.id.button_kick_4)
        )

        if (app.host) {
            initializeKickButtons()
        }

        buttonStartGame.isEnabled = false

        setListeners()

        playerSubscription = app.newGameSocketHandler.playersSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe { players ->
                app.gameSettings!!.players = players
                initializeNames()
                initializeKickButtons()
                buttonStartGame.isEnabled = app.gameSettings!!.players.size > 1
            }

        if (app.host) {
            pendingGameIdSubscription =
                app.newGameSocketHandler.pendingGameIdSubject.subscribe { id ->
                    if (id != "") {
                        app.gameSettings!!.id = id
                    }
                }
        }

        startGameSubscription = app.newGameSocketHandler.gameStartedSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe { gameSettings ->
                app.gameSettings = gameSettings
                startGame()
            }


        disconnectedSubscription = app.newGameSocketHandler.isDisconnectedSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe { disconnected ->
                if (disconnected && !isGameStarted) {
                    playerSubscription?.dispose()
                    disconnectedSubscription?.dispose()
                    pendingGameIdSubscription?.dispose()
                    startGameSubscription?.dispose()
                    finish()
                }
            }
        translate()

    }

    @Override
    override fun onBackPressed() {
        playerSubscription?.dispose()
        disconnectedSubscription?.dispose()
        pendingGameIdSubscription?.dispose()
        startGameSubscription?.dispose()


        app.newGameSocketHandler.disconnectSocket()

        finish()
    }

    private fun setListeners() {
        if (app.host) {
            buttonStartGame.visibility = View.VISIBLE
            buttonStartGame.setOnClickListener {
                if (app.host) {
                    isGameStarted = true
                    app.newGameSocketHandler.startGame(app.gameSettings!!.id)
                }
            }
        }
        buttonLeave.setOnClickListener { leave() }
    }

    private fun startGame() {
        playerSubscription?.dispose()
        disconnectedSubscription?.dispose()
        pendingGameIdSubscription?.dispose()
        startGameSubscription?.dispose()

        val gameActivityIntent = Intent(this, GameActivity::class.java)
        startActivity(gameActivityIntent)
    }

    private fun leave() {
        playerSubscription?.dispose()
        disconnectedSubscription?.dispose()
        pendingGameIdSubscription?.dispose()
        startGameSubscription?.dispose()



        app.newGameSocketHandler.disconnectSocket()
        finish()
    }

    private fun initializeNames() {
        for (i in textViewPlayers.indices) {
            textViewPlayers[i].text = ""
        }

        for (i in app.gameSettings!!.players.indices) {
            textViewPlayers[i].text = app.gameSettings!!.players[i]
        }
    }

    private fun initializeKickButtons() {
        if (app.host) {
            for (i in buttonKicks.indices) {
                buttonKicks[i].visibility = View.INVISIBLE
            }

            for (i in app.gameSettings!!.players.indices) {
                if (i == 0) {
                    continue;
                }

                buttonKicks[i - 1].visibility = View.VISIBLE
                buttonKicks[i - 1].setOnClickListener {
                    kickPlayer(i)
                }
            }
        }
    }

    private fun kickPlayer(id: Int) {
        app.newGameSocketHandler.kickPlayer(app.gameSettings!!.id, app.gameSettings!!.players[id])
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textWaiting.text = resources.getString(R.string.attente_fr)
            textPlayers.text = resources.getString(R.string.joueurs_fr)
            buttonLeave.text = resources.getString(R.string.quitter_fr)
            buttonStartGame.text = resources.getString(R.string.lancer_partie_fr)
        } else {
            textWaiting.text = resources.getString(R.string.attente_en)
            textPlayers.text = resources.getString(R.string.joueurs_en)
            buttonLeave.text = resources.getString(R.string.quitter_en)
            buttonStartGame.text = resources.getString(R.string.lancer_partie_en)
        }
    }
}
