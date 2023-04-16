package com.example.scrabblemobile.activities

import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.RadioButton
import android.widget.TextView
import androidx.lifecycle.lifecycleScope
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.account.AccountHandler
import com.example.scrabblemobile.classes.account.Communication
import com.example.scrabblemobile.classes.personalization.Lang
import com.example.scrabblemobile.classes.personalization.Theme
import com.example.scrabblemobile.dataClasses.preferencesClasses.PreferenceSet
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class PreferencesActivity : AppCompatActivity() {
    private lateinit var radioButtonFrench: RadioButton
    private lateinit var radioButtonEnglish: RadioButton

    private lateinit var radioButtonLight: RadioButton
    private lateinit var radioButtonDark: RadioButton

    private lateinit var textViewPreferences: TextView
    private lateinit var textViewLanguage: TextView
    private lateinit var textViewTheme: TextView

    private lateinit var app: CrabblApplication

    private lateinit var communication: Communication

    private lateinit var accountHandler: AccountHandler

    override fun onCreate(savedInstanceState: Bundle?) {
        app = application as CrabblApplication
        communication = Communication()
        accountHandler = AccountHandler(this)

        app.themeHandler.changeTheme(this)

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_preferences)

        radioButtonFrench = findViewById(R.id.radio_button_fr)
        radioButtonEnglish = findViewById(R.id.radio_button_en)

        radioButtonLight = findViewById(R.id.radio_button_light)
        radioButtonDark = findViewById(R.id.radio_button_dark)

        if (app.themeHandler.getTheme() == Theme.LIGHT) {
            radioButtonFrench.setTextColor(Color.BLACK)
            radioButtonEnglish.setTextColor(Color.BLACK)
            radioButtonLight.setTextColor(Color.BLACK)
            radioButtonDark.setTextColor(Color.BLACK)
        } else {
            radioButtonFrench.setTextColor(Color.WHITE)
            radioButtonEnglish.setTextColor(Color.WHITE)
            radioButtonLight.setTextColor(Color.WHITE)
            radioButtonDark.setTextColor(Color.WHITE)
        }

        textViewPreferences = findViewById(R.id.text_view_preferences_title)
        textViewLanguage = findViewById(R.id.text_view_choix_langue)
        textViewTheme = findViewById(R.id.text_view_choix_theme)

        if (app.langHandler.getLang() == Lang.FR) {
            radioButtonFrench.isChecked = true
        } else {
            radioButtonEnglish.isChecked = true
        }

        if (app.themeHandler.getTheme() == Theme.LIGHT) {
            radioButtonLight.isChecked = true
        } else {
            radioButtonDark.isChecked = true
        }

        radioButtonFrench.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                app.langHandler.setLang(Lang.FR)
            } else {
                app.langHandler.setLang(Lang.EN)
            }
            changePrefs(radioButtonDark.isChecked, isChecked)
        }
        translate()

        radioButtonLight.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                app.themeHandler.setTheme(Theme.LIGHT)
            } else {
                app.themeHandler.setTheme(Theme.DARK)
            }
            changePrefs(!isChecked, radioButtonFrench.isChecked)
        }
    }

    private fun changePrefs(usesDarkMode: Boolean, usesFrench: Boolean) {

        val username = accountHandler.getUsername()
        lifecycleScope.launch {
            communication.setPrefs(PreferenceSet(username, usesDarkMode, usesFrench))
            withContext(Dispatchers.Main) {
                recreate()
            }
        }
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textViewPreferences.text = resources.getString(R.string.preferences_fr)
            textViewLanguage.text = resources.getString(R.string.choix_langue_fr)
            textViewTheme.text = resources.getString(R.string.choix_theme_fr)
            radioButtonFrench.text = resources.getString(R.string.francais_fr)
            radioButtonEnglish.text = resources.getString(R.string.anglais_fr)
            radioButtonLight.text = resources.getString(R.string.light_fr)
            radioButtonDark.text = resources.getString(R.string.dark_fr)
        } else {
            textViewPreferences.text = resources.getString(R.string.preferences_en)
            textViewLanguage.text = resources.getString(R.string.choix_langue_en)
            textViewTheme.text = resources.getString(R.string.choix_theme_en)
            radioButtonFrench.text = resources.getString(R.string.francais_en)
            radioButtonEnglish.text = resources.getString(R.string.anglais_en)
            radioButtonLight.text = resources.getString(R.string.light_fr)
            radioButtonDark.text = resources.getString(R.string.dark_en)
        }
    }
}
