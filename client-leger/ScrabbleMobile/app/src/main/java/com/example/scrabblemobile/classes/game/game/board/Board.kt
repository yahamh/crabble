package com.example.scrabblemobile.classes.game.game.board

import io.reactivex.rxjava3.subjects.PublishSubject

class Board() {

    var grid: Array<Array<Tile>>
    var gridChangedSubject: PublishSubject<Array<Array<Tile>>> = PublishSubject.create()

    init {
        grid = Array(15) {
            Array(15) {
                Tile()
            }
        }
    }

    fun printBoard() {
        /*

        for (y in grid.indices) {
            for(x in grid[y].indices) {
                if(grid[y][x].letterObject.char == " ") {
                    if(grid[y][x].letterMultiplicator > 1) {
                        print(grid[y][x].letterMultiplicator)
                    }
                    else if(grid[y][x].wordMultiplicator > 1) {
                        print(grid[y][x].wordMultiplicator+2)
                    }
                    else {
                        print("*")
                    }
                }
                else {
                    print(grid[y][x].letterObject.char)
                }
            }

        }*/
    }

}
