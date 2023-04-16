package com.example.scrabblemobile.activities

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.personalization.Lang


class EnterPasswordFragment : Fragment() {

    private lateinit var buttonCancel: Button
    private lateinit var buttonJoin: Button

    private lateinit var editText: EditText

    private lateinit var app: CrabblApplication

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        val view = inflater.inflate(R.layout.fragment_enter_password, container, false)

        app = requireActivity().application as CrabblApplication

        buttonCancel = view.findViewById(R.id.button_annuler_password)
        buttonJoin = view.findViewById(R.id.button_valider_password)

        editText = view.findViewById(R.id.edit_text_password_join)

        translate()

        return view
    }

    fun initFragment(onConfirm: (String, Boolean) -> Unit) {
        buttonCancel.setOnClickListener {
            onConfirm("", false)
        }

        buttonJoin.setOnClickListener {
            onConfirm(editText.text.toString(), true)
        }
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            editText.hint = resources.getString(R.string.mot_de_passe_fr)
            buttonCancel.text = resources.getString(R.string.annuler_fr)
            buttonJoin.text = resources.getString(R.string.rejoindre_cette_partie_fr)
        } else {
            editText.hint = resources.getString(R.string.mot_de_passe_en)
            buttonCancel.text = resources.getString(R.string.annuler_en)
            buttonJoin.text = resources.getString(R.string.rejoindre_cette_partie_en)
        }
    }
}
