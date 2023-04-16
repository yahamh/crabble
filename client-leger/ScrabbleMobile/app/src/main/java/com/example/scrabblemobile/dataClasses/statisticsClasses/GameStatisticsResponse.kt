package com.example.scrabblemobile.dataClasses.statisticsClasses

data class GameStatisticsResponse(
    var totalNumberOfGames: String,
    var totalNumberOfWins: String,
    var averageScorePerGame: String,
    var averageTimePerGameSeconds: String
)
