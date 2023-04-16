package com.example.scrabblemobile.activities

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.text.Editable
import android.text.TextUtils
import android.text.TextWatcher
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers
import io.reactivex.rxjava3.schedulers.Schedulers
import androidx.lifecycle.lifecycleScope
import com.example.scrabblemobile.classes.account.Communication
import com.example.scrabblemobile.classes.personalization.Lang
import com.example.scrabblemobile.classes.personalization.Theme
import io.reactivex.rxjava3.disposables.Disposable
import kotlinx.coroutines.launch


class WelcomePageActivity : AppCompatActivity() {
    private lateinit var app: CrabblApplication

    private lateinit var btnSignIn: Button
    private lateinit var editTextNameSignIn: EditText
    private lateinit var editTextPasswordSignIn: EditText

    private lateinit var textCreateAccount: TextView
    private lateinit var textNameHint: TextView
    private lateinit var textEmailHint: TextView
    private lateinit var textPasswordHint: TextView
    private lateinit var textPasswordMatchHint: TextView
    private lateinit var textSignin: TextView

    private lateinit var editTextNameSignUp: EditText
    private lateinit var editTextEmail: EditText
    private lateinit var editTextPasswordSignUp: EditText
    private lateinit var editTextPasswordConfirm: EditText

    private lateinit var buttonSignUp: Button

    private var avatarPickingViews: Array<ImageView> = arrayOf()

    private var isNameCorrect = false
    private var isEmailCorrect = false
    private var isPasswordCorrect = false
    private var isPasswordMatch = false

    private var selectedAvatar = 0

    private var connectedSubscription: Disposable? = null

    private lateinit var communication: Communication

    override fun onCreate(savedInstanceState: Bundle?) {
        app = application as CrabblApplication
        app.themeHandler.setTheme(Theme.DARK)
        app.themeHandler.changeTheme(this)

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_welcome_page)
        app = application as CrabblApplication

        app.langHandler.setLang(Lang.FR)

        communication = Communication()

        connectedSubscription = app.accountHandler.connectedSubject.subscribe { isConnected ->
            if (isConnected) {
                lifecycleScope.launch {
                    setLocalPrefs()
                    val mainActivityIntent =
                        Intent(this@WelcomePageActivity, MainActivity::class.java)
                    startActivity(mainActivityIntent)
                    finish()
                }
            } else {
                lifecycleScope.launch {
                    showDialogSignIn(false)
                }
            }
        }

        if (app.accountHandler.connected) {
            lifecycleScope.launch {
                setLocalPrefs()
                val mainActivityIntent = Intent(this@WelcomePageActivity, MainActivity::class.java)
                startActivity(mainActivityIntent)
                finish()
            }
        }

        editTextNameSignIn = findViewById(R.id.edit_text_signin_nom)
        editTextPasswordSignIn = findViewById(R.id.edit_text_signin_password)

        btnSignIn = findViewById(R.id.button_signin_connecter)

        btnSignIn.setOnClickListener { connect() }

        textCreateAccount = findViewById(R.id.text_view_creer_compte)
        textNameHint = findViewById(R.id.text_signin_hint_name)
        textEmailHint = findViewById(R.id.text_signin_hint_courriel)
        textPasswordHint = findViewById(R.id.text_signin_hint_mdp)
        textPasswordMatchHint = findViewById(R.id.text_signin_hint_mdp_match)
        textSignin = findViewById(R.id.text_signin_connecter)

        editTextNameSignUp = findViewById(R.id.edit_text_signup_nom)
        editTextEmail = findViewById(R.id.edit_text_signup_courriel)
        editTextPasswordSignUp = findViewById(R.id.edit_text_signup_password)
        editTextPasswordConfirm = findViewById(R.id.edit_text_signup_password_confirm)

        buttonSignUp = findViewById(R.id.button_signup_sinscrire)

        avatarPickingViews += findViewById<ImageView>(R.id.avatarSelection1)
        avatarPickingViews += findViewById<ImageView>(R.id.avatarSelection2)
        avatarPickingViews += findViewById<ImageView>(R.id.avatarSelection3)
        avatarPickingViews += findViewById<ImageView>(R.id.avatarSelection4)
        avatarPickingViews += findViewById<ImageView>(R.id.avatarSelection5)

