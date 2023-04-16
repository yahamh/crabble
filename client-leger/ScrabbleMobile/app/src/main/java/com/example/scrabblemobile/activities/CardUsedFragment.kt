package com.example.scrabblemobile.activities

import android.animation.ObjectAnimator
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
import com.example.scrabblemobile.classes.game.game.card.CardAction
import com.example.scrabblemobile.classes.game.game.card.CardType
import com.example.scrabblemobile.classes.personalization.Lang

class CardUsedFragment : Fragment() {

    private lateinit var containerView: CardView
    private lateinit var imageView: ImageView
    private lateinit var descriptionView: TextView

    private lateinit var app: CrabblApplication

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        val view = inflater.inflate(R.layout.fragment_card_used, container, false)

        app = requireActivity().application as CrabblApplication

        containerView = view.findViewById(R.id.card_used_container)
        imageView = view.findViewById(R.id.image_card_used)
        descriptionView = view.findViewById(R.id.description_card_used)

        containerView.translationX = 900f

        return view
    }

    fun cardUsed(cardAction: CardAction) {
        val lang = app.langHandler.getLang()
        val used: String
        val chose: String
        val bonus: String
        val pass: String
        val lessTime: String
        val contre: String
        val losePoints: String
        val everyoneGets: String
        val gave: String
        val gets: String
        val tile: String
        val becomes: String
        val word: String
        val letter: String
        val arrayId: Int

        if (lang == Lang.FR) {
            used = "a utilisé"
            chose = "et a choisi"
            bonus = "points bonus!"
            pass = "passe son tour!"
            lessTime = "Les autres joueurs auront moins de temps!"
            contre = "contre"
            losePoints = "perd tous ses points!"
            everyoneGets = "Tout le monde récupère"
            gave = "a donné"
            gets = "et récupère"
            tile = "La tuile"
            becomes = "devient"
            word = "mot"
            letter = "lettre"
            arrayId = R.array.cartes_titre_fr
        } else {
            used = "used"
            chose = "and chose"
            bonus = "bonus points!"
            pass = "passes their turn!"
            lessTime = "Other players will have less time!"
            contre = "for"
            losePoints = "loses all their points!"
            everyoneGets = "Everyone gets"
            gave = "gave"
            gets = "and gets"
            tile = "The tile"
            becomes = "becomes"
            word = "word"
            letter = "letter"
            arrayId = R.array.cartes_titre_en
        }
        descriptionView.text = when (CardType.getById(cardAction.card)) {
            CardType.Joker -> "${cardAction.user} $used ${resources.getStringArray(arrayId)[cardAction.card]}\n$chose ${
                resources.getStringArray(
                    arrayId
                )[cardAction.cardChoice!!]
            }"
            CardType.Points -> "${cardAction.user} $used ${resources.getStringArray(arrayId)[cardAction.card]}\n${cardAction.bonusPoints!!} $bonus"
            CardType.PassTurn -> "${cardAction.user} $used ${resources.getStringArray(arrayId)[cardAction.card]}\n${cardAction.turnPassedOf!!} $pass"
            CardType.RemoveTime -> "${cardAction.user} $used ${resources.getStringArray(arrayId)[cardAction.card]}\n$lessTime"
            CardType.Steal -> "${cardAction.user} $used ${resources.getStringArray(arrayId)[cardAction.card]}\n${
                cardAction.bestPlayers!!.joinToString(
                    ", "
                )
            } $losePoints\n$everyoneGets ${cardAction.pointsForEach}!"
            CardType.SwapRack -> "${cardAction.user} $used ${resources.getStringArray(arrayId)[cardAction.card]} $contre ${cardAction.playerToSwap!!}"
            CardType.SwapLetter -> "${cardAction.user} $used ${resources.getStringArray(arrayId)[cardAction.card]}\n${cardAction.user} $gave ${cardAction.letterFromRack!!.char} $gets ${cardAction.letterToGet!!.char}!"
            CardType.TransformTile -> "${cardAction.user} $used ${resources.getStringArray(arrayId)[cardAction.card]}\n$tile ${(cardAction.tileToTransformY!! + 65).toChar()}${cardAction.tileToTransformX!!} $becomes x${if (cardAction.letterMultiplicator != null) cardAction.letterMultiplicator!! else cardAction.wordMultiplicator!!} ${if (cardAction.letterMultiplicator != null) letter else word}!"
        }
        imageView.setImageResource(when(CardType.getById(cardAction.card)) {
            CardType.TransformTile -> R.drawable.transmutation
            CardType.SwapLetter -> R.drawable.echange
            CardType.SwapRack -> R.drawable.vol
            CardType.Steal -> R.drawable.communisme
            CardType.RemoveTime -> R.drawable.plus_rapide
            CardType.PassTurn -> R.drawable.interdiction
            CardType.Points -> R.drawable.bonus
            CardType.Joker -> R.drawable.joker
        })

        ObjectAnimator.ofFloat(containerView, "translationX", 0f).apply {
            duration = 300
            start()
        }

        ObjectAnimator.ofFloat(containerView, "translationX", 900f).apply {
            duration = 300
            startDelay = 3300
            start()
        }
    }
}
