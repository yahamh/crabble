package com.example.scrabblemobile.classes.personalization

import android.app.Activity
import android.content.Context
import com.example.scrabblemobile.R

class ThemeHandler(context: Context) {
    private val themePrefs = context.getSharedPreferences("theme_info", Context.MODE_PRIVATE)

    fun getTheme(): Theme {
        val themeString = themePrefs.getString("theme", null) ?: "light"

        return stringToTheme(themeString)
    }

    fun setTheme(theme: Theme) {
        with (themePrefs.edit()) {
            putString("theme", themeToString(theme))
            apply()
        }
    }

    private fun stringToTheme(themeString: String): Theme {
        if (themeString == "light") {
            return Theme.LIGHT
        }
        return Theme.DARK
    }

    private fun themeToString(theme: Theme): String {
        if (theme == Theme.LIGHT) {
            return "light"
        }
        return "dark"
    }

    fun changeTheme(activity: Activity) {
        val theme = getTheme()

        if (theme == Theme.LIGHT) {
            activity.setTheme(R.style.light_theme)
        } else {
            activity.setTheme(R.style.dark_theme)
        }
    }
}
