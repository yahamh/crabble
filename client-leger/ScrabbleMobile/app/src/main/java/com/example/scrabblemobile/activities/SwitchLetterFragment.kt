package com.example.scrabblemobile.activities

import android.animation.ObjectAnimator
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.GridLayout
import android.widget.TextView
import androidx.core.view.children
import androidx.core.view.marginLeft
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.game.game.board.Letter
import com.example.scrabblemobile.classes.game.views.LetterView
import com.example.scrabblemobile.classes.personalization.Lang
import java.text.Normalizer
import kotlin.concurrent.schedule
import java.util.*

class SwitchLetterFragment : Fragment() {

    private lateinit var wordList: List<String>
    private lateinit var gridLayout: GridLayout

    private lateinit var titleView: TextView
    private lateinit var scoreView: TextView

    private var baseMargins: Int = 0
    private var currentWord: Array<Letter> = arrayOf()
    private var shuffledWord: Array<Letter> = arrayOf()

    private var maxWordLength: Int = 0

    private var best:Int = 0
    private var score:Int = 0

    private var selected = -1

    private lateinit var app: CrabblApplication

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_switch_letter, container, false)

        app = requireActivity().application as CrabblApplication

        val inputStream = resources.openRawResource(R.raw.fr)

        val b = ByteArray(inputStream.available())
        inputStream.read(b)

        gridLayout = view.findViewById(R.id.letterContainer)
        baseMargins = gridLayout.marginLeft

        maxWordLength = gridLayout.childCount

        wordList = String(b).split("\n").filter { w -> w.length <= maxWordLength }
        inputStream.close()

        titleView = view.findViewById(R.id.title_switch_letter)
        scoreView = view.findViewById(R.id.score_switch_letter)

        titleView.text = resources.getString(if(app.isFr()) R.string.anagram_fr else R.string.anagram_en)
        scoreView.text = if(app.isFr()) "Score: $score ; Meilleur score possible: $best" else "Score: $score ; Best possible: $best"

        randomWord()

        return view
    }

    private fun isWin(): Boolean {
        return arrayToString(currentWord) == arrayToString(shuffledWord)
    }

    private fun updateColors() {
        gridLayout.children.forEachIndexed { index, view ->
            if(index < shuffledWord.size) {
                if (currentWord[index].char == (view as LetterView).letter.char) {
                    view.foreground = ColorDrawable(Color.argb(128, 32, 176, 30))
                } else {
                    view.foreground = null
                }
            }
        }
    }

    private fun randomWord() {
        gridLayout.children.forEach { v ->
            v.visibility = View.GONE
        }

        var wordChoosen = wordList[(wordList.size*Math.random()).toInt()]
        while(wordChoosen.length > maxWordLength) {
            wordChoosen = wordList[(wordList.size*Math.random()).toInt()]
        }

        currentWord = arrayOf()
        shuffledWord = arrayOf()

        wordChoosen.toCharArray().forEach {
            currentWord += Letter(it.toString().uppercase(), getCharValue(it))
            shuffledWord += Letter(it.toString().uppercase(), getCharValue(it))
        }

        do {
            shuffledWord = shuffle(shuffledWord)
        } while (arrayToString(currentWord) == arrayToString(shuffledWord))

        best = calculateBest()
        score = 0
        scoreView.text = if(app.isFr()) "Score: $score ; Meilleur score possible: $best" else "Score: $score ; Best possible: $best"

        gridLayout.children.forEachIndexed { index, view ->
            if(index < shuffledWord.size) {
                (view as LetterView).changeAttributes(shuffledWord[index])
                view.visibility = View.VISIBLE
                view.alpha = 0f

                ObjectAnimator.ofFloat(view, "alpha", 1f).apply {
                    duration = 200
                    startDelay = (100 * index).toLong()
                    start()
                }

                view.setOnClickListener {
                    if(selected == -1) {
                        selected = index
                        it.scaleX = .9f
                        it.scaleY = .9f
                    }
                    else if(selected == index) {
                        selected = -1
                        it.scaleX = 1f
                        it.scaleY = 1f
                    }
                    else {
                        gridLayout.children.toList()[selected].scaleX = 1f
                        gridLayout.children.toList()[selected].scaleY = 1f

                        val indexPosition = IntArray(2)
                        val selectedPosition = IntArray(2)

                        gridLayout.children.toList()[index].getLocationOnScreen(indexPosition)
                        gridLayout.children.toList()[selected].getLocationOnScreen(selectedPosition)

                        val difference = selectedPosition[0] - indexPosition[0]

                        ObjectAnimator.ofFloat(gridLayout.children.toList()[index], "translationX", difference.toFloat()).apply {
                            duration = 200
                            start()
                        }

                        ObjectAnimator.ofFloat(gridLayout.children.toList()[selected], "translationX", -difference.toFloat()).apply {
                            duration = 200
                            start()
                        }

                        Timer().schedule(250) {
                            requireActivity().runOnUiThread {
                                val tempLetter = shuffledWord[selected]
                                shuffledWord[selected] = shuffledWord[index]
                                shuffledWord[index] = tempLetter

                                (gridLayout.children.toList()[selected] as LetterView).changeAttributes(shuffledWord[selected])
                                (gridLayout.children.toList()[index] as LetterView).changeAttributes(shuffledWord[index])

                                gridLayout.children.toList()[index].translationX = 0f
                                gridLayout.children.toList()[selected].translationX = 0f

                                updateColors()
                                selected = -1
                                score++

                                scoreView.text = if(app.isFr()) "Score: $score ; Meilleur score possible: $best" else "Score: $score ; Best possible: $best"

                                if(isWin()) {
                                    gridLayout.children.forEachIndexed { index2, view2 ->
                                        if(index2 < shuffledWord.size) {
                                            ObjectAnimator.ofFloat(view2, "alpha", 0f).apply {
                                                duration = 200
                                                startDelay = 500+(100 * index2).toLong()
                                                start()
                                            }
                                        }
                                    }

                                    Timer().schedule((shuffledWord.size*100+100+500).toLong()) {
                                        requireActivity().runOnUiThread {
                                            randomWord()
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        updateColors()
    }

    private fun calculateBest(): Int {
        var testWord = shuffledWord.copyOf()
        var score = 0
        while(arrayToString(testWord) != arrayToString(currentWord)) {
            var firstJ = -1
            var firstI = -1

            for (i in testWord.indices) {
                if(testWord[i].char != currentWord[i].char) {
                    var j = -1

                    currentWord.forEachIndexed { index, letter ->
                        if(letter.char == testWord[i].char && letter.char != testWord[index].char) {
                            j = index
                            return@forEachIndexed
                        }
                    }

                    if(firstJ == -1) {
                        firstJ = j
                        firstI = i
                    }

                    if(testWord[j].char == currentWord[i].char) {
                        score++
                        val tempLetter = testWord[i]
                        testWord[i] = testWord[j]
                        testWord[j] = tempLetter
                        firstJ = -1
                        firstI = -1
                        break
                    }
                }
            }

            if(firstJ != -1) {
                score++
                val tempLetter = testWord[firstI]
                testWord[firstI] = testWord[firstJ]
                testWord[firstJ] = tempLetter
            }
        }
        return score
    }

    private fun arrayToString(word: Array<Letter>): String {
        return word.map { v -> v.char }.joinToString("")
    }

    private fun shuffle(word: Array<Letter>): Array<Letter> {
        val endWord = word.copyOf()
        for (i in endWord.indices) {
            val j = (Math.random() * endWord.size).toInt()
            val tempLetter = endWord[i]
            endWord[i] = endWord[j]
            endWord[j] = tempLetter
        }
        return endWord
    }

    private fun getCharValue(letter: Char): Int {
        var letterChanged = letter.uppercaseChar().toString()
        Normalizer.normalize(letterChanged, Normalizer.Form.NFD)
        letterChanged.replace(Regex("/[\\u0300-\\u036f]/g"), "")
        return when(letterChanged) {
            "A", "E", "I", "L", "N", "O", "R", "S", "T", "U" -> 1
            "D", "G", "M" -> 2
            "B", "C", "P" -> 3
            "F", "H", "V" -> 4
            "J", "Q" -> 8
            "K", "W", "X", "Y", "Z" -> 10
            else -> 0
        }
    }
}
