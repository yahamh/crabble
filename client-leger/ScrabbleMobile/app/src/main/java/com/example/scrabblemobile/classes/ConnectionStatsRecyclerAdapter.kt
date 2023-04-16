package com.example.scrabblemobile.classes

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabblemobile.R
import com.example.scrabblemobile.dataClasses.statisticsClasses.ConnectionStatisticsEntry

class ConnectionStatsRecyclerAdapter(
    val entries: Array<ConnectionStatisticsEntry>,
    val app: CrabblApplication
) : RecyclerView.Adapter<ConnectionStatsRecyclerAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        var date: TextView
        var type: TextView

        init {
            date = view.findViewById(R.id.textView_connection_date)
            type = view.findViewById(R.id.textView_connection_type)
        }
    }

    override fun onCreateViewHolder(
        viewGroup: ViewGroup,
        viewType: Int
    ): ConnectionStatsRecyclerAdapter.ViewHolder {
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.activity_statistics_connections_view, viewGroup, false)

        return ConnectionStatsRecyclerAdapter.ViewHolder(view)
    }

    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {
        viewHolder.date.text = entries[position].date
        if (entries[position].connectionStatisticsType == "deconnection") {
            viewHolder.type.text = "disconnection"
        } else {
            viewHolder.type.text = entries[position].connectionStatisticsType
        }
    }

    override fun getItemCount(): Int {
        return entries.size
    }
}
