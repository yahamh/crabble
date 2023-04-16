package com.example.scrabblemobile.activities

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.*
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.game.game.Game
import com.example.scrabblemobile.classes.game.game.card.CardType
import com.example.scrabblemobile.classes.game.game.gameState.Player
import com.example.scrabblemobile.classes.personalization.Lang

class CardsFragment : Fragment() {

    private var cardViews: Array<ImageView> = arrayOf()

    private lateinit var textViewDescription: TextView
    private lateinit var textViewTitle: TextView

    private lateinit var backButton: Button
    private lateinit var confirmButton: Button

    private lateinit var optionFragmentContainer: FragmentContainerView

    private lateinit var observerError: TextView

    private var selectedCard: Int = 0

    private var currentFragment: Fragment? = null

    private var canPlayCard: Boolean = true
    private var buttonEnable: Boolean = true

    private lateinit var app: CrabblApplication

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_cards, container, false)
        app = requireActivity().application as CrabblApplication

        cardViews += view.findViewById<ImageView>(R.id.card1CardFragment)
        cardViews += view.findViewById<ImageView>(R.id.card2CardFragment)
        cardViews += view.findViewById<ImageView>(R.id.card3CardFragment)

        textViewDescription = view.findViewById(R.id.text_view_description_cards_fragment)
        textViewTitle = view.findViewById(R.id.text_view_fragment_cards)

        backButton = view.findViewById(R.id.backCardFragment)
        confirmButton = view.findViewById(R.id.useCardCardFragment)

        optionFragmentContainer = view.findViewById(R.id.optionFragmentContainer)
        observerError = view.findViewById(R.id.observerError)

        translate()

        return view
    }

    fun reinitCards(game: Game, observedUsername: String, onCancel: () -> Unit) {
        val lang = app.langHandler.getLang()
        backButton.setOnClickListener {
            onCancel()
        }

        val player = game.players.find { p -> p.name == observedUsername }!!

        if (player.cards.isEmpty()) {
            if (lang == Lang.FR) {
                textViewDescription.text = resources.getString(R.string.aucune_carte_fr)
            } else {
                textViewDescription.text = resources.getString(R.string.aucune_carte_en)
            }
            changeButtonState(false)
        } else {
            if (lang == Lang.FR) {
                textViewDescription.text =
                    resources.getStringArray(R.array.cartes_fr)[player.cards[0].id]
            } else {
                textViewDescription.text =
                    resources.getStringArray(R.array.cartes_en)[player.cards[0].id]
            }
            selectedCard = 0
            cardViews.forEach { v ->
                v.scaleX = .8f
                v.scaleY = .8f
            }
            cardViews[selectedCard].scaleX = 1f
            cardViews[selectedCard].scaleY = 1f
            if (!game.observe) {
                changeButtonState(true)

                confirmButton.setOnClickListener {
                    useCard(game, player.cards[selectedCard], onCancel)
                }

                selectFragment(player, selectedCard, game)

                observerError.visibility = View.INVISIBLE
            } else {
                changeButtonState(false)

                observerError.visibility = View.VISIBLE
            }
        }

        for (i in cardViews.indices) {
            if (i <= player.cards.size - 1) {
                cardViews[i].visibility = View.VISIBLE
                cardViews[i].setImageResource(when(player.cards[i]) {
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
                    if (lang == Lang.FR) {
                        textViewDescription.text =
                            resources.getStringArray(R.array.cartes_fr)[player.cards[i].id]
                    } else {
                        textViewDescription.text =
                            resources.getStringArray(R.array.cartes_en)[player.cards[i].id]
                    }
                    cardViews.forEach { v ->
                        v.scaleX = .8f
                        v.scaleY = .8f
                    }
                    it.scaleX = 1f
                    it.scaleY = 1f
                    selectedCard = i

                    if (!game.observe) {
                        changeButtonState(true)
                        selectFragment(player, i, game)
                    }
                }

            } else {
                cardViews[i].visibility = View.GONE
            }
        }

    }

    fun changeTurnState(value: Boolean) {
        canPlayCard = value
        confirmButton.isEnabled = canPlayCard && buttonEnable
    }

    private fun changeButtonState(value: Boolean) {
        buttonEnable = value
        confirmButton.isEnabled = canPlayCard && buttonEnable
    }

    private fun selectFragment(player: Player, i: Int, game: Game) {
        when (player.cards[i]) {
            CardType.TransformTile -> {
                requireActivity().supportFragmentManager.commit {
                    setReorderingAllowed(true)
                    replace<OptionTransformTileFragment>(R.id.optionFragmentContainer)
                }

                requireActivity().supportFragmentManager.executePendingTransactions()

                currentFragment =
                    requireActivity().supportFragmentManager.findFragmentById(R.id.optionFragmentContainer)
                (currentFragment as OptionTransformTileFragment).reinitPositions(game) { x, y ->
                    val tile = game.board.grid[y][x]
                    changeButtonState(tile.letterObject.char == " " && tile.letterMultiplicator == 1 && tile.wordMultiplicator == 1)
                    (currentFragment as OptionTransformTileFragment).error(!(tile.letterObject.char == " " && tile.letterMultiplicator == 1 && tile.wordMultiplicator == 1))
                }
            }
            CardType.SwapLetter -> {
                requireActivity().supportFragmentManager.commit {
                    setReorderingAllowed(true)
                    replace<OptionSwapLetterFragment>(R.id.optionFragmentContainer)
                }

                requireActivity().supportFragmentManager.executePendingTransactions()

                currentFragment =
                    requireActivity().supportFragmentManager.findFragmentById(R.id.optionFragmentContainer)
                (currentFragment as OptionSwapLetterFragment).reinitLetters(game)
                changeButtonState(game.lettersRemaining > 0)
            }
            CardType.SwapRack -> {
                requireActivity().supportFragmentManager.commit {
                    setReorderingAllowed(true)
                    replace<OptionSwapRackFragment>(R.id.optionFragmentContainer)
                }

                requireActivity().supportFragmentManager.executePendingTransactions()

                currentFragment =
                    requireActivity().supportFragmentManager.findFragmentById(R.id.optionFragmentContainer)
                (currentFragment as OptionSwapRackFragment).reinitNames(game)
            }
            CardType.Steal -> {
                requireActivity().supportFragmentManager.commit {
                    setReorderingAllowed(true)
                    replace<OptionBlankFragment>(R.id.optionFragmentContainer)
                }
            }
            CardType.PassTurn -> {
                requireActivity().supportFragmentManager.commit {
                    setReorderingAllowed(true)
                    replace<OptionBlankFragment>(R.id.optionFragmentContainer)
                }
            }
            CardType.Joker -> {
                requireActivity().supportFragmentManager.commit {
                    setReorderingAllowed(true)
                    replace<OptionJokerFragment>(R.id.optionFragmentContainer)
                }

                requireActivity().supportFragmentManager.executePendingTransactions()

                currentFragment =
                    requireActivity().supportFragmentManager.findFragmentById(R.id.optionFragmentContainer)
                (currentFragment as OptionJokerFragment).reinitCards(game)
            }
            CardType.RemoveTime -> {
                requireActivity().supportFragmentManager.commit {
                    setReorderingAllowed(true)
                    replace<OptionBlankFragment>(R.id.optionFragmentContainer)
                }
            }
            CardType.Points -> {
                requireActivity().supportFragmentManager.commit {
                    setReorderingAllowed(true)
                    replace<OptionBlankFragment>(R.id.optionFragmentContainer)
                }
            }
        }
    }

    private fun useCard(game: Game, id: CardType, onCancel: () -> Unit) {
        when (id) {
            CardType.Points -> {
                game.playCardPoints()
                onCancel()
            }
            CardType.RemoveTime -> {
                game.playCardRemoveTime()
                onCancel()
            }
            CardType.PassTurn -> {
                game.playCardPass()
                onCancel()
            }
            CardType.Steal -> {
                game.playCardCommunism()
                onCancel()
            }
            CardType.SwapRack -> {
                val name = (currentFragment as OptionSwapRackFragment).getSelectedName()

                game.playCardSwapRack(name)
                onCancel()
            }
            CardType.Joker -> {
                val card = (currentFragment as OptionJokerFragment).getSelectedCard()

                game.playCardJoker(card)
                onCancel()
            }
            CardType.SwapLetter -> {
                val fromRack = (currentFragment as OptionSwapLetterFragment).getLetterFromRack()
                val fromBag = (currentFragment as OptionSwapLetterFragment).getLetterFromBag()

                game.playCardSwapLetter(fromRack, fromBag)
                onCancel()
            }
            CardType.TransformTile -> {
                val x = (currentFragment as OptionTransformTileFragment).getX()
                val y = (currentFragment as OptionTransformTileFragment).getY()

                game.playCardTransmutation(x, y)
                onCancel()
            }
        }
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textViewTitle.text = resources.getString(R.string.fragment_cards_titre_fr)
            backButton.text = resources.getString(R.string.retour_fr)
            confirmButton.text = resources.getString(R.string.confirmer_fr)
        } else {
            textViewTitle.text = resources.getString(R.string.fragment_cards_titre_en)
            backButton.text = resources.getString(R.string.retour_en)
            confirmButton.text = resources.getString(R.string.confirmer_en)
        }
    }
}
