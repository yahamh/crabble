package com.example.scrabblemobile.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.fragment.app.FragmentContainerView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.game.views.JoinGameRecyclerAdapter
import com.example.scrabblemobile.classes.personalization.Lang
import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers
import io.reactivex.rxjava3.disposables.Disposable
import io.reactivex.rxjava3.schedulers.Schedulers


class JoinGameActivity : AppCompatActivity() {

    private lateinit var adapter: JoinGameRecyclerAdapter
    private lateinit var noGame: TextView

    private var observableGamesSubscription: Disposable? = null
    private var pendingGamesSubscription: Disposable? = null
    private var gameObservedSubscription: Disposable? = null

    private lateinit var recyclerView: RecyclerView

    private lateinit var enterPasswordFragmentContainer: FragmentContainerView
    private lateinit var enterPasswordFragment: EnterPasswordFragment

    private lateinit var app: CrabblApplication

    override fun onCreate(savedInstanceState: Bundle?) {
        app = application as CrabblApplication

        app.themeHandler.changeTheme(this)

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_join_game)

        recyclerView = findViewById(R.id.recyclerview)
        adapter = JoinGameRecyclerAdapter(arrayOf(), this, app)
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter

        noGame = findViewById(R.id.noGame)
        noGame.visibility = View.VISIBLE

        enterPasswordFragmentContainer = findViewById(R.id.enterPasswordFragmentContainer)
        enterPasswordFragmentContainer.visibility = View.INVISIBLE

        enterPasswordFragment =
            supportFragmentManager.findFragmentById(R.id.enterPasswordFragmentContainer) as EnterPasswordFragment

        pendingGames()
        translate()
    }

    fun displayPasswordFragment(gameId: String, password: String) {
        enterPasswordFragmentContainer.visibility = View.VISIBLE
        recyclerView.visibility = View.INVISIBLE

        enterPasswordFragment.initFragment { passwordEntered, isJoin ->
            if (isJoin) {
                if (password == passwordEntered) {
                    joinGame(gameId)
                }
            } else {
                enterPasswordFragmentContainer.visibility = View.INVISIBLE
                recyclerView.visibility = View.VISIBLE
            }
        }
    }

    private fun pendingGames() {
        var joined = false;

        if (app.observe) {
            observableGamesSubscription = app.newGameSocketHandler.observableGamesSubject
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe { gameSettings ->
                    adapter.updateDataSet(gameSettings)

                    noGame.visibility = if (gameSettings.isEmpty()) View.VISIBLE else View.INVISIBLE
                }

            app.newGameSocketHandler.listenForObservableGames()
        } else {
            pendingGamesSubscription = app.newGameSocketHandler.pendingGamesSubject
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe { gameSettings ->
                    adapter.updateDataSet(gameSettings)

                    noGame.visibility = if (gameSettings.isEmpty()) View.VISIBLE else View.INVISIBLE
                }

            app.newGameSocketHandler.listenForPendingGames()
        }
    }

    fun joinGame(id: String) {
        app.host = false
        if (app.observe) {
            gameObservedSubscription = app.newGameSocketHandler.gameObservedSubject
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe { gameSettings ->
                    app.gameSettings = gameSettings
                    val gameActivity = Intent(this, GameActivity::class.java)
                    startActivity(gameActivity)
                }

            app.newGameSocketHandler.observeGame(id, app.accountHandler.getUsername())
        } else {
            app.newGameSocketHandler.joinPendingGame(id, app.accountHandler.getUsername())

            val waitingRoomActivity = Intent(this, WaitingRoomActivity::class.java)
            startActivity(waitingRoomActivity)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        observableGamesSubscription?.dispose()
        pendingGamesSubscription?.dispose()
        gameObservedSubscription?.dispose()
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            noGame.text = resources.getString(R.string.aucun_partie_fr)
        } else {
            noGame.text = resources.getString(R.string.aucun_partie_en)
        }
    }
}

