package com.example.scrabblemobile.classes.game.game

import com.example.scrabblemobile.classes.game.communication.GameSocketHandler
import com.example.scrabblemobile.classes.game.communication.UserAuth
import com.example.scrabblemobile.classes.game.game.card.CardType
import com.example.scrabblemobile.classes.game.game.action.Action
import com.example.scrabblemobile.classes.game.game.action.ActionType
import com.example.scrabblemobile.classes.game.game.action.PlacementSetting
import com.example.scrabblemobile.classes.game.game.board.Board
import com.example.scrabblemobile.classes.game.game.board.Letter
import com.example.scrabblemobile.classes.game.game.card.CardAction
import com.example.scrabblemobile.classes.game.game.gameState.GameState
import com.example.scrabblemobile.classes.game.game.gameState.Player
import com.example.scrabblemobile.classes.game.game.gameState.PlayerWithIndex
import com.example.scrabblemobile.classes.game.game.timer.Timer
import com.example.scrabblemobile.classes.game.game.timer.TimerControls
import io.reactivex.rxjava3.disposables.Disposable
import io.reactivex.rxjava3.subjects.PublishSubject
import java.util.HashMap

class Game(
    var gameToken: String,
    var timePerTurn: Int,
    var arePowerEnabled: Boolean,
    var userName: String,
    players: Array<String>,
    bots: Array<String>,
    var cardsAvailable: Array<CardType>,
    var observe: Boolean
) {

    var players: Array<Player> = arrayOf()
    var activePlayerIndex: Int = 0
    var lettersRemaining: Int = 0
    var letterList: Array<Letter> = arrayOf()
    var hasGameEnded: Boolean = false
    var winnerNames: Array<String> = arrayOf()
    var playersWithIndex: HashMap<String, PlayerWithIndex> = HashMap()

    var board: Board = Board()
    var timer: Timer = Timer()

    private var gameSocketHandler: GameSocketHandler

    var isEndOfGameSubject: PublishSubject<Boolean> = PublishSubject.create()
    var endTurnSubject: PublishSubject<Boolean> = PublishSubject.create()
    var playerTurnsAiSubject: PublishSubject<String> = PublishSubject.create()
    var playerTurnChangedSubject: PublishSubject<Boolean> = PublishSubject.create()
    var boardChangedSubject: PublishSubject<Board> = PublishSubject.create()
    var cardActionSubject: PublishSubject<CardAction> = PublishSubject.create()
    var disconnectedFromServerSubject: PublishSubject<Boolean> = PublishSubject.create()
    var reactionSubject: PublishSubject<Reaction> = PublishSubject.create()
    var firstMoveSubject: PublishSubject<FirstMove> = PublishSubject.create()

    private var gameStateSubscription: Disposable
    private var timerControlSubscription: Disposable
    private var playerTurnsAiSubscription: Disposable
    private var cardActionSubscription: Disposable
    private var disconnectedFromServerSubscription: Disposable
    private var reactionSubscription: Disposable
    private var firstMoveSubscription: Disposable

    init {
        this.players = players.map { v ->
            Player(v, false)
        }.toTypedArray()
        this.players += bots.map { v ->
            Player(v, true)
        }.toTypedArray()

        gameSocketHandler = GameSocketHandler()
        gameSocketHandler.joinGame(UserAuth(this.userName, this.gameToken), observe)

        gameStateSubscription = gameSocketHandler.gameStateSubject.subscribe {gameState ->
            receiveState(gameState)
        }

        timerControlSubscription = gameSocketHandler.timerControlsSubject.subscribe { timerControl ->
            if (timerControl == TimerControls.Start) {
                timer.start(this.timePerTurn)
            }
            else if (timerControl == TimerControls.Stop) {
                timer.stop()
            }
        }

        playerTurnsAiSubscription = gameSocketHandler.playerTurnsAiSubject.subscribe { playerName ->
            val player = this.players.find { v -> v.name == playerName }
            if(player != null) {
                player.isVirtual = true
            }
            playerTurnsAiSubject.onNext(playerName)
        }

        cardActionSubscription = gameSocketHandler.cardActionSubject.subscribe {
            cardActionSubject.onNext(it)
        }

        disconnectedFromServerSubscription = gameSocketHandler.disconnectedFromServerSubject.subscribe {
            disconnectedFromServerSubject.onNext(true);
        }

        reactionSubscription = gameSocketHandler.reactionSubject.subscribe {
            reactionSubject.onNext(it)
        }

        firstMoveSubscription = gameSocketHandler.firstMoveSubject.subscribe {
            firstMoveSubject.onNext(it)
        }
    }

    fun react(emoji: String) {
        gameSocketHandler.react(emoji, if(observe) "OB" else userName)
    }

    fun setFirstMove(firstMove: FirstMove) {
        gameSocketHandler.setFirstMove(firstMove)
    }

    fun playExchangeAction(letters: String) {
        gameSocketHandler.playAction(Action(ActionType.Exchange.id, letters = letters))
    }

    fun playPassTurn() {
        gameSocketHandler.playAction(Action(ActionType.Pass.id))
    }

    fun playPlaceLetter(letters: String, placementSetting: PlacementSetting) {
        gameSocketHandler.playAction(Action(ActionType.Place.id, letters = letters, placementSettings = placementSetting))
    }

    fun playCardPass() {
        gameSocketHandler.playCard(
            CardAction(
                CardType.PassTurn.id,
                userName
            )
        )
    }

    fun playCardJoker(cardChoice: CardType) {
        gameSocketHandler.playCard(
            CardAction(
                CardType.Joker.id,
                userName,

                cardChoice = cardChoice.id
            )
        )
    }

    fun playCardTransmutation(x: Int, y: Int) {
        gameSocketHandler.playCard(
            CardAction(
                CardType.TransformTile.id,
                userName,

                tileToTransformX = x,
                tileToTransformY = y
            )
        )
    }

    fun playCardPoints() {
        gameSocketHandler.playCard(
            CardAction(
                CardType.Points.id,
                userName
            )
        )
    }

    fun playCardSwapRack(player: String) {
        gameSocketHandler.playCard(
            CardAction(
                CardType.SwapRack.id,
                userName,

                playerToSwap = player
            )
        )
    }

    fun playCardSwapLetter(letterFromRack: Letter, letterFromBag: Letter) {
        gameSocketHandler.playCard(
            CardAction(
                CardType.SwapLetter.id,
                userName,

                letterFromRack = letterFromRack,
                letterToGet = letterFromBag
            )
        )
    }

    fun playCardCommunism() {
        gameSocketHandler.playCard(
            CardAction(
                CardType.Steal.id,
                userName
            )
        )
    }

    fun playCardRemoveTime() {
        gameSocketHandler.playCard(
            CardAction(
                CardType.RemoveTime.id,
                userName
            )
        )
    }

    fun destroy() {
        gameStateSubscription.dispose()
        cardActionSubscription.dispose()
        playerTurnsAiSubscription.dispose()
        timerControlSubscription.dispose()
        disconnectedFromServerSubscription.dispose()
        reactionSubscription.dispose()

        gameSocketHandler.disconnect()
    }

    fun isTurn(): Boolean {
        return players[activePlayerIndex].name == userName
    }

    private fun receiveState(gameState: GameState) {
        if(playersWithIndex.size == 0) {
            setupPlayersWithIndex()
        }
        endTurnSubject.onNext(true)
        updateClient(gameState)
    }

    private fun setupPlayersWithIndex() {
        for(i in players.indices) {
            val player = players[i]
            val name = player.name
            playersWithIndex[name] = PlayerWithIndex(i, player)
        }
    }

    private fun updateClient(gameState: GameState) {
        updateBoard(gameState)
        updateActivePlayer(gameState)
        updatePlayers(gameState)
        updateLettersRemaining(gameState)
        updateEndOfGame(gameState)
        updateTimePerTurn(gameState)
    }

    private fun updateBoard(gameState: GameState) {
        board.grid = gameState.grid.clone()
        board.printBoard()
        boardChangedSubject.onNext(board);
    }

    private fun updateActivePlayer(gameState: GameState) {
        val activePlayerIndex = gameState.activePlayerIndex
        val activePlayerName = gameState.players[activePlayerIndex].name
        val playerWithIndex = playersWithIndex[activePlayerName]
        this.activePlayerIndex = playerWithIndex?.index!!
    }

    private fun updatePlayers(gameState: GameState) {
        for (lightPlayer in gameState.players) {
            val name = lightPlayer.name
            val playerWithIndex = playersWithIndex[name]
            val player = playerWithIndex?.player
            player?.points = lightPlayer.points
            player?.cards = if (lightPlayer.cards != null) lightPlayer.cards!!.map { v -> CardType.getById(v) }.toTypedArray() else arrayOf()
            player?.wordsBeforeCard = if (lightPlayer.wordsBeforeCard != null) lightPlayer.wordsBeforeCard!! else 3
            player?.letterRack = lightPlayer.letterRack.clone()
        }

        playerTurnChangedSubject.onNext(true)
    }

    private fun updateLettersRemaining(gameState: GameState) {
        lettersRemaining = gameState.lettersRemaining
        letterList = gameState.letterList.clone()
    }

    private fun updateEndOfGame(gameState: GameState) {
        hasGameEnded = gameState.isEndOfGame
        winnerNames = gameState.winnerIndex.map { i -> gameState.players[i].name }.toTypedArray()
        if(gameState.isEndOfGame) {
            isEndOfGameSubject.onNext(true);
        }
    }

    private fun updateTimePerTurn(gameState: GameState) {
        timePerTurn = gameState.turnTime
    }
}
