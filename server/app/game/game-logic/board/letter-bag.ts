import { JOKER_CHAR, RACK_LETTER_COUNT } from '@app/game/game-logic/constants';
import { LetterCreator } from './letter-creator';
import { Letter } from './letter.interface';

export class LetterBag {
    static readonly playerLetterCount = RACK_LETTER_COUNT;

    gameLetters: Letter[] = [];
    private letterCreator: LetterCreator = new LetterCreator();
    constructor() {
        for (let letterIndex = 0; letterIndex < LetterCreator.gameLetters.length; letterIndex++) {
            for (let count = 0; count < LetterCreator.gameLettersCount[letterIndex]; count++) {
                const letter = LetterCreator.gameLetters[letterIndex];
                this.gameLetters.push(this.letterCreator.createLetter(letter));
            }
        }
    }

    drawEmptyRackLetters(): Letter[] {
        return this.drawGameLetters(LetterBag.playerLetterCount);
    }

    drawGameLetters(numberOfLetterDesired: number = 1): Letter[] {
        const numberOfLetterToDraw = Math.min(numberOfLetterDesired, this.gameLetters.length);
        const drawedGameLetters: Letter[] = [];
        let drawedGameLetterIndex = -1;
        for (let i = 0; i < numberOfLetterToDraw; i++) {
            drawedGameLetterIndex = Math.floor(Math.random() * this.gameLetters.length);
            drawedGameLetters.push(this.gameLetters.splice(drawedGameLetterIndex, 1)[0]);
        }
        return drawedGameLetters;
    }

    addLetter(letter: Letter) {
        this.gameLetters.push(letter);
    }

    countLetters(): Map<string, number> {
        const LETTER_A_CODE = 'A'.charCodeAt(0);
        const LETTER_Z_CODE = 'Z'.charCodeAt(0);
        const letters: [string, number][] = [[JOKER_CHAR, 0]];
        for (let code = LETTER_A_CODE; code <= LETTER_Z_CODE; code++) {
            letters.push([String.fromCharCode(code), 0]);
        }
        const occurrences = new Map<string, number>(letters);
        for (const letter of this.gameLetters) {
            const char = letter.char;
            const occurrence = occurrences.get(char);
            if (occurrence === undefined) {
                occurrences.set(char, 1);
            } else {
                occurrences.set(char, occurrence + 1);
            }
        }
        return occurrences;
    }

    get lettersLeft(): number {
        return this.gameLetters.length;
    }

    get letterBag(): Letter[] {
        return this.gameLetters;
    }

    get isEmpty(): boolean {
        return this.gameLetters.length === 0;
    }
}
