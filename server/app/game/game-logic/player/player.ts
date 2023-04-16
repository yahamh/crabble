import { Action } from '@app/game/game-logic/actions/action';
import { LetterBag } from '@app/game/game-logic/board/letter-bag';
import { Letter } from '@app/game/game-logic/board/letter.interface';
import { OnlineActionType } from '@app/game/online-action.interface';
import { Subject } from 'rxjs';
import { Direction } from '../actions/direction.enum';
import { ExchangeLetter } from '../actions/exchange-letter';
import { PassTurn } from '../actions/pass-turn';
import { PlaceLetter } from '../actions/place-letter';
import { EMPTY_CHAR } from '../constants';
import { ServerGame } from '../game/server-game';
import { CardType } from '../interface/game-state.interface';
import { BotCrawler } from './bot-crawler';
import { ValidWord } from './valid-word';

export const WORDS_BEFORE_CARD = 3;
export const MAXIMUM_NUMBER_OF_CARD = 3;

export class Player {
    static defaultName = 'QWERTY';
    action$: Subject<Action> = new Subject();

    points: number = 0;
    cumulativeGameTime = 0;
    isActive: boolean;
    letterRack: Letter[] = [];

    cards: CardType[] = [];
    wordsBeforeCard: number = WORDS_BEFORE_CARD;

    validWordList: ValidWord[] = [];
    botCrawler: BotCrawler;

    constructor(public name: string, public game: ServerGame, public isVirtual: boolean = false) {
        this.botCrawler = new BotCrawler(this, game.dictionaryService, game.wordSearcher)
    }

    executeAutomatedAction(): string {

        for(const cardType of this.cards) {

            if(Math.random() > 0.1) {
                continue;
            }

            switch(cardType) {
                case CardType.Joker:
                    let choice = this.game.cardsAvailable.filter(v => v != CardType.Joker)[Math.floor(this.game.cardsAvailable.length*Math.random())];
                    this.game.useCard({
                        card: cardType,
                        user: this.name,
                        cardChoice: choice
                    });
                    break;
                case CardType.PassTurn:
                    this.game.useCard({
                        card: cardType,
                        user: this.name
                    });
                    break;
                case CardType.Points:
                    this.game.useCard({
                        card: cardType,
                        user: this.name
                    });
                    break;
                case CardType.RemoveTime:
                    this.game.useCard({
                        card: cardType,
                        user: this.name
                    });
                    break;
                case CardType.Steal:
                    if(Math.max(...this.game.players.map(value => value.points)) == this.points) {
                        break;
                    }

                    this.game.useCard({
                        card: cardType,
                        user: this.name
                    });
                    break;
                case CardType.SwapLetter:
                    this.game.useCard({
                        card: cardType,
                        user: this.name,
                        letterFromRack: this.letterRack[Math.floor(this.letterRack.length*Math.random())],
                        letterToGet: this.game.letterBag.letterBag[Math.floor(this.game.letterBag.letterBag.length*Math.random())]
                    });
                    break;
                case CardType.SwapRack:
                    const otherPlayers = this.game.players.map(value => value.name).filter(value => value != this.name);
                    this.game.useCard({
                        card: cardType,
                        user: this.name,
                        playerToSwap: otherPlayers[Math.floor(otherPlayers.length*Math.random())]
                    });
                    break;
                case CardType.TransformTile:
                    let possiblePlacements:{x: number, y: number}[] = [];
                    let y = 0;
                    for(let row of this.game.board.grid) {
                        let x = 0;
                        for(let tile of row) {
                            if(tile.letterObject.char == EMPTY_CHAR && tile.letterMultiplicator == 1 && tile.wordMultiplicator == 1) {
                                possiblePlacements.push({x, y});
                            }
                            x++;
                        }
                        y++;
                    }

                    const chosen = possiblePlacements[Math.floor(possiblePlacements.length*Math.random())];

                    this.game.useCard({
                        card: cardType,
                        user: this.name,
                        tileToTransformX: chosen.x,
                        tileToTransformY: chosen.y
                    });
                    break;
            }

        }

        let randomChoice = Math.random();
        let action: Action;

        if(randomChoice > 0.3) {
            action = this.tryToPlayWord() ?? this.exchangeLetters() ?? this.passTurn();
        }
        else if(randomChoice > 0.05) {
            action = this.exchangeLetters() ?? this.passTurn();
        }
        else {
            action = this.passTurn();
        }

        setTimeout(() => {
            this.play(action);
        }, 1000)
        return action instanceof PlaceLetter ? `PlaceLetter: ${action.word}` : action instanceof PassTurn ? "PassTurn" : `Exchange: ${(action as ExchangeLetter).lettersToExchange.map(value => value.char).join("")}`;
    }

