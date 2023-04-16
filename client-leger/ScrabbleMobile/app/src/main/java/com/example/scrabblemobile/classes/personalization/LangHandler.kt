package com.example.scrabblemobile.classes.personalization

import android.content.Context

class LangHandler(context: Context) {
    private val langPrefs = context.getSharedPreferences("lang_info", Context.MODE_PRIVATE)

    fun isFr(): Boolean {
        return getLang() == Lang.FR
    }

    fun getLang(): Lang {
        val langString = langPrefs.getString("lang", null) ?: "fr"

        return stringToLang(langString)
    }

    fun setLang(lang: Lang) {
        with (langPrefs.edit()) {
            putString("lang", langToString(lang))
            apply()
        }
    }

    private fun stringToLang(langString: String): Lang {
        if (langString == "fr") {
            return Lang.FR
        }
        return Lang.EN
    }

    private fun langToString(lang: Lang): String {
        if (lang == Lang.FR) {
            return "fr"
        }
        return "en"
    }
}
