package com.example.scrabblemobile.activities

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.RadioButton
import android.widget.TextView
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.game.game.Game
import com.example.scrabblemobile.classes.personalization.Lang

class OptionSwapRackFragment : Fragment() {

    private var radioButtons: Array<RadioButton> = arrayOf()
    private var selection: Int = 0

    private lateinit var textViewChoose: TextView

    private lateinit var app: CrabblApplication

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_option_swap_rack, container, false)

        app = requireActivity().application as CrabblApplication

        textViewChoose = view.findViewById(R.id.text_view_modifier_nom)

        radioButtons += view.findViewById<RadioButton>(R.id.playerRack1)
        radioButtons += view.findViewById<RadioButton>(R.id.playerRack2)
        radioButtons += view.findViewById<RadioButton>(R.id.playerRack3)

        for (i in radioButtons.indices) {
            radioButtons[i].setOnClickListener {
                selection = i
            }
        }

        translate()

        return view
    }

    fun reinitNames(game: Game) {

        val player = game.players.find { p -> p.name == game.userName }!!
        var otherPlayers = game.players.filter { p -> p != player }

        for (i in otherPlayers.indices) {
            radioButtons[i].text = otherPlayers[i].name
        }

    }

    fun getSelectedName(): String {
        return radioButtons[selection].text.toString()
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textViewChoose.text = resources.getString(R.string.selectione_joueur_fr)
        } else {
            textViewChoose.text = resources.getString(R.string.selectione_joueur_en)
        }
    }

}
