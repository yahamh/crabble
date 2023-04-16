package com.example.scrabblemobile.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.lifecycle.lifecycleScope
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.personalization.Lang
import com.example.scrabblemobile.classes.personalization.LangHandler
import com.example.scrabblemobile.classes.personalization.Theme
import kotlinx.coroutines.launch

class UserProfileActivity : AppCompatActivity() {
    private lateinit var buttonStatistics: Button
    private lateinit var buttonPreferences: Button
    private lateinit var buttonLogOut: Button
    private lateinit var buttonModifyProfile: Button

    private lateinit var textUserProfile: TextView
    private lateinit var textUser: TextView

    private lateinit var app: CrabblApplication

    private lateinit var currentTheme: Theme

    override fun onCreate(savedInstanceState: Bundle?) {
        app = application as CrabblApplication

        app.themeHandler.changeTheme(this)
        currentTheme = app.themeHandler.getTheme()

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user_profile)

        buttonStatistics = findViewById(R.id.button_statistiques)
        buttonPreferences = findViewById(R.id.button_preferences)
        buttonLogOut = findViewById(R.id.button_profile_deco)
        buttonModifyProfile = findViewById(R.id.button_modify_profile)

        textUserProfile = findViewById(R.id.text_view_profil_utilisateur)
        textUser = findViewById(R.id.text_profile_connected_user)

        buttonLogOut.setOnClickListener { logOut() }
        buttonModifyProfile.setOnClickListener { startModifyProfileActivity() }
        buttonStatistics.setOnClickListener { startStatisticsActivity() }
        buttonPreferences.setOnClickListener { startPreferencesActivity() }

        checkSignIn()
        translate()
    }

    private fun checkSignIn() {
        val loginInfo = app.accountHandler.getLoginPreferences()

        if (loginInfo.username == null || loginInfo.password == null) {
            return
        }

        lifecycleScope.launch {
            if (app.accountHandler.authentify(loginInfo.username!!, loginInfo.password!!)) {
                changeLayout(true)
            }
        }
    }

    private fun logOut() {
        app.accountHandler.logOut()
        val welcomePageActivityIntent = Intent(this, WelcomePageActivity::class.java)
        startActivity(welcomePageActivityIntent)
        finish()
    }

    private fun changeLayout(isConnected: Boolean) {
        if (isConnected) {
            buttonStatistics.visibility = View.VISIBLE
            buttonPreferences.visibility = View.VISIBLE
            buttonLogOut.visibility = View.VISIBLE
            buttonModifyProfile.visibility = View.VISIBLE

            textUser.visibility = View.VISIBLE
        } else {
            buttonStatistics.visibility = View.INVISIBLE
            buttonPreferences.visibility = View.INVISIBLE
            buttonLogOut.visibility = View.INVISIBLE
            buttonModifyProfile.visibility = View.INVISIBLE

            textUser.visibility = View.INVISIBLE
        }
    }

    override fun onResume() {
        super.onResume()

        checkSignIn()
        translate()

        if (currentTheme != app.themeHandler.getTheme()) {
            recreate()
        }
    }

    private fun startModifyProfileActivity() {
        val modifyProfileActivityIntent = Intent(this, ModifyProfileActivity::class.java)
        startActivity(modifyProfileActivityIntent)
    }

    private fun startStatisticsActivity() {
        val statisticsActivityIntent = Intent(this, StatisticsActivity::class.java)
        startActivity(statisticsActivityIntent)
    }

    private fun startPreferencesActivity() {
        val preferencesActivityIntent = Intent(this, PreferencesActivity::class.java)
        startActivity(preferencesActivityIntent)
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textUserProfile.text = resources.getString(R.string.profil_utilisateur_fr)
            buttonStatistics.text = resources.getString(R.string.statistiques_fr)
            buttonPreferences.text = resources.getString(R.string.preferences_fr)
            buttonModifyProfile.text = resources.getString(R.string.modifier_profil_fr)
            buttonLogOut.text = resources.getString(R.string.deconnecter_fr)
            textUser.text = resources.getString(
                R.string.utilisateur_connecte_fr,
                app.accountHandler.getLoginPreferences().username
            )
        } else {
            textUserProfile.text = resources.getString(R.string.profil_utilisateur_en)
            buttonStatistics.text = resources.getString(R.string.statistiques_en)
            buttonPreferences.text = resources.getString(R.string.preferences_en)
            buttonModifyProfile.text = resources.getString(R.string.modifier_profil_en)
            buttonLogOut.text = resources.getString(R.string.deconnecter_en)
            textUser.text = resources.getString(
                R.string.utilisateur_connecte_en,
                app.accountHandler.getLoginPreferences().username
            )
        }
    }
}
