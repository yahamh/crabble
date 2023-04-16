package com.example.scrabblemobile.activities

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.TextView
import androidx.core.view.children
import androidx.gridlayout.widget.GridLayout
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.game.game.Game
import com.example.scrabblemobile.classes.game.game.board.Letter
import com.example.scrabblemobile.classes.game.views.LetterView
import com.example.scrabblemobile.classes.personalization.Lang

class OptionSwapLetterFragment : Fragment() {

    private lateinit var playerLetterGrid: GridLayout
    private lateinit var bagLetterGrid: GridLayout

    private lateinit var fromRack: Letter
    private lateinit var fromBag: Letter

    private lateinit var textViewChoose: TextView
    private lateinit var textViewChooseGet: TextView
    private lateinit var errorView: TextView

    private lateinit var app: CrabblApplication

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_option_swap_letter, container, false)

        app = requireActivity().application as CrabblApplication

        textViewChoose = view.findViewById(R.id.text_view_swap_choose_letter)
        textViewChooseGet = view.findViewById(R.id.text_view_swap_choose_letter_get)

        playerLetterGrid = view.findViewById(R.id.playerLetters)
        bagLetterGrid = view.findViewById(R.id.bagLetters)
        errorView = view.findViewById(R.id.error)

        translate()

        return view
    }

    fun reinitLetters(game: Game) {

        val player = game.players.find { p -> p.name == game.userName }!!
        errorView.visibility = if(game.lettersRemaining == 0) View.VISIBLE else View.GONE


        for ((index, letter) in player.letterRack.withIndex()) {

            val inflater = LayoutInflater.from(requireContext())
            val letterLayout =
                inflater.inflate(R.layout.scrabble_tile_item, playerLetterGrid) as GridLayout

            val frameLayout = letterLayout.getChildAt(letterLayout.childCount - 1) as FrameLayout
            val letterView = frameLayout.getChildAt(0) as LetterView
            letterView.letter = letter

            if (index == 0) {
                frameLayout.alpha = 1f
                fromRack = letter
            } else {
                frameLayout.alpha = .7f
            }

            frameLayout.setOnClickListener {
                playerLetterGrid.children.forEach { v -> v.alpha = .7f }
                playerLetterGrid.getChildAt(index).alpha = 1f
                fromRack = letter
            }

        }

        var letterUsed: Array<String> = arrayOf()
        for ((index, letter) in game.letterList.withIndex()) {

            if (letterUsed.find { v -> v == letter.char } != null) {
                continue
            }

            val inflater = LayoutInflater.from(requireContext())
            val letterLayout =
                inflater.inflate(R.layout.scrabble_tile_item, bagLetterGrid) as GridLayout

            val frameLayout = letterLayout.getChildAt(letterLayout.childCount - 1) as FrameLayout
            val letterView = frameLayout.getChildAt(0) as LetterView
            letterView.letter = letter

            if (index == 0) {
                frameLayout.alpha = 1f
                fromBag = letter
            } else {
                frameLayout.alpha = .7f
            }

            val currentIndex = letterUsed.size

            frameLayout.setOnClickListener {
                bagLetterGrid.children.forEach { v -> v.alpha = .7f }
                bagLetterGrid.getChildAt(currentIndex).alpha = 1f
                fromBag = letter
            }

            letterUsed += letter.char
        }


    }

    fun getLetterFromRack(): Letter {
        return fromRack
    }

    fun getLetterFromBag(): Letter {
        return fromBag
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textViewChoose.text = resources.getString(R.string.selectione_lettre_fr)
            textViewChooseGet.text = resources.getString(R.string.selectione_lettre_recup_fr)
            errorView.text = resources.getString(R.string.no_more_letters_fr)
        } else {
            textViewChoose.text = resources.getString(R.string.selectione_lettre_en)
            textViewChooseGet.text = resources.getString(R.string.selectione_lettre_recup_en)
            errorView.text = resources.getString(R.string.no_more_letters_en)
        }
    }

}
