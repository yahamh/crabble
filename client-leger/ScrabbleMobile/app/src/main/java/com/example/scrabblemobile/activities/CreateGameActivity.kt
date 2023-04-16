package com.example.scrabblemobile.activities

import android.content.Intent
import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.CheckBox
import android.widget.TextView
import com.example.scrabblemobile.R
import android.widget.EditText
import android.widget.ImageView
import android.widget.SeekBar
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.game.game.card.CardType
import com.example.scrabblemobile.classes.game.game.gameSettings.GameSettings
import com.example.scrabblemobile.classes.game.game.gameSettings.GameSettingsUI
import com.example.scrabblemobile.classes.game.game.gameState.GameMode
import com.example.scrabblemobile.classes.personalization.Lang
import com.example.scrabblemobile.classes.personalization.Theme


class CreateGameActivity : AppCompatActivity() {
    private lateinit var buttonOpenRoom: Button
    private lateinit var textViewTimer: TextView
    private lateinit var textViewCreateGame: TextView
    private lateinit var seekBarTimer: SeekBar
    private lateinit var checkBoxPrivate: CheckBox
    private lateinit var editPassword: EditText
    private lateinit var cardViews: Array<ImageView>
    private lateinit var textViewCardsIndicator: TextView

    private var timer = 60000
    private var isPrivate = false
    private var cards = Array(8) { false }


    private lateinit var app: CrabblApplication

    override fun onCreate(savedInstanceState: Bundle?) {
        app = application as CrabblApplication

        app.themeHandler.changeTheme(this)

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_game)

        buttonOpenRoom = findViewById(R.id.button_ouvrir_salle)
        textViewCreateGame = findViewById(R.id.text_view_creer_partie)
        textViewTimer = findViewById(R.id.textView_timer)
        seekBarTimer = findViewById(R.id.seekBar_timer)
        checkBoxPrivate = findViewById(R.id.checkBox_prive)
        editPassword = findViewById(R.id.editPassword)
        cardViews = arrayOf(
            findViewById(R.id.imageView11),
            findViewById(R.id.imageView12),
            findViewById(R.id.imageView13),
            findViewById(R.id.imageView14),
            findViewById(R.id.imageView15),
            findViewById(R.id.imageView16),
            findViewById(R.id.imageView17),
            findViewById(R.id.imageView18),
        )
        textViewCardsIndicator = findViewById(R.id.textView_cardsIndicator)
        setListeners()
        translate()

        if (app.themeHandler.getTheme() == Theme.DARK) {
            checkBoxPrivate.setTextColor(Color.WHITE)
        }
    }

    private fun setListeners() {
        buttonOpenRoom.setOnClickListener { openRoom() }

        seekBarTimer.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(p0: SeekBar?, time: Int, p2: Boolean) {
                timer = time * 30000
                val timerInMins: Int = timer / 1000 / 60
                val timerInSecs: Int = (timer / 1000) % 60
                val timerInSecsString: String =
                    if (timerInSecs == 0) "00" else timerInSecs.toString()
                changeTimerText(timerInMins, timerInSecsString)
            }

            override fun onStartTrackingTouch(p0: SeekBar?) {
            }

            override fun onStopTrackingTouch(p0: SeekBar?) {
            }
        })
        checkBoxPrivate.setOnClickListener {
            isPrivate = checkBoxPrivate.isChecked
            editPassword.visibility = if (!isPrivate) View.VISIBLE else View.GONE
        }
        for (i in cardViews.indices) {
            cardViews[i].setOnClickListener { updateCard(i) }
        }
    }

    private fun openRoom() {
        var gameId = ""

        app.gameSettings = GameSettings(
            if (fixCards().isEmpty()) GameMode.Classic.id else GameMode.Power.id,
            timer,
            arrayOf(app.accountHandler.getUsername()),
            false,
            "Mon dictionnaire",
            isPrivate,
            editPassword.text.toString(),
            gameId,
            arrayOf(),
            fixCards(),
        )

        app.newGameSocketHandler.createGameMulti(
            GameSettingsUI(
                if (fixCards().isEmpty()) GameMode.Classic.id else GameMode.Power.id,
                timer, // en ms
                arrayOf(app.accountHandler.getUsername()),
                false,
                "Mon dictionnaire",
                isPrivate,
                editPassword.text.toString(),
                fixCards(),
            )
        )
        app.host = true

        startWaitingRoomActivity()
    }

    private fun startWaitingRoomActivity() {
        val waitingRoomActivity = Intent(this, WaitingRoomActivity::class.java)
        startActivity(waitingRoomActivity)
    }

    private fun updateCard(cardRank: Int) {
        val lang = app.langHandler.getLang()

        cards[cardRank] = !cards[cardRank]
        cardViews[cardRank].alpha = if (cards[cardRank]) 1f else 0.5f

        val cardsEffects = if (lang == Lang.FR) {
            resources.getStringArray(R.array.cartes_fr)
        } else {
            resources.getStringArray(R.array.cartes_en)
        }

        textViewCardsIndicator.text = cardsEffects[cardRank]

        if (fixCards().size == 1 && fixCards()[0] == CardType.Joker.id) {
            cards[CardType.Joker.id] = !cards[CardType.Joker.id]
            cardViews[CardType.Joker.id].alpha = 0.5f
        }
    }

    private fun fixCards(): Array<Int> {
        var fixedCards = arrayOf<Int>()
        for (i in cards.indices) {
            if (cards[i]) {
                fixedCards += i
            }
        }
        return fixedCards
    }

    private fun changeTimerText(minutes: Int, seconds: String) {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textViewTimer.text = resources.getString(R.string.temps_tour_fr, minutes, seconds)
        } else {
            textViewTimer.text = resources.getString(R.string.temps_tour_en, minutes, seconds)
        }
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textViewCreateGame.text = resources.getString(R.string.creer_partie_fr)
            textViewCardsIndicator.text = resources.getString(R.string.indicateur_cartes_fr)
            checkBoxPrivate.text = resources.getString(R.string.partie_prive_fr)
            editPassword.hint = resources.getString(R.string.mot_de_passe_fr)
            buttonOpenRoom.text = resources.getString(R.string.ouvrir_partie_fr)
            textViewTimer.text = resources.getString(R.string.temps_tour_fr, 1, "00")
        } else {
            textViewCreateGame.text = resources.getString(R.string.creer_partie_en)
            textViewCardsIndicator.text = resources.getString(R.string.indicateur_cartes_en)
            checkBoxPrivate.text = resources.getString(R.string.partie_prive_en)
            editPassword.hint = resources.getString(R.string.mot_de_passe_en)
            buttonOpenRoom.text = resources.getString(R.string.ouvrir_partie_en)
            textViewTimer.text = resources.getString(R.string.temps_tour_en, 1, "00")
        }
    }
}
