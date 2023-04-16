package com.example.scrabblemobile.activities

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.NumberPicker
import android.widget.TextView
import androidx.core.view.isVisible
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.game.game.Game
import com.example.scrabblemobile.classes.personalization.Lang

class OptionTransformTileFragment : Fragment() {
    private lateinit var pickerNumber: NumberPicker
    private lateinit var pickerLetter: NumberPicker

    private lateinit var errorView: TextView
    private lateinit var textViewTitle: TextView

    private lateinit var app: CrabblApplication

    private val letters: Array<String> = arrayOf(
        "A", "B", "C", "D", "E", "F", "G", "H", "I",
        "J", "K", "L", "M", "N", "O"
    )

    private val numbers: Array<String> = arrayOf(
        "01", "02", "03", "04", "05", "06", "07", "08", "09",
        "10", "11", "12", "13", "14", "15"
    )


    private var currentNumber: Int = 0
    private var currentLetter: Int = 0

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        val view = inflater.inflate(R.layout.fragment_option_transform_tile, container, false)

        app = requireActivity().application as CrabblApplication

        pickerLetter = view.findViewById(R.id.picker_position_letter)
        pickerNumber = view.findViewById(R.id.picker_position_number)

        pickerNumber.displayedValues = numbers
        pickerLetter.displayedValues = letters

        pickerLetter.minValue = 0
        pickerLetter.maxValue = 14

        pickerNumber.minValue = 0
        pickerNumber.maxValue = 14

        errorView = view.findViewById(R.id.text_view_position_error)
        textViewTitle = view.findViewById(R.id.text_view_transform_title)

        translate()

        return view
    }

    fun reinitPositions(game: Game, onPosChange: (x: Int, y: Int) -> Unit) {
        onPosChange(currentNumber, currentLetter)

        pickerLetter.setOnValueChangedListener { _, _, _ ->
            currentLetter = pickerLetter.value
            onPosChange(currentNumber, currentLetter)
        }

        pickerNumber.setOnValueChangedListener { _, _, _ ->
            currentNumber = pickerNumber.value
            onPosChange(currentNumber, currentLetter)
        }
    }

    fun error(value: Boolean) {
        errorView.visibility = if (value) View.VISIBLE else View.INVISIBLE
    }

    fun getX(): Int {
        return currentNumber
    }

    fun getY(): Int {
        return currentLetter
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            errorView.text = resources.getString(R.string.position_occupe_fr)
            textViewTitle.text = resources.getString(R.string.selectione_position_fr)
        } else {
            errorView.text = resources.getString(R.string.position_occupe_en)
            textViewTitle.text = resources.getString(R.string.selectione_position_en)
        }
    }
}