        avatarPickingViews.forEachIndexed { index, imageView ->
            imageView.setOnClickListener {
                avatarPickingViews.forEach { iview ->
                    iview.setBackgroundColor(Color.argb(0, 0, 0, 0))
                }
                imageView.setBackgroundColor(Color.rgb(0xB7, 0xCA, 0xAE))
                selectedAvatar = index
            }
        }

        setListeners()
        translate()
    }


    private fun connect() {
        app.accountHandler.logIn(
            editTextNameSignIn.text.toString(),
            editTextPasswordSignIn.text.toString()
        )
    }

    private fun showDialogSignIn(isCreated: Boolean) {
        if (isCreated) {
            return
        }

        val builder = AlertDialog.Builder(this, R.style.dialog_dark)


        builder.setTitle("Connection")
        if (isCreated) {
            builder.setMessage("Connecté avec succès")
        } else {
            builder.setMessage("Échec de la connection")
        }

        builder.setNeutralButton("OK") { _, _ ->
            if (isCreated) {
                lifecycleScope.launch {
                    setLocalPrefs()
                    val mainActivityIntent =
                        Intent(this@WelcomePageActivity, MainActivity::class.java)
                    startActivity(mainActivityIntent)
                    finish()
                }
            } else {
                emptyFields()
            }
        }

        val alertDialog: AlertDialog = builder.create()
        alertDialog.setCancelable(false)
        alertDialog.show()
    }

    private fun signUp() {
        lifecycleScope.launch {
            val resBody = app.accountHandler.signUp(
                editTextNameSignUp.text.toString(),
                editTextEmail.text.toString(),
                editTextPasswordSignUp.text.toString(),
                selectedAvatar.toString()
            )
            if (resBody) {
                app.accountHandler.logIn(
                    editTextNameSignUp.text.toString(),
                    editTextPasswordSignUp.text.toString()
                )
            }
        }
    }

    private fun enableButton() {
        buttonSignUp.isEnabled =
            (isNameCorrect && isEmailCorrect && isPasswordCorrect && isPasswordMatch)
    }

    private fun setListeners() {
        buttonSignUp.setOnClickListener { signUp() }

        editTextNameSignUp.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable) {
                val name = s.toString()

                if ((name.length < 3 || name.length > 16)) {
                    if (name.isNotEmpty()) {
                        textNameHint.visibility = View.VISIBLE
                    } else {
                        textNameHint.visibility = View.INVISIBLE
                    }
                    isNameCorrect = false
                } else {
                    textNameHint.visibility = View.INVISIBLE
                    isNameCorrect = true
                }
                enableButton()
            }

            override fun beforeTextChanged(
                s: CharSequence, start: Int,
                count: Int, after: Int
            ) {
            }

            override fun onTextChanged(
                s: CharSequence, start: Int,
                before: Int, count: Int
            ) {
            }
        })

        editTextEmail.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable) {
                val email = s.toString()

                if (TextUtils.isEmpty(email) || !android.util.Patterns.EMAIL_ADDRESS.matcher(email)
                        .matches()
                ) {
                    if (email.isNotEmpty()) {
                        textEmailHint.visibility = View.VISIBLE
                    } else {
                        textEmailHint.visibility = View.INVISIBLE
                    }
                    isEmailCorrect = false
                } else {
                    textEmailHint.visibility = View.INVISIBLE
                    isEmailCorrect = true
                }
                enableButton()
            }

            override fun beforeTextChanged(
                s: CharSequence, start: Int,
                count: Int, after: Int
            ) {
            }

            override fun onTextChanged(
                s: CharSequence, start: Int,
                before: Int, count: Int
            ) {
            }
        })

        editTextPasswordSignUp.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable) {
                val password = s.toString()

                if (password.length < 3 || password.length > 16) {
                    if (password.isNotEmpty()) {
                        textPasswordHint.visibility = View.VISIBLE
                    } else {
                        textPasswordHint.visibility = View.INVISIBLE
                        if (editTextPasswordConfirm.text.toString().isEmpty()) {
                            textPasswordMatchHint.visibility = View.INVISIBLE
                        }
                    }
                    isPasswordCorrect = false
                } else {
                    textPasswordHint.visibility = View.INVISIBLE
                    isPasswordCorrect = true
                }
                enableButton()
            }

            override fun beforeTextChanged(
                s: CharSequence, start: Int,
                count: Int, after: Int
            ) {
            }

            override fun onTextChanged(
                s: CharSequence, start: Int,
                before: Int, count: Int
            ) {
            }
        })

        editTextPasswordConfirm.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable) {
                val passwordConfirmation = s.toString()
                val password = editTextPasswordSignUp.text.toString()

                if (password.isNotEmpty()) {
                    if (passwordConfirmation != password) {
                        textPasswordMatchHint.visibility = View.VISIBLE
                        isPasswordMatch = false
                    } else {
                        textPasswordMatchHint.visibility = View.INVISIBLE
                        isPasswordMatch = true
                    }
                } else {
                    if (passwordConfirmation.isNotEmpty()) {
                        textPasswordMatchHint.visibility = View.VISIBLE
                    } else {
                        textPasswordMatchHint.visibility = View.INVISIBLE
                    }
                    isPasswordMatch = false
                }


                enableButton()
            }

            override fun beforeTextChanged(
                s: CharSequence, start: Int,
                count: Int, after: Int
            ) {
            }

            override fun onTextChanged(
                s: CharSequence, start: Int,
                before: Int, count: Int
            ) {
            }
        })
    }

    override fun onDestroy() {
        super.onDestroy()
        connectedSubscription?.dispose()
    }

    private fun emptyFields() {
        editTextPasswordSignUp.text.clear()
        editTextNameSignUp.text.clear()
        editTextPasswordSignIn.text.clear()
        editTextNameSignIn.text.clear()
        editTextEmail.text.clear()
        editTextPasswordConfirm.text.clear()
    }

    private suspend fun setLocalPrefs() {
        val preference = communication.getPrefs(app.accountHandler.getUsername())

        if (preference?.usesFrench == true) {
            app.langHandler.setLang(Lang.FR)
        } else {
            app.langHandler.setLang(Lang.EN)
        }

        if (preference?.usesDarkMode == true) {
            app.themeHandler.setTheme(Theme.DARK)
        } else {
            app.themeHandler.setTheme(Theme.LIGHT)
        }
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textCreateAccount.text = resources.getString(R.string.creer_un_compte_fr)
            editTextNameSignUp.hint = resources.getString(R.string.nom_utilisateur_fr)
            textNameHint.text = resources.getString(R.string.sign_in_hint_fr)
            editTextEmail.hint = resources.getString(R.string.courriel_fr)
            textEmailHint.text = resources.getString(R.string.courriel_invalide_fr)
            editTextPasswordSignIn.hint = resources.getString(R.string.mot_de_passe_fr)
            textPasswordHint.text = resources.getString(R.string.sign_in_hint_fr)
            editTextPasswordConfirm.hint =
                resources.getString(R.string.confirmation_mot_de_passe_fr)
            textPasswordMatchHint.text = resources.getString(R.string.mots_de_passes_differents_fr)
            buttonSignUp.text = resources.getString(R.string.creer_un_compte_fr)
            textSignin.text = resources.getString(R.string.se_connecter_fr)
            editTextNameSignUp.hint = resources.getString(R.string.nom_utilisateur_fr)
            editTextPasswordSignUp.hint = resources.getString(R.string.mot_de_passe_fr)
            btnSignIn.text = resources.getString(R.string.se_connecter_fr)
        } else {
            textCreateAccount.text = resources.getString(R.string.creer_un_compte_en)
            editTextNameSignUp.hint = resources.getString(R.string.nom_utilisateur_en)
            textNameHint.text = resources.getString(R.string.sign_in_hint_en)
            editTextEmail.hint = resources.getString(R.string.courriel_en)
            textEmailHint.text = resources.getString(R.string.courriel_invalide_en)
            editTextPasswordSignIn.hint = resources.getString(R.string.mot_de_passe_en)
            textPasswordHint.text = resources.getString(R.string.sign_in_hint_en)
            editTextPasswordConfirm.hint =
                resources.getString(R.string.confirmation_mot_de_passe_en)
            textPasswordMatchHint.text = resources.getString(R.string.mots_de_passes_differents_en)
            buttonSignUp.text = resources.getString(R.string.creer_un_compte_en)
            textSignin.text = resources.getString(R.string.se_connecter_en)
            editTextNameSignUp.hint = resources.getString(R.string.nom_utilisateur_en)
            editTextPasswordSignUp.hint = resources.getString(R.string.mot_de_passe_en)
            btnSignIn.text = resources.getString(R.string.se_connecter_en)
        }
    }
}


