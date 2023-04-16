package com.example.scrabblemobile.classes.game.communication


import com.example.scrabblemobile.BuildConfig
import com.example.scrabblemobile.classes.J
import com.example.scrabblemobile.classes.game.game.gameSettings.GameSettings
import com.example.scrabblemobile.classes.game.game.gameSettings.GameSettingsUI
import com.google.gson.Gson
import io.ktor.network.sockets.*
import io.reactivex.rxjava3.subjects.BehaviorSubject
import io.reactivex.rxjava3.subjects.PublishSubject
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONArray
import org.json.JSONObject

class NewGameSocketHandler {
    lateinit var socket: Socket

    var pendingGamesSubject = BehaviorSubject.createDefault(arrayOf<GameSettings>())
    var observableGamesSubject = BehaviorSubject.createDefault(arrayOf<GameSettings>())
    var playersSubject = BehaviorSubject.createDefault(arrayOf<String>())
    var pendingGameIdSubject = BehaviorSubject.createDefault("")

    var gameStartedSubject = PublishSubject.create<GameSettings>()
    var isDisconnectedSubject = PublishSubject.create<Boolean>()
    var errorSubjectSubject = PublishSubject.create<String>()
    var gameObservedSubject = PublishSubject.create<GameSettings>()

    fun createGameMulti(gameSettings: GameSettingsUI) {
        connectToSocket()
        listenForPendingGameId()
        listenForPlayerJoined()
        listenForGameStarted()
        socket.emit("createGame", J.son(gameSettings))
    }

    fun listenForPendingGames() {
        this.connectToSocket()
        socket.on("pendingGames") { args ->
            val gameSettings = Gson().fromJson(
                (args[0] as JSONArray).toString(),
                Array<GameSettings>::class.java
            )
            pendingGamesSubject.onNext(gameSettings)
        }
    }

    fun listenForObservableGames() {
        connectToSocket()
        socket.on("observableGames") {args ->
            val gameSettings = Gson().fromJson(
                (args[0] as JSONArray).toString(),
                Array<GameSettings>::class.java
            )
            observableGamesSubject.onNext(gameSettings)
        }
    }

    fun joinPendingGame(id: String, playerName: String) {
        if (!socket.connected()) {
            throw Error("Can't join game, not connected to server")
        }
        listenForGameStarted()
        listenErrorMessage()
        listenForPlayerJoined()
        listenForGameDeleted()
        socket.emit("joinGame", id, playerName)
    }

    fun observeGame(id: String, playerName: String) {
        this.socket.on("observeGame") {args ->
            val gameSettings = Gson().fromJson((args[0] as JSONObject).toString(), GameSettings::class.java)
            gameObservedSubject.onNext(gameSettings)

            disconnectSocket()
        }

        socket.emit("observeGame", id, playerName)
    }

    fun disconnectSocket() {
        if (socket == null) {
            return
        }
        socket.disconnect()

        isDisconnectedSubject.onNext(true)
    }

    fun startGame(id: String) {
        socket.emit("startGame", id)
    }

    fun kickPlayer(id: String, playerName: String) {
        socket.emit("kickPlayer", id, playerName)
    }

    private fun connectToSocket() {
        val options = IO.Options()
        options.path = "/newGame"
        socket = IO.socket(BuildConfig.SOCKET_URL, options)
        socket.connect()
        socket.on("connect_error") { _ ->

            isDisconnectedSubject.onNext(true)
        }
    }

    private fun listenForGameStarted() {
        socket.on("gameStarted") { args ->
            val gameSettings =
                Gson().fromJson((args[0] as JSONObject).toString(), GameSettings::class.java)
            gameStartedSubject.onNext(gameSettings)

            disconnectSocket()
        }
    }

    private fun listenForPendingGameId() {
        socket.on("pendingGameId") { args ->
            val pendingGameId = args[0] as String
            this.pendingGameIdSubject.onNext(pendingGameId)
        }
    }

    private fun listenForPlayerJoined() {
        socket.on("sendPlayerList") { args ->
            val players =
                Gson().fromJson((args[0] as JSONArray).toString(), Array<String>::class.java)
            this.playersSubject.onNext(players)
        }
    }

    private fun listenForGameDeleted() {
        socket.on("gameDeleted") { _ ->

            disconnectSocket()
        }
    }

    private fun listenErrorMessage() {
        socket.on("error") { args ->
            errorSubjectSubject.onNext(args[0] as String)
        }
    }
}
