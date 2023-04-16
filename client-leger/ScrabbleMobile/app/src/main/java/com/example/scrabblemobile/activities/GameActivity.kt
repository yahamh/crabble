package com.example.scrabblemobile.activities

import android.R.attr.x
import android.R.attr.y
import android.animation.ObjectAnimator
import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ClipDescription
import android.graphics.*
import android.os.Bundle
import android.view.*
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.Group
import androidx.fragment.app.FragmentContainerView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.Colors
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.LetterInfo
import com.example.scrabblemobile.classes.game.game.FirstMove
import com.example.scrabblemobile.classes.game.game.Game
import com.example.scrabblemobile.classes.game.game.Reaction
import com.example.scrabblemobile.classes.game.game.action.PlacementSetting
import com.example.scrabblemobile.classes.game.game.board.Board
import com.example.scrabblemobile.classes.game.game.board.Letter
import com.example.scrabblemobile.classes.game.game.board.Tile
import com.example.scrabblemobile.classes.game.game.card.CardType
import com.example.scrabblemobile.classes.game.views.AdapterLetterHolder
import com.example.scrabblemobile.classes.game.views.LetterView
import com.example.scrabblemobile.classes.game.views.SimpleDragShadowBuilder
import com.example.scrabblemobile.classes.personalization.Lang
import com.example.scrabblemobile.classes.personalization.Theme
import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers
import io.reactivex.rxjava3.disposables.Disposable
import io.reactivex.rxjava3.schedulers.Schedulers
import java.util.*
import kotlin.concurrent.schedule
import kotlin.math.floor


class GameActivity : AppCompatActivity(), SurfaceHolder.Callback {
    private lateinit var boardView: SurfaceView
    private lateinit var recyclerViewLetterHolder: RecyclerView
    private lateinit var letterRackAdapter: AdapterLetterHolder
    private var lettersPlacedArray: ArrayList<LetterInfo> = ArrayList()
    private var letterRackDataSet: ArrayList<Letter> = ArrayList()

    private lateinit var app: CrabblApplication

    private lateinit var bitmap: Bitmap
    private lateinit var scaledBitmap: Bitmap

    private lateinit var buttonPlace: Button
    private lateinit var buttonPass: Button
    private lateinit var buttonResign: Button
    private lateinit var buttonCancel: Button
    private lateinit var buttonExchange: Button

    private lateinit var tempGrid: Array<Array<Tile>>

    private lateinit var timerProgressBar: ProgressBar
    private var playerNameViews: Array<TextView> = arrayOf()
    private var playerScoreViews: Array<TextView> = arrayOf()
    private var playerCurrentTurnViews: Array<TextView> = arrayOf()
    private var observePlayerButtons: Array<Button> = arrayOf()
    private var playerZoneViews: Array<LinearLayout> = arrayOf()
    private var avatarViews: Array<ImageView> = arrayOf()

    private lateinit var buttonPowerCard: Button
    private lateinit var cardFragmentContainer: FragmentContainerView
    private lateinit var cardFragment: CardsFragment

    private lateinit var cardUsedFragmentContainer: FragmentContainerView
    private lateinit var cardUsedFragment: CardUsedFragment

    private lateinit var exchangeFragmentContainer: FragmentContainerView
    private lateinit var exchangeFragment: ExchangeFragment

    private lateinit var jokerFragmentContainer: FragmentContainerView
    private lateinit var jokerFragment: JokerLetterFragment

    private lateinit var reactionButton: Button
    private lateinit var reactionLayout: LinearLayout
    private lateinit var waveButton: Button
    private lateinit var applauseButton: Button
    private lateinit var thumbsUpButton: Button
    private lateinit var fearButton: Button
    private lateinit var angryButton: Button
    private lateinit var heartButton: Button
    private lateinit var emojiGroup: Group

    private lateinit var bagLettersRemainingView: TextView

    lateinit var game: Game

    private lateinit var letterRack: Array<Letter>

    private var boardChangedSubscription: Disposable? = null
    private var playerTurnChangedSubscription: Disposable? = null
    private var letterRackChangedSubscription: Disposable? = null

    private var timerSubscription: Disposable? = null
    private var timerEndSubscription: Disposable? = null
    private var cardActionSubscription: Disposable? = null
    private var endGameSubscription: Disposable? = null
    private var disconnectSubscription: Disposable? = null
    private var reactionSubscription: Disposable? = null
    private var firstMoveSubcription: Disposable? = null
    private var playerTurnsAiSubscription: Disposable? = null

    private var colors = Colors()

    private var touchedX = 0f
    private var touchedY = 0f

    private var isDropValid = true

    private var observed: String = ""

    private var firstMove: FirstMove? = null
    private var firstDroppedLetter: LetterInfo? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        app = application as CrabblApplication

