package com.example.scrabblemobile.classes.game.views

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabblemobile.R
import com.example.scrabblemobile.activities.JoinGameActivity
import com.example.scrabblemobile.classes.CrabblApplication
import com.example.scrabblemobile.classes.game.game.gameSettings.GameSettings
import com.example.scrabblemobile.classes.personalization.Lang
import com.example.scrabblemobile.classes.personalization.Theme

class JoinGameRecyclerAdapter(
    private var dataSet: Array<GameSettings>,
    private var joinGameActivity: JoinGameActivity,
    private val app: CrabblApplication
) : RecyclerView.Adapter<JoinGameRecyclerAdapter.ViewHolder>() {

    fun updateDataSet(newDataSet: Array<GameSettings>) {
        dataSet = newDataSet
        notifyDataSetChanged()
    }

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textViewGameId: TextView
        val players: Array<TextView>
        val buttonJoinGame: Button
        val timer: TextView
        val cardViews: Array<ImageView>
        val layout: LinearLayout

        init {
            // Define click listener for the ViewHolder's View.
            layout = view.findViewById(R.id.layout_join_game)
            textViewGameId = view.findViewById(R.id.textViewGameId)
            players = arrayOf(
                view.findViewById(R.id.player1),
                view.findViewById(R.id.player2),
                view.findViewById(R.id.player3),
                view.findViewById(R.id.player4)
            )
            buttonJoinGame = view.findViewById(R.id.button_rejoindre)
            timer = view.findViewById(R.id.textView_timerJoinGame)

            if (app.themeHandler.getTheme() == Theme.DARK) {
                layout.setBackgroundColor(view.resources.getColor(R.color.background_dark))
                timer.setBackgroundColor(view.resources.getColor(R.color.background_dark))
                textViewGameId.setBackgroundColor(view.resources.getColor(R.color.background_dark))
            }

            cardViews = arrayOf(
                view.findViewById(R.id.imageView_card1),
                view.findViewById(R.id.imageView_card2),
                view.findViewById(R.id.imageView_card3),
                view.findViewById(R.id.imageView_card4),
                view.findViewById(R.id.imageView_card5),
                view.findViewById(R.id.imageView_card6),
                view.findViewById(R.id.imageView_card7),
                view.findViewById(R.id.imageView_card8),
            )
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.activity_join_game_gameview, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {
        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.textViewGameId.text = "id : " + dataSet[position].id
        for (i in dataSet[position].players.indices) {
            if (dataSet[position].players.isNotEmpty()) {
                viewHolder.players[i].text = dataSet[position].players[i]
            } else
                break
        }

        val lang = app.langHandler.getLang()

        viewHolder.buttonJoinGame.post {
            if (lang == Lang.FR) {
                viewHolder.buttonJoinGame.text =
                    joinGameActivity.resources.getString(R.string.rejoindre_cette_partie_fr)
            } else {
                viewHolder.buttonJoinGame.text =
                    joinGameActivity.resources.getString(R.string.rejoindre_cette_partie_en)
            }
        }

        viewHolder.buttonJoinGame.setOnClickListener { joinGame(dataSet[position]) }
        viewHolder.timer.text = formatTimer(position)
        dataSet[position].timePerTurn.toString()
        for (i in dataSet[position].cards) {
            viewHolder.cardViews[i].alpha = 1f
        }
        if (dataSet[position].cards.isEmpty()) {
            for (i in viewHolder.cardViews) {
                i.visibility = View.INVISIBLE
            }
        }
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = dataSet.size

    private fun joinGame(gameSettings: GameSettings) {
        if (gameSettings.password.isNotEmpty()) {
            app.gameSettings = gameSettings
            joinGameActivity.displayPasswordFragment(gameSettings.id, gameSettings.password)
        } else {
            app.gameSettings = gameSettings
            joinGameActivity.joinGame(gameSettings.id)
        }
    }

    private fun formatTimer(position: Int): String {
        val timer = dataSet[position].timePerTurn
        val timerInMins: Int = timer / 1000 / 60
        val timerInSecs: Int = (timer / 1000) % 60
        val timerInSecsString: String = if (timerInSecs == 0) "00" else timerInSecs.toString()
        return "$timerInMins:$timerInSecsString min"
    }
}


