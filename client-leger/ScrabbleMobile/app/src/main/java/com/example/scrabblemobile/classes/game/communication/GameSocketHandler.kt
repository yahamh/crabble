package com.example.scrabblemobile.classes.game.communication

import com.example.scrabblemobile.BuildConfig
import com.example.scrabblemobile.classes.J
import com.example.scrabblemobile.classes.game.game.FirstMove
import com.example.scrabblemobile.classes.game.game.Reaction
import com.example.scrabblemobile.classes.game.game.action.Action
import com.example.scrabblemobile.classes.game.game.card.CardAction
import com.example.scrabblemobile.classes.game.game.gameState.ForfeitedGameState
import com.example.scrabblemobile.classes.game.game.gameState.GameState
import com.example.scrabblemobile.classes.game.game.timer.TimerControls
import com.google.gson.Gson
import io.reactivex.rxjava3.subjects.PublishSubject
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject

class GameSocketHandler {

    private var socket: Socket? = null

    var forfeitGameStateSubject: PublishSubject<ForfeitedGameState> =
        PublishSubject.create()
    var gameStateSubject: PublishSubject<GameState> = PublishSubject.create()
    var timerControlsSubject: PublishSubject<TimerControls> = PublishSubject.create()
    var disconnectedFromServerSubject: PublishSubject<Boolean> = PublishSubject.create()
    var playerTurnsAiSubject: PublishSubject<String> = PublishSubject.create()
    var cardActionSubject: PublishSubject<CardAction> = PublishSubject.create()
    var reactionSubject: PublishSubject<Reaction> = PublishSubject.create()
    var firstMoveSubject: PublishSubject<FirstMove> = PublishSubject.create()

    fun joinGame(userAuth: UserAuth, observe: Boolean) {
        if (socket != null) {
            throw Error("A game is already joined!")
        }
        connectToSocket()

        socket?.on("gameState") { args ->
            if (args.isNotEmpty()) {

                val gameState =
                    Gson().fromJson((args[0] as JSONObject).toString(), GameState::class.java)
                gameStateSubject.onNext(gameState)
            }
        }

        socket?.on("cardAction") { args ->
            val cardAction =
                Gson().fromJson((args[0] as JSONObject).toString(), CardAction::class.java)
            cardActionSubject.onNext(cardAction)
        }

        socket?.on("timerControl") { args ->
            timerControlsSubject.onNext(TimerControls.getById(args[0] as Int))
        }

        socket?.on("connect_error") { _ ->
            disconnectedFromServerSubject.onNext(true)
        }

        socket?.on("disconnect") { _ ->
            disconnectedFromServerSubject.onNext(true)
        }

        socket?.on("transitionGameState") { args ->
            val gameState =
                Gson().fromJson((args[0] as JSONObject).toString(), ForfeitedGameState::class.java)
            forfeitGameStateSubject.onNext(gameState)
        }

        socket?.on("playerTurnsAi") { args ->
            playerTurnsAiSubject.onNext(args[0] as String)
        }

        socket?.on("reaction") { args ->
            val reaction = Gson().fromJson((args[0] as JSONObject).toString(), Reaction::class.java)
            reactionSubject.onNext(reaction)
        }

        socket?.on("syncFirstMove") { args ->
            val firstMove =
                Gson().fromJson((args[0] as JSONObject).toString(), FirstMove::class.java)
            firstMoveSubject.onNext(firstMove)
        }

        socket?.emit(if (observe) "observeGame" else "joinGame", J.son(userAuth))
    }

    private fun connectToSocket() {
        val options = IO.Options()
        options.path = "/game"
        socket = IO.socket(BuildConfig.SOCKET_URL, options)
        socket?.connect()
    }

    fun disconnect() {
        socket?.disconnect()
        socket = null
    }

    fun playAction(action: Action) {
        try {
            checkIfConnected();

            socket?.emit("nextAction", J.son(action))
        } catch (_: Error) {

        }
    }

    fun react(emoji: String, user: String) {
        socket?.emit("reaction", J.son(Reaction(emoji, user)))
    }

    fun setFirstMove(firstMove: FirstMove) {
        socket?.emit("syncFirstMove", J.son(firstMove))
    }

    fun playCard(card: CardAction) {
        try {
            checkIfConnected()

            socket?.emit("cardAction", J.son(card))
        } catch (_: Error) {

        }
    }

    private fun checkIfConnected() {
        if (socket == null) {
            throw Error("You must join a game before sending an action.")
        }

        if (!socket?.connected()!!) {
            throw Error("You are not connected to the server.")
        }
    }

}
