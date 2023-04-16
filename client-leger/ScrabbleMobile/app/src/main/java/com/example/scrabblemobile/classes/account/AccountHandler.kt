package com.example.scrabblemobile.classes.account

import android.content.Context
import com.example.scrabblemobile.BuildConfig
import com.example.scrabblemobile.classes.J
import com.example.scrabblemobile.classes.game.game.gameSettings.GameSettings
import com.example.scrabblemobile.dataClasses.AccountCreationInfo
import com.example.scrabblemobile.dataClasses.LoginInfo
import com.google.gson.Gson
import io.reactivex.rxjava3.subjects.BehaviorSubject
import io.reactivex.rxjava3.subjects.PublishSubject
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject

class AccountHandler(context: Context) {
    private val loginPrefs = context.getSharedPreferences("login_info", Context.MODE_PRIVATE)
    private val communication = Communication()

    var connected = false

    private lateinit var socket: Socket

    var connectedSubject: PublishSubject<Boolean> = PublishSubject.create()

    fun tryLoginBack() {
        val logins = getLoginPreferences()
        if (logins.password == null || logins.username == null) {
            return
        }

        logIn(logins.username!!, logins.password!!)
    }

    private fun setLoginPreferences(loginInfo: LoginInfo) {
        with (loginPrefs.edit()) {
            putString("username", loginInfo.username)
            putString("password", loginInfo.password)
            apply()
        }
    }

    fun getLoginPreferences(): LoginInfo {
        val username = loginPrefs.getString("username", null)
        val password = loginPrefs.getString("password", null)

        return LoginInfo(username, password)
    }

    fun deleteLoginPreferences() {
        loginPrefs.edit().remove("username").remove("password").apply()
    }

    suspend fun authentify(username: String, password: String): Boolean {
        if (username.isBlank() || password.isBlank())
            return false

        val loginInfo = LoginInfo(username, password)

        return communication.authentify(loginInfo)
    }

    fun logIn(username: String, password: String) {
        val loginInfo = LoginInfo(username, password)

        connectSocket(loginInfo)
    }

    fun requestAccountData(username: String, onReceive: (data: AccountCreationInfo) -> Unit) {
        socket.on("accountData$username") { args ->
            val data = Gson().fromJson((args[0] as JSONObject).toString(), AccountCreationInfo::class.java)
            onReceive(data)
        }

        socket.emit("requestAccountData", username)
    }

    private fun connectSocket(loginInfo: LoginInfo) {
        val options = IO.Options()
        options.path = "/socketAccount"
        socket = IO.socket(BuildConfig.SOCKET_URL, options)
        socket.connect()

        socket.on("error") {
            socket.disconnect()
            connected = false
            connectedSubject.onNext(false)
        }

        socket.on("login") { args ->
            val success = args[0] as Boolean
            if (success) {
                setLoginPreferences(loginInfo)
                connected = true
                connectedSubject.onNext(true)
            }
            else {
                socket.disconnect()
                deleteLoginPreferences()
                connected = false
                connectedSubject.onNext(false)
            }
        }

        socket.on("disconnect") {
            connected = false
            deleteLoginPreferences()
        }

        socket.emit("login", J.son(loginInfo))
    }

    fun logOut() {
        socket.disconnect()
        connected = false
        deleteLoginPreferences()
    }

    suspend fun signUp(
        username: String,
        email: String,
        password: String,
        profilePictureId: String
    ): Boolean {
        val accountCreationInfo = AccountCreationInfo(
            username,
            email,
            password,
            profilePictureId
        )

        val communication = Communication()

        val resBody = communication.createAccount(accountCreationInfo)

        if (resBody) {
            setLoginPreferences(LoginInfo(username, password))
        }

        return resBody
    }

    suspend fun changeUsername(loginInfo: LoginInfo, newName: String):Boolean{
        val communication = Communication()

        val resBody = communication.changeUsername(loginInfo, newName)

        if (resBody) {
            setLoginPreferences(LoginInfo(newName, loginInfo.password))
        }

        return resBody
    }

    fun getUsername(): String {
        return this.getLoginPreferences().username!!
    }
}
