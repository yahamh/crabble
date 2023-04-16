package com.example.scrabblemobile.activities

import android.graphics.Color
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.cardview.widget.CardView
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.game.game.Game
import com.example.scrabblemobile.classes.game.game.card.CardType
import com.example.scrabblemobile.classes.personalization.Lang

class OptionJokerFragment : Fragment() {

    private var cardViews: Array<CardView> = arrayOf()
    private var imageViews: Array<ImageView> = arrayOf()
    private var descriptionViews: Array<TextView> = arrayOf()

    private lateinit var textViewChoose: TextView

    private var selection: Int = 0

    private var cards: Array<CardType> = arrayOf()

    private lateinit var app: CrabblApplication

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_option_joker, container, false)

        app = requireActivity().application as CrabblApplication

        textViewChoose = view.findViewById(R.id.text_view_fragment_choose)

        cardViews += view.findViewById<CardView>(R.id.cardView1)
        cardViews += view.findViewById<CardView>(R.id.cardView2)
        cardViews += view.findViewById<CardView>(R.id.cardView3)
        cardViews += view.findViewById<CardView>(R.id.cardView4)
        cardViews += view.findViewById<CardView>(R.id.cardView5)
        cardViews += view.findViewById<CardView>(R.id.cardView6)
        cardViews += view.findViewById<CardView>(R.id.cardView7)
        cardViews += view.findViewById<CardView>(R.id.cardView8)

        imageViews += view.findViewById<ImageView>(R.id.imageCard1)
        imageViews += view.findViewById<ImageView>(R.id.imageCard2)
        imageViews += view.findViewById<ImageView>(R.id.imageCard3)
        imageViews += view.findViewById<ImageView>(R.id.imageCard4)
        imageViews += view.findViewById<ImageView>(R.id.imageCard5)
        imageViews += view.findViewById<ImageView>(R.id.imageCard6)
        imageViews += view.findViewById<ImageView>(R.id.imageCard7)
        imageViews += view.findViewById<ImageView>(R.id.imageCard8)

        descriptionViews += view.findViewById<TextView>(R.id.imageDescription1)
        descriptionViews += view.findViewById<TextView>(R.id.imageDescription2)
        descriptionViews += view.findViewById<TextView>(R.id.imageDescription3)
        descriptionViews += view.findViewById<TextView>(R.id.imageDescription4)
        descriptionViews += view.findViewById<TextView>(R.id.imageDescription5)
        descriptionViews += view.findViewById<TextView>(R.id.imageDescription6)
        descriptionViews += view.findViewById<TextView>(R.id.imageDescription7)
        descriptionViews += view.findViewById<TextView>(R.id.imageDescription8)

        for (card in cardViews) {
            card.visibility = View.GONE
        }

        translate()

        return view
    }

    fun reinitCards(game: Game) {

        val lang = app.langHandler.getLang()

        cards = game.cardsAvailable.filter { c -> c != CardType.Joker }.toTypedArray()

        cardViews.forEach { c -> c.setCardBackgroundColor(Color.GRAY) }
        cardViews[0].setCardBackgroundColor(Color.rgb(144, 212, 138))

        for (i in cards.indices) {
            cardViews[i].visibility = View.VISIBLE

            if (lang == Lang.FR) {
                descriptionViews[i].text =
                    resources.getStringArray(R.array.cartes_fr)[game.cardsAvailable[i].id]
            } else {
                descriptionViews[i].text =
                    resources.getStringArray(R.array.cartes_en)[game.cardsAvailable[i].id]
            }

            imageViews[i].setImageResource(when(cards[i]) {
                CardType.TransformTile -> R.drawable.transmutation
                CardType.SwapLetter -> R.drawable.echange
                CardType.SwapRack -> R.drawable.vol
                CardType.Steal -> R.drawable.communisme
                CardType.RemoveTime -> R.drawable.plus_rapide
                CardType.PassTurn -> R.drawable.interdiction
                CardType.Points -> R.drawable.bonus
                CardType.Joker -> R.drawable.joker
            })

            cardViews[i].setOnClickListener {
                cardViews.forEach { c -> c.setCardBackgroundColor(Color.GRAY) }
                cardViews[i].setCardBackgroundColor(Color.rgb(144, 212, 138))
                selection = i
            }
        }
    }

    fun getSelectedCard(): CardType {
        return cards[selection]
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textViewChoose.text = resources.getString(R.string.selectione_carte_fr)
        } else {
            textViewChoose.text = resources.getString(R.string.selectione_carte_en)
        }
    }
}
