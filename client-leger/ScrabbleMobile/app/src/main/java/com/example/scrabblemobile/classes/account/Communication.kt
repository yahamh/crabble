package com.example.scrabblemobile.classes.account

import com.example.scrabblemobile.BuildConfig
import com.example.scrabblemobile.dataClasses.*
import com.example.scrabblemobile.dataClasses.preferencesClasses.Preference
import com.example.scrabblemobile.dataClasses.preferencesClasses.PreferenceSet
import com.example.scrabblemobile.dataClasses.statisticsClasses.ConnectionStatisticsResponse
import com.example.scrabblemobile.dataClasses.statisticsClasses.GameStatisticsResponse
import com.google.gson.Gson
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*

class Communication {
    private val httpClient = HttpClient(CIO)
    private val gson = Gson()

    suspend fun authentify(loginInfo: LoginInfo): Boolean {
        return try {

            val response: HttpResponse =
                httpClient.post("${BuildConfig.API_URL}/login/authentify") {
                    contentType(ContentType.Application.Json)
                    setBody(gson.toJson(loginInfo))
                }

            (response.status == HttpStatusCode.OK)
        } catch (cause: Throwable) {
            false
        }
    }

    suspend fun createAccount(accountCreationInfo: AccountCreationInfo): Boolean {
        try {
            val response: HttpResponse =
                httpClient.post("${BuildConfig.API_URL}/login/create-account") {
                    contentType(ContentType.Application.Json)
                    setBody(gson.toJson(accountCreationInfo))
                }

            if (response.status == HttpStatusCode.OK) {
                return response.bodyAsText().toBoolean()
            }
        } catch (cause: Throwable) {
            return false
        }

        return false
    }

    suspend fun changeUsername(loginInfo: LoginInfo, newName: String): Boolean {
        try {
            val response: HttpResponse =
                httpClient.post("${BuildConfig.API_URL}/login/edit-username") {
                    contentType(ContentType.Application.Json)
                    setBody(gson.toJson(ChangeUsernameInfo(loginInfo, newName)))
                }
            if (response.status == HttpStatusCode.OK) {
                return response.bodyAsText().toBoolean()
            }
        } catch (cause: Throwable) {
            return false
        }

        return false
    }

    suspend fun getConnexionStats(username: String): ConnectionStatisticsResponse? {
        try {
            val response: HttpResponse =
                httpClient.get("${BuildConfig.API_URL}/statistics/connection-statistics/?username=$username")
            if (response.status == HttpStatusCode.OK) {
                return Gson().fromJson(
                    response.bodyAsText(),
                    ConnectionStatisticsResponse::class.java
                )
            } else {
                return null
            }
        } catch (cause: Throwable) {
            return null
        }
    }

    suspend fun getGameStats(username: String): GameStatisticsResponse? {
        try {
            val response: HttpResponse =
                httpClient.get("${BuildConfig.API_URL}/statistics/game-statistics/?username=$username")
            if (response.status == HttpStatusCode.OK) {
                return Gson().fromJson(
                    response.bodyAsText(),
                    GameStatisticsResponse::class.java
                )
            } else {
                return null
            }
        } catch (cause: Throwable) {
            return null
        }
    }

    suspend fun getPrefs(username: String): Preference? {
        try {
            val response: HttpResponse =
                httpClient.get("${BuildConfig.API_URL}/preference/?username=$username")
            if (response.status == HttpStatusCode.OK) {
                return Gson().fromJson(
                    response.bodyAsText(),
                    Preference::class.java
                )
            } else {
                return null
            }
        } catch (cause: Throwable) {
            return null
        }
    }

    suspend fun setPrefs(preferenceSet: PreferenceSet): Boolean {
        try {
            val response: HttpResponse =
                httpClient.post("${BuildConfig.API_URL}/preference") {
                    contentType(ContentType.Application.Json)
                    setBody(gson.toJson(preferenceSet))
                }

            if (response.status == HttpStatusCode.OK) {
                return response.bodyAsText().toBoolean()
            }
        } catch (cause: Throwable) {
            return false
        }

        return false
    }
}


