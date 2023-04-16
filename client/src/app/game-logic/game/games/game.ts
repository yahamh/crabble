import { Player } from '@app/game-logic/player/player';
import { Observable, Subject } from 'rxjs';
import { Letter } from '../board/letter.interface';

export abstract class Game {
    players: Player[];
    observers: string[];
    activePlayerIndex: number;
    protected isEndOfGameSubject = new Subject<void>();
    protected endTurnSubject = new Subject<void>();
    protected playerTurnsAiSubject = new Subject<string>();
    get endTurn$(): Observable<void> {
        return this.endTurnSubject;
    }
    get isEndOfGame$(): Observable<void> {
        return this.isEndOfGameSubject;
    }
    get playerTrunsAi$(): Observable<string> {
        return this.playerTurnsAiSubject;
    }
    abstract getNumberOfLettersRemaining(): number;
    abstract getLetterList(): Letter[];
    abstract start(): void;
    abstract getWinner(): Player[];
    abstract isEndOfGame(): boolean;
    abstract stop(): void;
}