    private tryToPlayWord(): Action | undefined {
        this.validWordList = [];

        if(this.game.board.grid[7][7].letterObject.char == EMPTY_CHAR) {
            this.botCrawler.botFirstTurn();
        }
        else {
            this.botCrawler.boardCrawler({x:0, y:0}, this.game.board.grid, false)
        }

        if(this.validWordList.length == 0) {
            return undefined
        }

        const word = this.validWordList.sort((a, b) => a.value.totalPoints - b.value.totalPoints)[Math.floor(this.validWordList.length*0.9)];

        return this.game.actionCompiler.translate({
            type: OnlineActionType.Place,
            letters: word.word,
            placementSettings: {
                direction: word.isVertical ? Direction.Vertical : Direction.Horizontal,
                x: word.startingTileX,
                y: word.startingTileY
            }
        }, this);
    }

    private exchangeLetters(): Action | undefined {
        if(this.game.letterBag.lettersLeft <= 7) {
            return undefined;
        }

        let letters = ""

        for (let letter of this.letterRack) {
            if(Math.random() > 0.5) {
                letters += letter.char
            }
        }

        if(letters.length == 0) {
            return undefined;
        }
        else {
            return this.game.actionCompiler.translate({
                type: OnlineActionType.Exchange,
                letters: letters
            }, this)
        }

    }

    private passTurn(): Action {
        return this.game.actionCompiler.translate({
            type:OnlineActionType.Pass
        }, this);
    }

    play(action: Action) {
        this.action$.next(action);
    }

    onCorrectWord() {
        this.wordsBeforeCard--;
        if (this.wordsBeforeCard == 0 && this.cards.length < MAXIMUM_NUMBER_OF_CARD) {
            this.drawCard();
            this.wordsBeforeCard = WORDS_BEFORE_CARD;
        }
    }

    drawCard() {
        this.cards.push(this.game.cardsAvailable[Math.floor(this.game.cardsAvailable.length * Math.random())]);
    }

    addCard(type: CardType) {
        this.cards.push(type);
    }

    getLettersFromRack(lettersToFind: Letter[]): Letter[] {
        const lettersInRack: Map<string, Letter[]> = new Map();
        for (const letter of this.letterRack) {
            const char: string = letter.char;
            const occcurences: Letter[] | undefined = lettersInRack.get(char);
            if (occcurences) {
                occcurences.push(letter);
                continue;
            }
            lettersInRack.set(char, [letter]);
        }

        const lettersFromRack = [];
        for (const letterToFind of lettersToFind) {
            const charToFind = letterToFind.char;
            const lettersLeft = lettersInRack.get(charToFind);
            if (!lettersLeft) {
                throw Error('Some letters are invalid');
            }
            const letterToAdd = lettersLeft.shift();
            if (!letterToAdd) {
                throw Error('Some letters are invalid');
            }
            lettersFromRack.push(letterToAdd);
        }
        return lettersFromRack;
    }

    removeLetterFromRack(letters: Letter[]) {
        const charIndexes: Map<string, number[]> = new Map();
        for (let rackIndex = 0; rackIndex < this.letterRack.length; rackIndex++) {
            const char = this.letterRack[rackIndex].char;
            const indexes = charIndexes.get(char);
            if (indexes) {
                indexes.push(rackIndex);
            } else {
                charIndexes.set(char, [rackIndex]);
            }
        }
        const indexesToRemove: number[] = [];
        for (const letter of letters) {
            const char = letter.char;
            const indexes = charIndexes.get(char);
            if (!indexes) {
                throw Error('The letter you trying to remove is not in letter rack');
            }
            const indexToRemove = indexes.shift();
            if (indexToRemove === undefined) {
                throw Error('The letter you trying to remove is not in letter rack');
            }
            indexesToRemove.push(indexToRemove);
        }
        indexesToRemove.sort();
        while (indexesToRemove.length) {
            this.letterRack.splice(indexesToRemove.pop() as number, 1);
        }
    }

    printLetterRack(): string {
        let letterRackString = '';
        for (const letter of this.letterRack) {
            letterRackString += letter.char + ',';
        }
        return letterRackString.slice(0, letterRackString.length - 1);
    }

    get isLetterRackEmpty(): boolean {
        return this.letterRack.length === 0;
    }

    get isLetterRackFull(): boolean {
        return this.letterRack.length === LetterBag.playerLetterCount;
    }

    static actionProbability = { play: 0.8, exchange: 0.1, pass: 0.1 };
    static placementProbability = { sixOrLess: 0.4, sevenToTwelve: 0.3, other: 0.3 };
    static botPointSetting = {
        sixOrLess: {
            prob: 0.4,
            value: 6,
        },
        sevenToTwelve: {
            prob: 0.3,
            value: 12,
        },
        other: {
            prob: 0.3,
            value: 18,
        },
    };
}
