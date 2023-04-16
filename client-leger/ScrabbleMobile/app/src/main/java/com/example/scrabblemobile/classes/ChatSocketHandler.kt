package com.example.scrabblemobile.classes

import com.example.scrabblemobile.BuildConfig
import com.google.gson.Gson
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.parser.IOParser
import io.socket.parser.Packet
import io.socket.parser.Parser
import org.json.JSONObject

class ChatSocketHandler {
    lateinit var socket: Socket

    fun connectToSocket() {
        val options = IO.Options()
        options.path = "/chat"
        socket = IO.socket(BuildConfig.SOCKET_URL, options)

        socket.connect()
    }
}

