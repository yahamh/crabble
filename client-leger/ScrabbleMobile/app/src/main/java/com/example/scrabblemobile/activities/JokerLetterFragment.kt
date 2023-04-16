package com.example.scrabblemobile.activities

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.game.game.board.Letter
import com.example.scrabblemobile.classes.game.views.LetterView
import com.example.scrabblemobile.classes.personalization.Lang


class JokerLetterFragment : Fragment() {
    private lateinit var letterA: LetterView
    private lateinit var letterB: LetterView
    private lateinit var letterC: LetterView
    private lateinit var letterD: LetterView
    private lateinit var letterE: LetterView
    private lateinit var letterF: LetterView
    private lateinit var letterG: LetterView
    private lateinit var letterH: LetterView
    private lateinit var letterI: LetterView
    private lateinit var letterJ: LetterView
    private lateinit var letterK: LetterView
    private lateinit var letterL: LetterView
    private lateinit var letterM: LetterView
    private lateinit var letterN: LetterView
    private lateinit var letterO: LetterView
    private lateinit var letterP: LetterView
    private lateinit var letterQ: LetterView
    private lateinit var letterR: LetterView
    private lateinit var letterS: LetterView
    private lateinit var letterT: LetterView
    private lateinit var letterU: LetterView
    private lateinit var letterV: LetterView
    private lateinit var letterW: LetterView
    private lateinit var letterX: LetterView
    private lateinit var letterY: LetterView
    private lateinit var letterZ: LetterView

    private lateinit var text: TextView

    private lateinit var letterArray: Array<LetterView>

    private lateinit var app: CrabblApplication

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment

        val view = inflater.inflate(R.layout.fragment_joker_letter, container, false)

        app = requireActivity().application as CrabblApplication

        text = view.findViewById(R.id.text_view_joker_letter_title)

        letterA = view.findViewById(R.id.letter_view_a)
        letterB = view.findViewById(R.id.letter_view_b)
        letterC = view.findViewById(R.id.letter_view_c)
        letterD = view.findViewById(R.id.letter_view_d)
        letterE = view.findViewById(R.id.letter_view_e)
        letterF = view.findViewById(R.id.letter_view_f)
        letterG = view.findViewById(R.id.letter_view_g)
        letterH = view.findViewById(R.id.letter_view_h)
        letterI = view.findViewById(R.id.letter_view_i)
        letterJ = view.findViewById(R.id.letter_view_j)
        letterK = view.findViewById(R.id.letter_view_k)
        letterL = view.findViewById(R.id.letter_view_l)
        letterM = view.findViewById(R.id.letter_view_m)
        letterN = view.findViewById(R.id.letter_view_n)
        letterO = view.findViewById(R.id.letter_view_o)
        letterP = view.findViewById(R.id.letter_view_p)
        letterQ = view.findViewById(R.id.letter_view_q)
        letterR = view.findViewById(R.id.letter_view_r)
        letterS = view.findViewById(R.id.letter_view_s)
        letterT = view.findViewById(R.id.letter_view_t)
        letterU = view.findViewById(R.id.letter_view_u)
        letterV = view.findViewById(R.id.letter_view_v)
        letterW = view.findViewById(R.id.letter_view_w)
        letterX = view.findViewById(R.id.letter_view_x)
        letterY = view.findViewById(R.id.letter_view_y)
        letterZ = view.findViewById(R.id.letter_view_z)

        letterA.changeAttributes(Letter("A", 0))
        letterB.changeAttributes(Letter("B", 0))
        letterC.changeAttributes(Letter("C", 0))
        letterD.changeAttributes(Letter("D", 0))
        letterE.changeAttributes(Letter("E", 0))
        letterF.changeAttributes(Letter("F", 0))
        letterG.changeAttributes(Letter("G", 0))
        letterH.changeAttributes(Letter("H", 0))
        letterI.changeAttributes(Letter("I", 0))
        letterJ.changeAttributes(Letter("J", 0))
        letterK.changeAttributes(Letter("K", 0))
        letterL.changeAttributes(Letter("L", 0))
        letterM.changeAttributes(Letter("M", 0))
        letterN.changeAttributes(Letter("N", 0))
        letterO.changeAttributes(Letter("O", 0))
        letterP.changeAttributes(Letter("P", 0))
        letterQ.changeAttributes(Letter("Q", 0))
        letterR.changeAttributes(Letter("R", 0))
        letterS.changeAttributes(Letter("S", 0))
        letterT.changeAttributes(Letter("T", 0))
        letterU.changeAttributes(Letter("U", 0))
        letterV.changeAttributes(Letter("V", 0))
        letterW.changeAttributes(Letter("W", 0))
        letterX.changeAttributes(Letter("X", 0))
        letterY.changeAttributes(Letter("Y", 0))
        letterZ.changeAttributes(Letter("Z", 0))

        letterArray = arrayOf(
            letterA,
            letterB,
            letterC,
            letterD,
            letterE,
            letterF,
            letterG,
            letterH,
            letterI,
            letterJ,
            letterK,
            letterL,
            letterM,
            letterN,
            letterO,
            letterP,
            letterQ,
            letterR,
            letterS,
            letterT,
            letterU,
            letterV,
            letterW,
            letterX,
            letterY,
            letterZ,
        )

        translate()

        return view
    }

    fun initFragment(onChose: (Char) -> Unit) {
        for ((i, letter) in letterArray.withIndex()) {
            letter.setOnClickListener { onChose((i + 65).toChar()) }
        }
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            text.text = resources.getString(R.string.joker_letter_titre_fr)
        } else {
            text.text = resources.getString(R.string.joker_letter_titre_en)
        }
    }
}
