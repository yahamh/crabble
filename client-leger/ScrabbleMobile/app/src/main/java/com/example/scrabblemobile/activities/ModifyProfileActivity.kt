package com.example.scrabblemobile.activities

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.personalization.Lang
import kotlinx.coroutines.launch

class ModifyProfileActivity : AppCompatActivity() {
    private lateinit var app: CrabblApplication

    private lateinit var editTextNewUsername: EditText
    private lateinit var confirmButton: Button

    private lateinit var invalidNameHint: TextView
    private lateinit var sameNameHint: TextView
    private lateinit var textTitle: TextView

    private var isNameValid = false


    override fun onCreate(savedInstanceState: Bundle?) {
        app = application as CrabblApplication

        app.themeHandler.changeTheme(this)

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_modify_profile)

        editTextNewUsername = findViewById(R.id.edit_text_change_username)
        confirmButton = findViewById(R.id.button_change_username)

        invalidNameHint = findViewById(R.id.text_hint_invalid_new_name)
        sameNameHint = findViewById(R.id.text_hint_same_name)
        textTitle = findViewById(R.id.text_view_modifier_nom)

        confirmButton.setOnClickListener { editUsername() }

        listenName()
        translate()
    }

    private fun enableButton() {
        confirmButton.isEnabled = isNameValid
    }

    private fun listenName() {
        editTextNewUsername.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
            }

            override fun onTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
            }

            override fun afterTextChanged(s: Editable) {
                val name = s.toString()

                if ((name.length < 3 || name.length > 16)) {
                    if (name.isNotEmpty()) {
                        invalidNameHint.visibility = View.VISIBLE
                        sameNameHint.visibility = View.INVISIBLE
                    } else {
                        invalidNameHint.visibility = View.INVISIBLE
                    }
                    isNameValid = false
                } else if (name == app.accountHandler.getLoginPreferences().username) {
                    isNameValid = false
                    sameNameHint.visibility = View.VISIBLE
                    invalidNameHint.visibility = View.INVISIBLE
                } else {
                    sameNameHint.visibility = View.INVISIBLE
                    invalidNameHint.visibility = View.INVISIBLE
                    isNameValid = true
                }
                enableButton()
            }

        })
    }

    private fun editUsername() {
        lifecycleScope.launch {
            val isModified = app.accountHandler.changeUsername(
                app.accountHandler.getLoginPreferences(),
                editTextNewUsername.text.toString()
            )
            showDialogSignIn(isModified)
        }
    }

    private fun showDialogSignIn(isModified: Boolean) {
        val builder = AlertDialog.Builder(this)

        val successMessage: String
        val failMessage: String

        if (app.langHandler.getLang() == Lang.FR) {
            successMessage = "Nom d'utilisateur modifié avec succès !"
            failMessage = "Impossible de modifier le nom d'utilisateur !"
        } else {
            successMessage = "Username successfully changed !"
            failMessage = "Error encountered while changing username !"
        }

        if (isModified) {
            builder.setMessage(successMessage)
        } else {
            builder.setMessage(failMessage)
        }

        builder.setNeutralButton("OK") { _, _ ->
            editTextNewUsername.text.clear()
        }

        val alertDialog: AlertDialog = builder.create()
        alertDialog.setCancelable(false)
        alertDialog.show()
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textTitle.text = resources.getString(R.string.modifier_pseudo_fr)
            editTextNewUsername.hint = resources.getString(R.string.nouveau_nom_fr)
            invalidNameHint.text = resources.getString(R.string.sign_in_hint_fr)
            sameNameHint.text = resources.getString(R.string.nouveau_nom_invalide_fr)
            confirmButton.text = resources.getString(R.string.confirmer_fr)
        } else {
            textTitle.text = resources.getString(R.string.modifier_pseudo_en)
            editTextNewUsername.hint = resources.getString(R.string.nouveau_nom_en)
            invalidNameHint.text = resources.getString(R.string.sign_in_hint_en)
            sameNameHint.text = resources.getString(R.string.nouveau_nom_invalide_en)
            confirmButton.text = resources.getString(R.string.confirmer_en)
        }
    }
}

