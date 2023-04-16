import { Tile } from "../board/tile";
import { PlaceLetterPointsEstimation, WordPointsEstimation } from "../point-calculator/calculation-estimation";

const BONUS = 50;
const MAX_LETTER_IN_RACK = 7;

export class BotCalculatorService {
    static testPlaceLetterCalculation(numberOfLettersToPlace: number, wordList: Tile[][]): PlaceLetterPointsEstimation {
        const wordsPoints = this.calculatePointsForEachWord(wordList);
        let totalPoints = 0;
        wordsPoints.forEach((wordPoint) => {
            totalPoints += wordPoint.points;
        });
        const isBingo = numberOfLettersToPlace >= MAX_LETTER_IN_RACK;
        if (isBingo) {
            totalPoints += BONUS;
        }
        return { wordsPoints, totalPoints, isBingo };
    }

    private static calculatePointsOfWord(word: Tile[]): number {
        let sumOfWord = 0;
        let totalWordMultiplicator = 1;
        const lettersInWord = new Set(word);
        lettersInWord.forEach((letter) => {
            sumOfWord += letter.letterObject.value * letter.letterMultiplicator;
            totalWordMultiplicator *= letter.wordMultiplicator;
        });
        sumOfWord *= totalWordMultiplicator;
        return sumOfWord;
    }

    private static calculatePointsForEachWord(wordList: Tile[][]): WordPointsEstimation[] {
        const wordPoints: WordPointsEstimation[] = wordList.map((wordTile) => {
            const word = this.tileToString(wordTile);
            const points = this.calculatePointsOfWord(wordTile);
            return { word, points };
        });
        return wordPoints;
    }

    private static tileToString(word: Tile[]): string {
        let wordTemp = '';
        word.forEach((tile) => {
            wordTemp = wordTemp.concat(tile.letterObject.char.valueOf());
        });
        return wordTemp;
    }
}