        app.themeHandler.changeTheme(this)

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)

        bitmap = BitmapFactory.decodeResource(resources, R.drawable.tuile)
        scaledBitmap = Bitmap.createScaledBitmap(bitmap, 75, 75, true)

        buttonPlace = findViewById(R.id.button_placer)
        buttonPass = findViewById(R.id.button_passer)
        buttonResign = findViewById(R.id.button_abandonner)
        buttonCancel = findViewById(R.id.button_annuler)
        buttonExchange = findViewById(R.id.button_echanger)

        tempGrid = Array(15) {
            Array(15) {
                Tile()
            }
        }

        buttonPlace.setOnClickListener { playPlace() }
        buttonPass.setOnClickListener { game.playPassTurn() }
        buttonCancel.setOnClickListener { cancelPlacement() }
        buttonResign.setOnClickListener { handleResign() }

        boardView = findViewById(R.id.surface_view_grid)
        boardView.holder.addCallback(this)

        timerProgressBar = findViewById((R.id.progressbar_timer))

        recyclerViewLetterHolder = findViewById(R.id.recyler_view_letter_holder)
        recyclerViewLetterHolder.setHasFixedSize(true)

        reactionButton = findViewById(R.id.reactionButton)
        reactionLayout = findViewById(R.id.reactionLayout)
        thumbsUpButton = findViewById(R.id.thumbsUpButton)
        heartButton = findViewById(R.id.heartButton)
        waveButton = findViewById(R.id.waveButton)
        applauseButton = findViewById(R.id.applauseButton)
        angryButton = findViewById(R.id.angryButton)
        fearButton = findViewById(R.id.fearButton)

        emojiGroup = findViewById(R.id.emojiGroup)
        emojiGroup.visibility = View.GONE
        emojiGroup.referencedIds.forEach { id ->
            findViewById<TextView>(id).visibility = View.GONE
        }

        reactionButton.text = "👋"
        reactionLayout.visibility = View.GONE

        reactionButton.setOnClickListener {
            if (reactionButton.text == "❌") {
                reactionButton.text = "👋"
                reactionButton.textSize = 50f
                reactionLayout.visibility = View.GONE
            } else {
                reactionButton.text = "❌"
                reactionButton.textSize = 35f
                reactionLayout.visibility = View.VISIBLE
            }
        }

        thumbsUpButton.setOnClickListener { react("👍") }
        heartButton.setOnClickListener { react("❤️") }
        waveButton.setOnClickListener { react("👋") }
        applauseButton.setOnClickListener { react("👏") }
        angryButton.setOnClickListener { react("😡") }
        fearButton.setOnClickListener { react("😱") }

        playerZoneViews += findViewById<LinearLayout>(R.id.zonePlayer1)
        playerZoneViews += findViewById<LinearLayout>(R.id.zonePlayer2)
        playerZoneViews += findViewById<LinearLayout>(R.id.zonePlayer3)
        playerZoneViews += findViewById<LinearLayout>(R.id.zonePlayer4)

        playerNameViews += findViewById<TextView>(R.id.playerName1)
        playerNameViews += findViewById<TextView>(R.id.playerName2)
        playerNameViews += findViewById<TextView>(R.id.playerName3)
        playerNameViews += findViewById<TextView>(R.id.playerName4)

        playerScoreViews += findViewById<TextView>(R.id.playerScore1)
        playerScoreViews += findViewById<TextView>(R.id.playerScore2)
        playerScoreViews += findViewById<TextView>(R.id.playerScore3)
        playerScoreViews += findViewById<TextView>(R.id.playerScore4)

        playerCurrentTurnViews += findViewById<TextView>(R.id.playerCurrentTurn1)
        playerCurrentTurnViews += findViewById<TextView>(R.id.playerCurrentTurn2)
        playerCurrentTurnViews += findViewById<TextView>(R.id.playerCurrentTurn3)
        playerCurrentTurnViews += findViewById<TextView>(R.id.playerCurrentTurn4)

        observePlayerButtons += findViewById<Button>(R.id.observePlayer1)
        observePlayerButtons += findViewById<Button>(R.id.observePlayer2)
        observePlayerButtons += findViewById<Button>(R.id.observePlayer3)
        observePlayerButtons += findViewById<Button>(R.id.observePlayer4)

        avatarViews += findViewById<ImageView>(R.id.playerAvatar1)
        avatarViews += findViewById<ImageView>(R.id.playerAvatar2)
        avatarViews += findViewById<ImageView>(R.id.playerAvatar3)
        avatarViews += findViewById<ImageView>(R.id.playerAvatar4)

        buttonPowerCard = findViewById(R.id.powerCardButton)

        bagLettersRemainingView = findViewById(R.id.bagLettersRemaining)

        initGame()

        reactionSubscription = game.reactionSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe {
                showReaction(it)
            }

        for ((index, button) in observePlayerButtons.withIndex()) {
            button.visibility = if (game.observe) View.VISIBLE else View.GONE
            if (index == 0) {
                button.isEnabled = false
            }

            button.setOnClickListener {
                observePlayerButtons.forEach { v -> v.isEnabled = true }
                observed = game.players[index].name
                it.isEnabled = false
                updateLetterRack(game.players.find { p -> p.name == getObservedUsername() }!!.letterRack)
                updateCardButton()
            }
        }

        buttonPowerCard.visibility =
            if (requireGame().arePowerEnabled) View.VISIBLE else View.INVISIBLE
        buttonPowerCard.setOnClickListener {
            displayCardFragment()
        }

        buttonExchange.setOnClickListener {
            displayExchangeFragment()
        }

        cardFragmentContainer = findViewById(R.id.cardsFragmentContainer)
        cardFragmentContainer.visibility = View.INVISIBLE

        cardFragment =
            supportFragmentManager.findFragmentById(R.id.cardsFragmentContainer) as CardsFragment

        cardUsedFragmentContainer = findViewById(R.id.cardUsedFragment)

        cardUsedFragment =
            supportFragmentManager.findFragmentById(R.id.cardUsedFragment) as CardUsedFragment

        exchangeFragmentContainer = findViewById(R.id.exchangeFragmentContainer)
        exchangeFragmentContainer.visibility = View.INVISIBLE

        exchangeFragment =
            supportFragmentManager.findFragmentById(R.id.exchangeFragmentContainer) as ExchangeFragment

        jokerFragmentContainer = findViewById(R.id.jokerFragmentContainer)
        jokerFragmentContainer.visibility = View.INVISIBLE

        jokerFragment =
            supportFragmentManager.findFragmentById(R.id.jokerFragmentContainer) as JokerLetterFragment

        val layoutManager =
            LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)

        recyclerViewLetterHolder.layoutManager = layoutManager

        letterRackAdapter = AdapterLetterHolder(letterRackDataSet)

        recyclerViewLetterHolder.adapter = letterRackAdapter

        if (game.observe) {
            letterRackAdapter.canDragAndDrop = false

            buttonPass.isEnabled = false
            buttonPlace.isEnabled = false
            buttonExchange.isEnabled = false
            buttonCancel.isEnabled = false

            buttonResign.text =
                if (app.langHandler.getLang() == Lang.FR) resources.getString(R.string.quitter_fr) else resources.getString(
                    R.string.quitter_en
                )
        }

        game.players.forEachIndexed { index, player ->
            if (!player.isVirtual) {
                app.accountHandler.requestAccountData(player.name) { data ->
                    runOnUiThread {
                        when (data.profilePictureId) {
                            "0" -> avatarViews[index].setImageResource(R.drawable.dog)
                            "1" -> avatarViews[index].setImageResource(R.drawable.hoopoe)
                            "2" -> avatarViews[index].setImageResource(R.drawable.orca)
                            "3" -> avatarViews[index].setImageResource(R.drawable.penguin)
                            "4" -> avatarViews[index].setImageResource(R.drawable.walrus)
                        }
                    }
                }
            }
        }

        bagLettersRemainingView.text = if(app.isFr()) "70 lettres restantes" else "70 letters remaining"

        setBoardListeners()

        translate()
    }

    override fun onDestroy() {
        super.onDestroy()

        boardChangedSubscription?.dispose()
        playerTurnChangedSubscription?.dispose()
        letterRackChangedSubscription?.dispose()
        timerSubscription?.dispose()
        endGameSubscription?.dispose()
        timerEndSubscription?.dispose()
        cardActionSubscription?.dispose()
        disconnectSubscription?.dispose()
        reactionSubscription?.dispose()
        playerTurnsAiSubscription?.dispose()

        exchangeFragment.letterTouchedSubscription?.dispose()

        game.destroy()
        app.game = null
    }

    override fun onBackPressed() {
        handleResign()
    }

    private fun initGame() {
        if (app.game == null) {
            app.game = Game(
                app.gameSettings!!.id,
                app.gameSettings!!.timePerTurn,
                app.gameSettings!!.cards.isNotEmpty(),
                app.accountHandler.getUsername(),
                app.gameSettings!!.players,
                app.gameSettings!!.bots,
                app.gameSettings!!.cards.map { v -> CardType.getById(v) }.toTypedArray(),
                app.observe
            )
        }

        game = requireGame()

        boardChangedSubscription = game.boardChangedSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe { board ->
                copyGrid()
                firstMove = null
                drawBoard(board)
            }

        playerTurnChangedSubscription = game.playerTurnChangedSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe {
                val lang = app.langHandler.getLang()
                val you: String
                val turn: String

                if (lang == Lang.FR) {
                    you = "Vous"
                    turn = "Au tour de"
                } else {
                    you = "You"
                    turn = "Current player"
                }

                for (i in game.players.indices) {
                    playerCurrentTurnViews[i].text =
                        if (game.players[game.activePlayerIndex].name == game.players[i].name) turn else ""
                    playerNameViews[i].text =
                        "${game.players[i].name}" + if (game.players[i].name == app.accountHandler.getUsername()) " ($you)" else ""
                    playerScoreViews[i].text = "${game.players[i].points} points"
                }
                if (!game.observe) {
                    enableButtons()
                }

                firstDroppedLetter = null

                updateCardButton()
                updateLetterRack(game.players.find { p -> p.name == getObservedUsername() }!!.letterRack)

                bagLettersRemainingView.text = if(app.isFr()) "${game.lettersRemaining} lettres restantes" else "${game.lettersRemaining} letters remaining"
            }

        endGameSubscription = game.isEndOfGameSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe {
                val lang = app.langHandler.getLang()
                if (lang == Lang.FR) {
                    buttonResign.text = resources.getString(R.string.quitter_fr)
                } else {
                    buttonResign.text = resources.getString(R.string.quitter_en)
                }
                showWinnerDialog()
            }

        timerSubscription = game.timer.timeLeftSubject.subscribe {
            timerProgressBar.progress = floor(1000f * it.toFloat() / game.timePerTurn).toInt()
        }

        timerEndSubscription = game.timer.timerSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe {
                hideCardFragment()
            }

        cardActionSubscription = game.cardActionSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe {
                cardUsedFragment.cardUsed(it)
            }

        disconnectSubscription = game.disconnectedFromServerSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe {
                if (!game.hasGameEnded) {
                    val builder = if (app.themeHandler.getTheme() == Theme.LIGHT) {
                        AlertDialog.Builder(this)
                    } else {
                        AlertDialog.Builder(this, R.style.dialog_dark)
                    }
                    val lang = app.langHandler.getLang()

                    if (lang == Lang.FR) {
                        builder.setTitle("Tous les joueurs ont quitté la partie")
                    } else {
                        builder.setTitle("Every player left the game")
                    }

                    builder.setPositiveButton("Ok") { _, _ ->
                        finish()
                    }

                    val alertDialog = builder.create()
                    alertDialog.show()
                }
            }

        firstMoveSubcription = game.firstMoveSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe {
                if (!game.isTurn()) {
                    firstMove = it
                    drawBoard(game.board)
                }
            }

        playerTurnsAiSubscription = game.playerTurnsAiSubject
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe {
                val playerChangedIndex = game.players.indexOfFirst { p -> p.name == it }
                if(playerChangedIndex != -1) {
                    avatarViews[playerChangedIndex].setImageResource(R.drawable.bot)
                }
            }
    }

    private fun updateLetterRack(letterRack: Array<Letter>) {
        recyclerViewLetterHolder.post {
            letterRackAdapter.emptyRack()
            for (letter in letterRack) {
                letterRackDataSet.add(letter)
                letterRackAdapter.notifyItemInserted(letterRackDataSet.size - 1)
            }
        }
        this.letterRack = letterRack.clone()
    }

    private fun updateCardButton() {
        val lang = app.langHandler.getLang()
        val card: String
        val place: String
        val words: String

        if (lang == Lang.FR) {
            card = "carte"
            place = "Placez"
            words = "mots"
        } else {
            card = "card"
            place = "Place"
            words = "words"
        }
        val selfPlayer = game.players.find { p -> p.name == getObservedUsername() }!!
        buttonPowerCard.text =
            "${selfPlayer.cards.size} $card" + (if (selfPlayer.cards.size > 1) "s" else "") + (if (selfPlayer.cards.size < 3) "\n$place ${selfPlayer.wordsBeforeCard} $words" else "")

        buttonPowerCard.isEnabled = selfPlayer.cards.isNotEmpty()
        cardFragment.changeTurnState(selfPlayer == game.players[game.activePlayerIndex])
    }

    private fun getObservedUsername(): String {
        return if (game.observe) (if (observed == "") game.players[0].name else observed) else game.userName
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setBoardListeners() {
        boardView.apply {
            // Set the drag event listener for the View.
            setOnDragListener { _, e ->
                // Handles each of the expected events.
                when (e.action) {
                    DragEvent.ACTION_DRAG_STARTED -> {
                        true
                    }
                    DragEvent.ACTION_DRAG_ENTERED -> {
                        isDropValid = true
                        true
                    }
                    DragEvent.ACTION_DRAG_LOCATION -> {
                        true
                    }
                    DragEvent.ACTION_DRAG_EXITED -> {
                        isDropValid = false
                        true
                    }
                    DragEvent.ACTION_DROP -> {
                        if (e.localState == null) {
                            moveTileOnBoard(touchedX, touchedY, e.x, e.y)
                        } else {
                            handleDroppedTile(e.x, e.y, e.localState as LetterView)
                        }
                        true
                    }
                    DragEvent.ACTION_DRAG_ENDED -> {
                        if (!isDropValid && e.localState == null) {
                            val i = floor(touchedX / 75f).toInt()
                            val j = floor(touchedY / 75f).toInt()
                            moveLetterBackToRack(i, j)
                            isDropValid = true
                        }
                        false
                    }
                    else -> {
                        false
                    }
                }
            }

            setOnTouchListener { v, motionEvent ->
                if (motionEvent.actionMasked == MotionEvent.ACTION_DOWN) {
                    touchedX = motionEvent.x
                    touchedY = motionEvent.y

                    val i = floor(touchedX / 75f).toInt()
                    val j = floor(touchedY / 75f).toInt()

                    val letterObject = game.board.grid[j][i].letterObject

                    if (game.isTurn() && letterObject.char != " " && letterObject.isTemp == true) {
                        val item = ClipData.Item(v.tag as? CharSequence)

                        val dragData = ClipData(
                            v.tag as? CharSequence,
                            arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN),
                            item
                        )

                        val myShadow = SimpleDragShadowBuilder(this)

                        v.startDragAndDrop(
                            dragData,
                            myShadow,
                            null,
                            0
                        )
                    }
                    // Indicate that the long-click was handled.
                    true
                }
                false
            }

            /*setOnLongClickListener { v ->
                val i = floor(touchedX / 75f).toInt()
                val j = floor(touchedY / 75f).toInt()

                val letterObject = game.board.grid[j][i].letterObject

                if (game.isTurn() && letterObject.char != " " && letterObject.isTemp == true) {
                    val item = ClipData.Item(v.tag as? CharSequence)

                    val dragData = ClipData(
                        v.tag as? CharSequence,
                        arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN),
                        item
                    )

                    val myShadow = SimpleDragShadowBuilder(this)

                    v.startDragAndDrop(
                        dragData,
                        myShadow,
                        null,
                        0
                    )
                }
                // Indicate that the long-click was handled.
                true
            }*/
        }
    }

    private fun requireGame(): Game {
        if (app.game != null) {
            return app.game!!
        } else {
            throw Error("Game must be initialized")
        }
    }


    private fun enableButtons() {
        if (game.observe) {
            return
        }

        val isTurn = game.isTurn()

        buttonPass.isEnabled = isTurn
        buttonCancel.isEnabled = false
        buttonPlace.isEnabled = false
        buttonExchange.isEnabled = isTurn && game.lettersRemaining >= 7
    }

    private fun copyGrid() {
        for (x in 0..14) {
            for (y in 0..14) {
                tempGrid[y][x] = game.board.grid[y][x].copy()
            }
        }
    }

    private fun react(reaction: String) {
        reactionButton.text = "👋"
        reactionButton.textSize = 50f
        reactionLayout.visibility = View.GONE

        game.react(reaction)
    }

    private fun setFirstMove() {
        val letter = firstDroppedLetter
        if (letter == null) {
            game.setFirstMove(FirstMove(0, 0, true))
        } else {
            game.setFirstMove(FirstMove(letter.x, letter.y, false))
        }
    }

    private fun showReaction(reaction: Reaction) {
        var playerId = game.players.indexOfFirst { p -> p.name == reaction.user }

        emojiGroup.referencedIds.forEach { id ->
            val view = findViewById<TextView>(id)
            view.text = reaction.emoji
            view.alpha = 1f

            val zone = if (playerId == -1) boardView else playerZoneViews[playerId]
            val coords: IntArray = IntArray(2)

            zone.getLocationOnScreen(coords)

            view.x = coords[0].toFloat() + Math.random().toFloat() * zone.width - view.width / 2
            view.y = coords[1].toFloat() + Math.random().toFloat() * zone.height - view.height / 2
            if (playerId == -1) {
                view.scaleX = 1.2f + Math.random().toFloat() * 0.8f
            } else {
                view.scaleX = 0.5f + Math.random().toFloat() * 0.4f
            }
            view.scaleY = view.scaleX

            val delay = (Math.random() * 3000f).toLong()

            Timer().schedule(delay) {
                runOnUiThread {
                    view.visibility = View.VISIBLE
                }
            }

            Timer().schedule(delay + 1000) {
                runOnUiThread {
                    view.visibility = View.GONE
                }
            }

            ObjectAnimator.ofFloat(view, "translationY", view.y - 200f).apply {
                duration = 1000
                startDelay = delay
                start()
            }

            ObjectAnimator.ofFloat(view, "alpha", 0f).apply {
                duration = 500
                startDelay = delay + 500
                start()
            }
        }
    }

    private fun displayCardFragment() {
        buttonPlace.isClickable = false
        buttonPass.isClickable = false
        buttonPowerCard.isClickable = false
        recyclerViewLetterHolder.isClickable = false
        letterRackAdapter.canDragAndDrop = false
        reactionButton.isClickable = false

        reactionButton.text = "👋"
        reactionButton.textSize = 50f
        reactionLayout.visibility = View.GONE

        cardFragment.reinitCards(game, getObservedUsername()) {
            hideCardFragment()
        }

        cardFragmentContainer.visibility = View.VISIBLE
    }

    private fun hideCardFragment() {
        cardFragmentContainer.visibility = View.INVISIBLE

        buttonPlace.isClickable = true
        buttonPass.isClickable = true
        buttonPowerCard.isClickable = true
        recyclerViewLetterHolder.isClickable = true
        reactionButton.isClickable = true
        if (!game.observe) {
            letterRackAdapter.canDragAndDrop = true
        }
    }

    private fun displayExchangeFragment() {
        exchangeFragmentContainer.visibility = View.VISIBLE

        exchangeFragment.initFragment(letterRack) {
            if (it) {
                game.playExchangeAction(exchangeFragment.letters)
            }
            hideExchangeFragment()
        }

        reactionButton.text = "👋"
        reactionButton.textSize = 50f
        reactionLayout.visibility = View.GONE

        buttonPlace.isClickable = false
        buttonPass.isClickable = false
        buttonPowerCard.isClickable = false
        recyclerViewLetterHolder.isClickable = false
        letterRackAdapter.canDragAndDrop = false
        reactionButton.isClickable = false
    }

    private fun hideExchangeFragment() {
        exchangeFragmentContainer.visibility = View.INVISIBLE

        buttonPlace.isClickable = true
        buttonPass.isClickable = true
        buttonPowerCard.isClickable = true
        recyclerViewLetterHolder.isClickable = true
        reactionButton.isClickable = true
        if (!game.observe) {
            letterRackAdapter.canDragAndDrop = true
        }
    }

    private fun showJokerFragment(x: Int, y: Int) {
        jokerFragmentContainer.visibility = View.VISIBLE

        reactionButton.text = "👋"
        reactionButton.textSize = 50f
        reactionLayout.visibility = View.GONE

        buttonPlace.isClickable = false
        buttonPass.isClickable = false
        buttonPowerCard.isClickable = false
        recyclerViewLetterHolder.isClickable = false
        letterRackAdapter.canDragAndDrop = false
        reactionButton.isClickable = false

        jokerFragment.initFragment {
            hideJokerFragment()
            handlerJokerTile(x, y, it)
        }
    }

    private fun hideJokerFragment() {
        jokerFragmentContainer.visibility = View.INVISIBLE

        buttonPlace.isClickable = true
        buttonPass.isClickable = true
        buttonPowerCard.isClickable = true
        recyclerViewLetterHolder.isClickable = true
        reactionButton.isClickable = true
        if (!game.observe) {
            letterRackAdapter.canDragAndDrop = true
        }
    }

    private fun playPlace() {
        reactionButton.text = "👋"
        reactionButton.textSize = 50f
        reactionLayout.visibility = View.GONE

        if (lettersPlacedArray.isEmpty()) {
            return
        }

        val isHorizontal = checkDirection()

        val firstLetter = findFirstLetter(isHorizontal)

        val word = constructWord(firstLetter.x, firstLetter.y, isHorizontal)

        val direction = if (isHorizontal) "H" else "V"

        lettersPlacedArray.clear()

        game.playPlaceLetter(
            word,
            PlacementSetting(firstLetter.x, firstLetter.y, direction)
        )
    }

    private fun cancelPlacement() {
        for (x in 0..14) {
            for (y in 0..14) {
                game.board.grid[y][x] = tempGrid[y][x].copy()
            }
        }
        letterRackAdapter.emptyRack()
        for (letter in letterRack) {
            letterRackDataSet.add(letter)
            letterRackAdapter.notifyItemInserted(letterRackDataSet.size - 1)
        }

        lettersPlacedArray.clear()
        firstDroppedLetter = null
        setFirstMove()

        buttonCancel.isEnabled = false
        buttonPlace.isEnabled = false

        drawBoard(game.board)
    }

    private fun handleResign() {
        reactionButton.text = "👋"
        reactionButton.textSize = 50f
        reactionLayout.visibility = View.GONE

        if (game.hasGameEnded || game.observe) {
            finish()
            return
        }
        showResignDialog()
    }

    private fun showWinnerDialog() {
        val builder = if (app.themeHandler.getTheme() == Theme.LIGHT) {
            AlertDialog.Builder(this)
        } else {
            AlertDialog.Builder(this, R.style.dialog_dark)
        }

        val lang = app.langHandler.getLang()

        var isWinner = false

        for (name in game.winnerNames) {
            if (name == app.accountHandler.getLoginPreferences().username!!) {
                isWinner = true
            }
        }

        if (isWinner) {
            if (lang == Lang.FR) {
                builder.setTitle("Félicitations!")
            } else {
                builder.setTitle("Congratulations!")
            }
        } else {
            if (lang == Lang.FR) {
                builder.setTitle("Dommage...")
            } else {
                builder.setTitle("Too bad...")
            }
        }

        if (game.winnerNames.size == 1) {
            if (lang == Lang.FR) {
                builder.setMessage("Le gagnant de la partie est " + game.winnerNames[0])
            } else {
                builder.setMessage("The winner of the game is " + game.winnerNames[0])
            }
        } else {
            var message = if (lang == Lang.FR) {
                "Les gagnants de la partie sont "
            } else {
                "The winners of the game are "
            }
            for (i in 0 until game.winnerNames.size) {
                message += game.winnerNames[i]
                if (i < game.winnerNames.size - 1) {
                    message += if (lang == Lang.FR) {
                        "et "
                    } else {
                        "and "
                    }
                }
            }
            builder.setMessage(message)
        }

        builder.setNeutralButton("OK", null)

        val alertDialog = builder.create()
        alertDialog.show()
    }

    private fun showResignDialog() {
        val builder = if (app.themeHandler.getTheme() == Theme.LIGHT) {
            AlertDialog.Builder(this)
        } else {
            AlertDialog.Builder(this, R.style.dialog_dark)
        }

        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            builder.setTitle("Voulez-vous abandonner cette partie?")

            builder.setMessage("Vous seriez alors déclaré perdant")

            builder.setNegativeButton("Annuler", null)

            builder.setPositiveButton("Abandonner") { _, _ ->
                finish()
            }
        } else {
            builder.setTitle("Do you want to forfeit this game?")

            builder.setMessage("You would be declared loser")

            builder.setNegativeButton("Cancel", null)

            builder.setPositiveButton("Forfeit") { _, _ ->
                finish()
            }
        }

        val alertDialog = builder.create()
        alertDialog.show()
    }

    private fun findFirstLetter(isHorizontal: Boolean): LetterInfo {
        var firstLetter = lettersPlacedArray[0]

        if (isHorizontal) {
            for (x in firstLetter.x downTo 0) {
                if (game.board.grid[firstLetter.y][x].letterObject.char == " ") {
                    break
                }
                firstLetter =
                    LetterInfo(x, firstLetter.y, game.board.grid[firstLetter.y][x].letterObject)
            }
        } else {
            for (y in firstLetter.y downTo 0) {
                if (game.board.grid[y][firstLetter.x].letterObject.char == " ") {
                    break
                }
                firstLetter =
                    LetterInfo(firstLetter.x, y, game.board.grid[y][firstLetter.x].letterObject)
            }
        }

        return firstLetter
    }

    private fun checkDirection(): Boolean {
        val isHorizontal = true
        if (lettersPlacedArray.size == 1) {
            val placedLetter = lettersPlacedArray[0]
            // LEFT
            if (placedLetter.x > 0) {
                if (game.board.grid[placedLetter.y][placedLetter.x - 1].letterObject.char != " ") {
                    return isHorizontal
                }
            }

            // RIGHT
            if (placedLetter.x < 14) {
                if (game.board.grid[placedLetter.y][placedLetter.x + 1].letterObject.char != " ") {
                    return isHorizontal
                }
            }

            // TOP
            if (placedLetter.y > 0) {
                if (game.board.grid[placedLetter.y - 1][placedLetter.x].letterObject.char != " ") {
                    return !isHorizontal
                }
            }

            // BOTTOM
            if (placedLetter.y < 14) {
                if (game.board.grid[placedLetter.y + 1][placedLetter.x].letterObject.char != " ") {
                    return !isHorizontal
                }
            }
        } else {
            return lettersPlacedArray[0].y == lettersPlacedArray[1].y
        }
        return false
    }

    private fun constructWord(x: Int, y: Int, isHorizontal: Boolean): String {
        var word = ""

        if (isHorizontal) {
            for (i in x..14) {
                var letterChar = game.board.grid[y][i].letterObject.char
                if (letterChar == " ") {
                    break
                }
                if (game.board.grid[y][i].letterObject.value != 0) {
                    letterChar = letterChar.lowercase()
                }
                word += letterChar
            }
        } else {
            for (i in y..14) {
                var letterChar = game.board.grid[i][x].letterObject.char
                if (letterChar == " ") {
                    break
                }
                if (game.board.grid[i][x].letterObject.value != 0) {
                    letterChar = letterChar.lowercase()
                }
                word += letterChar
            }
        }

        return word
    }

    private fun handleDroppedTile(x: Float, y: Float, letterView: LetterView) {
        val i = floor(x / 75f).toInt()
        val j = floor(y / 75f).toInt()

        if (!game.isTurn() || game.board.grid[j][i].letterObject.char != " ") {
            return
        }

        val tile = Tile(Letter(letterView.letter.char, letterView.letter.value, true))

        if (tile.letterObject.char == "*") {
            letterRackAdapter.deleteLetter(letterView.tag as Int)
            showJokerFragment(i, j)
            return
        }

        if (firstDroppedLetter == null) {
            firstDroppedLetter = LetterInfo(i, j, letterView.letter)
            setFirstMove()
        }

        lettersPlacedArray.add(LetterInfo(i, j, letterView.letter))

        letterRackAdapter.deleteLetter(letterView.tag as Int)

        game.board.grid[j][i] = tile

        buttonCancel.isEnabled = true
        buttonPlace.isEnabled = true

        drawBoard(game.board)
    }

    private fun handlerJokerTile(x: Int, y: Int, char: Char) {
        if (!game.isTurn()) {
            return
        }

        if (firstDroppedLetter == null) {
            firstDroppedLetter = LetterInfo(x, y, Letter(char.toString(), 0, true))
            setFirstMove()
        }

        val tile = Tile(Letter(char.toString(), 0, true))

        lettersPlacedArray.add(LetterInfo(x, y, Letter(char.toString(), 0, true)))

        game.board.grid[y][x] = tile

        buttonCancel.isEnabled = true
        buttonPlace.isEnabled = true

        drawBoard(game.board)
    }

    private fun moveTileOnBoard(x: Float, y: Float, newX: Float, newY: Float) {
        val i = floor(x / 75f).toInt()
        val j = floor(y / 75f).toInt()
        val newI = floor(newX / 75f).toInt()
        val newJ = floor(newY / 75f).toInt()

        val tile = game.board.grid[j][i]

        val tileToReplace = game.board.grid[newJ][newI]

        val tempGridTile = tempGrid[j][i]

        if (i == newI && j == newJ) {
            return
        }

        if (!game.isTurn() || tileToReplace.letterObject.char != " ") {
            moveLetterBackToRack(i, j)
            return
        }

        val firstLetter = firstDroppedLetter?.copy()
        if (firstLetter != null) {
            if (firstLetter.x == i && firstLetter.y == j) {
                firstDroppedLetter = LetterInfo(newI, newJ, tile.letterObject)
                setFirstMove()
            }
        } else {
            firstDroppedLetter = LetterInfo(newI, newJ, tile.letterObject)
            setFirstMove()
        }

        var letterToRemove: LetterInfo? = null
        for (letter in lettersPlacedArray) {
            if (letter.x == i && letter.y == j) {
                letterToRemove = letter
            }
        }

        lettersPlacedArray.remove(letterToRemove)

        lettersPlacedArray.add(LetterInfo(newI, newJ, tile.letterObject))

        game.board.grid[newJ][newI] = tile
        game.board.grid[j][i] = tempGridTile

        drawBoard(game.board)
    }

    private fun moveLetterBackToRack(x: Int, y: Int) {
        val letter = game.board.grid[y][x].letterObject

        var letterToRemove: LetterInfo? = null
        for (letterPlaced in lettersPlacedArray) {
            if (letterPlaced.x == x && letterPlaced.y == y) {
                letterToRemove = letterPlaced
            }
        }

        val firstLetter = firstDroppedLetter?.copy()

        if (firstLetter != null) {
            if (firstLetter.x == x && firstLetter.y == y) {
                firstDroppedLetter = null
                setFirstMove()
            }
        }

        val tempGridTile = tempGrid[y][x]

        lettersPlacedArray.remove(letterToRemove)

        game.board.grid[y][x] = tempGridTile

        if (letter.value == 0) {
            letter.char = "*"
        }

        letterRackDataSet.add(letter)
        letterRackAdapter.notifyItemInserted(letterRackDataSet.size - 1)

        if (lettersPlacedArray.isEmpty()) {
            buttonCancel.isEnabled = false
            buttonPlace.isEnabled = false
        }

        drawBoard(game.board)
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        drawBoard(Board())
    }

    override fun surfaceChanged(p0: SurfaceHolder, p1: Int, p2: Int, p3: Int) {
    }

    override fun surfaceDestroyed(p0: SurfaceHolder) {
    }

    private fun drawBoard(board: Board) {
        val canvas = boardView.holder.lockCanvas()

        for (y in 0..14) {
            for (x in 0..14) {
                val tile = board.grid[y][x]

                if (board.grid[y][x].letterObject.char != " ") {
                    drawLetter(canvas, x, y, tile.letterObject.char, tile.letterObject.value)
                } else {
                    drawSquare(canvas, x, y, board.grid[y][x])
                }
            }
        }

        val borderPaint = getSquarePaint(Color.BLACK, true)

        for (i in 0..14) {
            for (j in 0..14) {
                canvas.drawRect(75f * i, 75f * j, (75f * i) + 75f, (75f * j) + 75f, borderPaint)
            }
        }

        val theFirstMove = firstMove?.copy()
        if (theFirstMove != null) {
            if (!theFirstMove.isDestroy) {
                drawFirstMove(theFirstMove, canvas)
            }
        }

        boardView.holder.unlockCanvasAndPost(canvas)
    }

    private fun drawFirstMove(theFirstMove: FirstMove, canvas: Canvas) {
        val width = 75f
        val halfWidth = width / 2

        val path = Path()
        val paint = Paint()

        val x = theFirstMove.x + 0.5f
        val y = theFirstMove.y + 0.5f

        paint.color = resources.getColor(R.color.first_move_color)

        path.moveTo(x * 75f, ((y * 75f) + halfWidth))

        path.lineTo(((x * 75f) - halfWidth), y * 75f)

        path.lineTo(x * 75f, ((y * 75f) - halfWidth))

        path.lineTo(((x * 75f) + halfWidth), y * 75f)

        path.lineTo(x * 75f, ((y * 75f) + halfWidth))

        path.close()

        canvas.drawPath(path, paint)
    }

    private fun drawSquare(canvas: Canvas, x: Int, y: Int, tile: Tile) {
        when (true) {
            (tile.letterMultiplicator == 2) -> drawSquareLetterMult(canvas, x, y, 2)
            (tile.letterMultiplicator == 3) -> drawSquareLetterMult(canvas, x, y, 3)
            (tile.wordMultiplicator == 2) -> drawSquareWordMult(canvas, x, y, 2)
            (tile.wordMultiplicator == 3) -> drawSquareWordMult(canvas, x, y, 3)
            else -> drawEmptySquare(canvas, x, y)
        }
    }

    private fun drawEmptySquare(canvas: Canvas, x: Int, y: Int) {
        val squarePaint = getSquarePaint(colors.BACKGROUND_COLOR)
        canvas.drawRect(75f * x, 75f * y, (75f * x) + 75f, (75f * y) + 75f, squarePaint)
    }

    private fun drawSquareWordMult(canvas: Canvas, x: Int, y: Int, mult: Int) {
        val textPaint = getTextPaint()

        val squarePaint = when (mult) {
            2 -> getSquarePaint(colors.DOUBLE_BONUS_WORD_COLOR)
            else -> getSquarePaint(colors.TRIPLE_BONUS_WORD_COLOR)
        }

        val lang = app.langHandler.getLang()

        val text: String = if (lang == Lang.FR) {
            "MOT"
        } else {
            "WORD"
        }
        val textMult = "x$mult"

        canvas.drawRect(75f * x, 75f * y, (75f * x) + 75f, (75f * y) + 75f, squarePaint)
        if (text == "MOT") {
            canvas.drawText(text, 14f + (75f * x), 40f + (75f * y), textPaint)
        } else {
            canvas.drawText(text, 8f + (75f * x), 40f + (75f * y), textPaint)
        }
        canvas.drawText(textMult, 25f + (75f * x), 60f + (75f * y), textPaint)

    }

    private fun drawSquareLetterMult(canvas: Canvas, x: Int, y: Int, mult: Int) {
        val textPaint = getTextPaint()

        val squarePaint = when (mult) {
            2 -> getSquarePaint(colors.DOUBLE_BONUS_LETTER_COLOR)
            else -> getSquarePaint(colors.TRIPLE_BONUS_LETTER_COLOR)
        }

        val lang = app.langHandler.getLang()

        val text: String = if (lang == Lang.FR) {
            "LETTRE"
        } else {
            "LETTER"
        }
        val textMult = "x$mult"

        canvas.drawRect(75f * x, 75f * y, (75f * x) + 75f, (75f * y) + 75f, squarePaint)
        canvas.drawText(text, 75f * x, 40f + (75f * y), textPaint)
        canvas.drawText(textMult, 25f + (75f * x), 60f + (75f * y), textPaint)
    }

    private fun drawLetter(canvas: Canvas, x: Int, y: Int, char: String, value: Int) {
        val textPaint = getTextPaint(isLetter = true)
        canvas.drawBitmap(scaledBitmap, 75f * x, 75f * y, null)
        canvas.drawText(char, 30f + (75f * x), 40f + (75f * y), textPaint)
        if (value > 9) {
            canvas.drawText(value.toString(), 30f + (75f * x), 75f + (75f * y), textPaint)
        } else {
            canvas.drawText(value.toString(), 50f + (75f * x), 75f + (75f * y), textPaint)
        }
    }


    private fun getSquarePaint(color: Int, isBorder: Boolean = false): Paint {
        val paint = Paint()
        paint.color = color

        paint.style = Paint.Style.FILL

        if (isBorder) {
            paint.style = Paint.Style.STROKE
            paint.strokeWidth = 2f
        }

        return paint
    }

    private fun getTextPaint(isLetter: Boolean = false): Paint {
        val paint = Paint()

        if (isLetter) {
            paint.color = Color.BLACK
            paint.textSize = 40f
        } else {
            paint.color = Color.WHITE
            paint.textSize = 20f
        }
        paint.textAlign = Paint.Align.LEFT
        return paint
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            buttonPass.text = resources.getString(R.string.passer_fr)
            buttonPlace.text = resources.getString(R.string.placer_fr)
            buttonCancel.text = resources.getString(R.string.annuler_fr)
            buttonResign.text = resources.getString(R.string.abandonner_fr)
            buttonExchange.text = resources.getString(R.string.echanger_fr)
            observePlayerButtons.forEach { it.text = resources.getString(R.string.observer_fr) }
        } else {
            buttonPass.text = resources.getString(R.string.passer_en)
            buttonPlace.text = resources.getString(R.string.placer_en)
            buttonCancel.text = resources.getString(R.string.annuler_en)
            buttonResign.text = resources.getString(R.string.abandonner_en)
            buttonExchange.text = resources.getString(R.string.echanger_en)
            observePlayerButtons.forEach { it.text = resources.getString(R.string.observer_en) }
        }
    }
}
