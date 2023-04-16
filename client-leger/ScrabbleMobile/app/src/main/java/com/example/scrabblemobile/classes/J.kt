package com.example.scrabblemobile.classes

import com.google.gson.Gson
import org.json.JSONObject

class J {
    companion object {
        fun son(obj: Any): JSONObject {
            return JSONObject(Gson().toJson(obj));
        }
    }
}
