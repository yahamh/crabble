package com.example.scrabblemobile.activities

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.game.game.board.Letter
import com.example.scrabblemobile.classes.game.views.AdapterLetterHolder
import com.example.scrabblemobile.classes.personalization.Lang
import io.reactivex.rxjava3.disposables.Disposable
import io.reactivex.rxjava3.subjects.PublishSubject

class ExchangeFragment : Fragment() {

    lateinit var confirmButton: Button
    lateinit var cancelButton: Button

    lateinit var textViewTitle: TextView

    lateinit var recyclerViewLetterHolder: RecyclerView
    lateinit var letterRackAdapter: AdapterLetterHolder

    lateinit var letters: String

    var letterTouchedSubscription: Disposable? = null

    var letterRackDataSet: ArrayList<Letter> = ArrayList()

    private lateinit var app: CrabblApplication

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_exchange, container, false)

        app = requireActivity().application as CrabblApplication

        letters = ""

        textViewTitle = view.findViewById(R.id.titleExchangeFragment)

        confirmButton = view.findViewById(R.id.button_echanger_confirmer)
        cancelButton = view.findViewById(R.id.button_echanger_annuler)

        recyclerViewLetterHolder = view.findViewById(R.id.recyler_view_letter_holder_exchange)
        recyclerViewLetterHolder.setHasFixedSize(true)

        val layoutManager =
            LinearLayoutManager(activity, LinearLayoutManager.HORIZONTAL, false)

        recyclerViewLetterHolder.layoutManager = layoutManager

        letterRackAdapter = AdapterLetterHolder(letterRackDataSet, true)

        recyclerViewLetterHolder.adapter = letterRackAdapter

        letterRackAdapter.isLetterTouchedSubject = PublishSubject.create()
        letterTouchedSubscription = letterRackAdapter.isLetterTouchedSubject.subscribe {
            confirmButton.post {
                enableButton(it)
            }
        }

        translate()

        return view
    }

    fun initFragment(letterRack: Array<Letter>, onConfirm: (Boolean) -> Unit) {
        letters = ""
        confirmButton.isEnabled = false
        letterRackAdapter.lettersTouched.clear()
        letterRackAdapter.emptyRack()
        for (letter in letterRack) {
            letterRackDataSet.add(letter.copy())
            letterRackAdapter.notifyItemInserted(letterRackDataSet.size - 1)
        }

        confirmButton.setOnClickListener {
            for (char in letterRackAdapter.lettersTouched) {
                letters += char
            }
            letters.lowercase()
            letterRackAdapter.lettersTouched.clear()
            letterRackAdapter.emptyRack()
            onConfirm(true)
        }

        cancelButton.setOnClickListener {
            letterRackAdapter.lettersTouched.clear()
            letterRackAdapter.emptyRack()
            onConfirm(false)
        }

    }

    private fun enableButton(isValid: Boolean) {
        confirmButton.isEnabled = isValid
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textViewTitle.text = resources.getString(R.string.selectione_fr)
            cancelButton.text = resources.getString(R.string.annuler_fr)
            confirmButton.text = resources.getString(R.string.confirmer_fr)
        } else {
            textViewTitle.text = resources.getString(R.string.selectione_en)
            cancelButton.text = resources.getString(R.string.annuler_en)
            confirmButton.text = resources.getString(R.string.confirmer_en)
        }
    }
}
