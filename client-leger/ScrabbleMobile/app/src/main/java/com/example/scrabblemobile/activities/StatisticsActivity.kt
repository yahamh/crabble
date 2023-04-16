package com.example.scrabblemobile.activities

import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.ConnectionStatsRecyclerAdapter
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.account.Communication
import com.example.scrabblemobile.classes.personalization.Lang
import com.example.scrabblemobile.dataClasses.statisticsClasses.GameStatisticsResponse
import com.example.scrabblemobile.dataClasses.statisticsClasses.ConnectionStatisticsResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class StatisticsActivity : AppCompatActivity() {
    private lateinit var connectionStatsRecyclerAdapter: ConnectionStatsRecyclerAdapter

    private lateinit var textViewGamesPlayed: TextView
    private lateinit var textViewGamesWon: TextView
    private lateinit var textViewAverageScore: TextView
    private lateinit var textViewAverageTime: TextView
    private lateinit var textViewConnectionsTitle: TextView
    private lateinit var textViewGamesTitle: TextView
    private lateinit var textViewLoading: TextView

    private var connectionStats: ConnectionStatisticsResponse? = null
    private lateinit var gameStats: GameStatisticsResponse
    private lateinit var recyclerViewConnexionStats: RecyclerView

    private lateinit var app: CrabblApplication

    override fun onCreate(savedInstanceState: Bundle?) {
        app = application as CrabblApplication

        app.themeHandler.changeTheme(this)

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_statistics)

        textViewGamesPlayed = findViewById(R.id.textView_games_played)
        textViewGamesWon = findViewById(R.id.textView_games_won)
        textViewAverageScore = findViewById(R.id.textView_average_score)
        textViewAverageTime = findViewById(R.id.textView_average_time)
        textViewConnectionsTitle = findViewById(R.id.textView_stats_connexion)
        textViewGamesTitle = findViewById(R.id.textView_stats_jeu)
        textViewLoading = findViewById(R.id.textView_loading)

        recyclerViewConnexionStats = findViewById(R.id.recyclerView_connection_stats)
        recyclerViewConnexionStats.layoutManager = LinearLayoutManager(this)

        translate()
        getStatsFromServer()
    }

    private fun getStatsFromServer() {
        lifecycleScope.launch(Dispatchers.IO) {
            val communication = Communication()
            connectionStats = communication.getConnexionStats(app.accountHandler.getUsername())
            gameStats = communication.getGameStats(app.accountHandler.getUsername())!!

            withContext(Dispatchers.Main) {
                connectionStatsRecyclerAdapter =
                    ConnectionStatsRecyclerAdapter(connectionStats!!.entries, app)
                recyclerViewConnexionStats.adapter = connectionStatsRecyclerAdapter
                displayGameStats(gameStats)
            }
        }
    }

    private fun displayGameStats(gameStats: GameStatisticsResponse) {
        val lang = app.langHandler.getLang()

        textViewConnectionsTitle.visibility = View.VISIBLE
        textViewGamesTitle.visibility = View.VISIBLE
        textViewAverageTime.visibility = View.VISIBLE
        textViewGamesWon.visibility = View.VISIBLE
        textViewGamesPlayed.visibility = View.VISIBLE
        textViewAverageScore.visibility = View.VISIBLE
        textViewLoading.visibility = View.INVISIBLE

        if (lang == Lang.FR) {
            textViewGamesPlayed.text = resources.getString(
                R.string.nombre_parties_jouees_fr,
                gameStats.totalNumberOfGames
            )
            textViewGamesWon.text = resources.getString(
                R.string.nombre_parties_gagnees_fr,
                gameStats.totalNumberOfWins
            )
            textViewAverageScore.text = resources.getString(
                R.string.score_moyen_fr,
                gameStats.averageScorePerGame
            )
            textViewAverageTime.text = resources.getString(
                R.string.temps_moyen_fr,
                gameStats.averageTimePerGameSeconds
            )
        } else {
            textViewGamesPlayed.text = resources.getString(
                R.string.nombre_parties_jouees_en,
                gameStats.totalNumberOfGames
            )
            textViewGamesWon.text = resources.getString(
                R.string.nombre_parties_gagnees_en,
                gameStats.totalNumberOfWins
            )
            textViewAverageScore.text = resources.getString(
                R.string.score_moyen_en,
                gameStats.averageScorePerGame
            )
            textViewAverageTime.text = resources.getString(
                R.string.temps_moyen_en,
                gameStats.averageTimePerGameSeconds
            )
        }
    }

    private fun translate() {
        val lang = app.langHandler.getLang()

        if (lang == Lang.FR) {
            textViewLoading.text = resources.getString(R.string.chargement_fr)
            textViewConnectionsTitle.text = resources.getString(R.string.statistiques_compte_fr)
            textViewGamesTitle.text = resources.getString(R.string.statistiques_jeu_fr)
        } else {
            textViewLoading.text = resources.getString(R.string.chargement_en)
            textViewConnectionsTitle.text = resources.getString(R.string.statistiques_compte_en)
            textViewGamesTitle.text = resources.getString(R.string.statistiques_jeu_en)
        }
    }
}

