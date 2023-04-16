package com.example.scrabblemobile.activities

import android.os.Bundle
import android.text.Html
import android.text.method.ScrollingMovementMethod
import android.view.KeyEvent
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.scrabblemobile.dataClasses.ChatMessage
import com.example.scrabblemobile.classes.ChatSocketHandler
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.J
import org.json.JSONException
import org.json.JSONObject
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter


class ChatActivity : AppCompatActivity() {
    private lateinit var buttonSendMessage: Button
    private lateinit var editTextChat: EditText
    private lateinit var textViewChat: TextView
    private lateinit var socketHandler: ChatSocketHandler

    private lateinit var app: CrabblApplication

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)
        app = application as CrabblApplication

        socketHandler = ChatSocketHandler()

        buttonSendMessage = findViewById(R.id.button_chat_envoyer)
        editTextChat = findViewById(R.id.editText_chat)
        textViewChat = findViewById(R.id.textView_chat)

        textViewChat.movementMethod = ScrollingMovementMethod()

        editTextChat.setOnKeyListener(object : View.OnKeyListener {
            override fun onKey(v: View?, keyCode: Int, event: KeyEvent): Boolean {
                if (event.action == KeyEvent.ACTION_DOWN &&
                    keyCode == KeyEvent.KEYCODE_ENTER
                ) {
                    sendMessage()
                    return true
                }
                return false
            }
        })

        buttonSendMessage.setOnClickListener { sendMessage() }

        logIn()
    }

    private fun logIn() {
        this.socketHandler.connectToSocket()

        this.join()
        this.connection()
    }

    private fun join() {
        this.socketHandler.socket.on("message") { args ->
            val data = args[0] as JSONObject
            var username = "test"
            var message = "test"
            try {
                username = data.getString("sender")
                message = data.getString("message")
            } catch (e: JSONException) {
            }

            runOnUiThread {
                receiveMessage(username, message)
            }
        }
    }

    private fun connection() {
        val loginInfo = app.accountHandler.getLoginPreferences()
        this.socketHandler.socket.emit("joinChat", J.son(loginInfo))
    }

    private fun sendMessage() {
        val message = editTextChat.text.toString()
        if (message.isBlank()) {
            return
        }

        editTextChat.text.clear()

        val username = app.accountHandler.getLoginPreferences().username ?: return

        val chatMessage = ChatMessage(message, username)
        this.socketHandler.socket.emit("message", J.son(chatMessage))
    }

    private fun receiveMessage(username: String, message: String) {
        if (message.isBlank()) {
            return
        }

        val text: String = if (username == app.accountHandler.getLoginPreferences().username) {
            "<font color=#808080>${username}: </font> <font color=#000000>${message} </font> <font color=#808080>(${getTimeStamp()}) </font>"
        } else {
            "<font color=#0000FF>${username}: </font> <font color=#000000>${message} </font> <font color=#808080>(${getTimeStamp()}) </font>"
        }


        textViewChat.append(Html.fromHtml(text, Html.FROM_HTML_MODE_LEGACY))
        textViewChat.append("\n")


        // source: https://stackoverflow.com/questions/3506696/auto-scrolling-textview-in-android-to-bring-text-into-view
        val scrollAmount =
            textViewChat.layout.getLineTop(textViewChat.lineCount) - textViewChat.height
        // if there is no need to scroll, scrollAmount will be <=0
        if (scrollAmount > 0) {
            textViewChat.scrollTo(0, scrollAmount)
        } else {
            textViewChat.scrollTo(0, 0)
        }
    }

    // TODO : A FAIRE SUR LE SERVEUR
    private fun getTimeStamp(): String {
        val current = LocalDateTime.now()

        val formatter = DateTimeFormatter.ofPattern("HH:mm:ss")
        return current.format(formatter)
    }
}
