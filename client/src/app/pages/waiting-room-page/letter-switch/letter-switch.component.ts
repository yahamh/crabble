import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Letter } from '@app/game-logic/game/board/letter.interface';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-letter-switch',
    templateUrl: './letter-switch.component.html',
    styleUrls: ['./letter-switch.component.scss']
})
export class LetterSwitchComponent implements OnInit {
    readonly UIText = UITextUtil;

    dict:string[] = [];
    currentWord: Letter[] = [];
    shuffledWord: Letter[] = [];

    first: number = -1;
    second: number = -1;

    firstMove: string = "";
    secondMove: string = "";

    move: boolean = false;
    currentNext: number = -1;
    currentPre: number = -1;

    points: number = 0;
    best: number = 0;
    
    constructor(private httpClient: HttpClient, private changeDetectorRef: ChangeDetectorRef) {}

    async ngOnInit(): Promise<void> {
        if(this.dict.length == 0) {
            this.dict = (await this.httpClient.get('assets/fr.txt', { responseType: 'text' }).toPromise()).split("\n");
        }

        this.randomWord();
    }

    click(index: number) {
        if(this.first == -1) {
            this.first = index;
        }
        else if(this.first == index) {
            this.first = -1;
        }
        else {
            this.second = index;

            this.firstMove = `${(this.second - this.first)*(40+2*2)}px`
            this.secondMove = `${(this.first - this.second)*(40+2*2)}px`

            this.move = true;

            this.points++;

            setTimeout(() => {
                this.move = false;
                let tempLetter = this.shuffledWord[index];
                this.shuffledWord[index] = this.shuffledWord[this.first];
                this.shuffledWord[this.first] = tempLetter;
                
                this.changeDetectorRef.detectChanges();
                
                setTimeout(() => {
                    this.first = -1;
                    this.second = -1;

                    if(this.isWordFound()) {
                        setTimeout(() => {
                            this.next(0);
                        }, 100);
                    }
                }, 20)
            }, 100);
        }
    }

    isSelected(index: number) {
        return index == this.first;
    }

    isGood(index: number) {
        return this.shuffledWord[index].char == this.currentWord[index].char;
    }

    isNext(index: number) {
        return index <= this.currentNext;
    }

    isPre(index: number) {
        return index >= this.currentPre;
    }

    private pre(index: number) {
        this.currentPre = index;

        if(index+1 <= this.shuffledWord.length) {
            setTimeout(() => {
                this.pre(index+1);
            }, 100);
        }
    }

    private next(index: number) {
        this.currentNext = index;

        if(index+1 <= this.shuffledWord.length) {
            setTimeout(() => {
                this.next(index+1);
            }, 100);
        }
        else {
            this.randomWord();
        }
    }

    private isWordFound() {
        return this.shuffledWord.every((value, index) => this.isGood(index));
    }

    private randomWord() {
        this.currentWord = this.dict[Math.floor(Math.random() * this.dict.length)].split('').map(value => <Letter>{
            char: value.toUpperCase(),
            value: this.getCharValue(value)
        });
        do {
            this.shuffledWord = this.shuffleWord(this.currentWord);
        } while(this.isWordFound());
        this.currentNext = -1;
        this.points = 0;
        this.best = this.calculateBest();

        console.log(this.currentWord.map(value => value.char).join(""));

        this.pre(0);
    }

    private shuffleWord(word: Letter[]): Letter[] {
        let endWord = word.map(value => value);
        for (let i = 0 ; i < endWord.length ; i++) {
            let j = Math.floor(Math.random() * endWord.length);
            let tempLetter = endWord[i];
            endWord[i] = endWord[j];
            endWord[j] = tempLetter;
        }
        return endWord;
    }

    private calculateBest(): number {
        let testWord = this.shuffledWord.map(value => value);
        let score = 0;
        while(!testWord.every((value, index) => value.char == this.currentWord[index].char)) {
            let firstJ = -1;
            let firstI = -1;

            for(let i = 0 ; i < testWord.length ; i++) {
                if(testWord[i].char != this.currentWord[i].char) {
                    let j = this.currentWord.findIndex((value, index) => value.char == testWord[i].char && value.char != testWord[index].char);
                    if(firstJ == -1) {
                        firstJ = j;
                        firstI = i;
                    }

                    if(testWord[j].char == this.currentWord[i].char) {
                        score++;
                        let tempLetter = testWord[i];
                        testWord[i] = testWord[j];
                        testWord[j] = tempLetter;
                        firstJ = -1;
                        firstI = -1;
                        break;
                    }
                }
            }

            if(firstJ != -1) {
                score++;
                let tempLetter = testWord[firstI];
                testWord[firstI] = testWord[firstJ];
                testWord[firstJ] = tempLetter;
            }
        }
        return score;
    }

    private getCharValue(char: string): number {
        switch(char.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
            case 'A':
            case 'E':
            case 'I':
            case 'L':
            case 'N':
            case 'O':
            case 'R':
            case 'S':
            case 'T':
            case 'U':
                return 1;
            case 'D':
            case 'G':
            case 'M':
                return 2;
            case 'B':
            case 'C':
            case 'P':
                return 3;
            case 'F':
            case 'H':
            case 'V':
                return 4;
            case 'J':
            case 'Q':
                return 8;
            case 'K':
            case 'W':
            case 'X':
            case 'Y':
            case 'Z':
                return 10;
            default:
                return 0;
        }
    }



}
