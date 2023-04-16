import { LiveDict } from '@app/dictionary-manager/default-dictionary';
import { DictionaryServerService } from '@app/dictionary-manager/dictionary-server.service';
import { MAX_WORD_LENGTH, NOT_FOUND, RACK_LETTER_COUNT, RESET, START_OF_STRING } from '@app/game/game-logic/constants';
import { Dictionary } from '@app/game/game-logic/validator/dictionary/dictionary';
import { Service } from 'typedi';
import { Letter } from '../../board/letter.interface';
import { ValidWord } from '../../player/valid-word';
import { DictInitialSearchSettings, DictionaryHelper, DictRegexSettings, DictSubSearchSettings, DictWholeSearchSettings } from './dictionary-helper';

@Service()
export class DictionaryService {
    liveDictMap: Map<string, LiveDict> = new Map();
    liveGamesMap: Map<string, string> = new Map();
    dynamicWordList: Set<string>[] = [];
    dictionaryHelper = new DictionaryHelper();

    constructor(private dictionaryServer: DictionaryServerService) {}

    makeGameDictionary(gameToken: string, dictTitle: string) {
        const uniqueName = this.dictionaryServer.getUniqueName(dictTitle);
        const liveDict = this.liveDictMap.get(uniqueName);
        if (!liveDict) {
            const dict = this.dictionaryServer.getDictByTitle(dictTitle);
            const words = this.getWords(dict as Dictionary);

            this.dynamicWordList = words;

            const newLiveDict: LiveDict = {
                currentUsage: 1,
                dynamicWordList: words,
            };
            this.liveDictMap.set(uniqueName, newLiveDict);
        } else {
            liveDict.currentUsage++;
            this.liveDictMap.set(uniqueName, liveDict);
        }
        this.liveGamesMap.set(gameToken, uniqueName);
    }

    deleteGameDictionary(gameToken: string) {
        const uniqueName = this.liveGamesMap.get(gameToken);
        if (!uniqueName) {
            return;
        }
        const liveDict = this.liveDictMap.get(uniqueName) as LiveDict;
        liveDict.currentUsage--;
        if (liveDict.currentUsage === 0) {
            this.liveDictMap.delete(uniqueName);
        } else {
            this.liveDictMap.set(uniqueName, liveDict);
        }
        this.liveGamesMap.delete(gameToken);
    }

    isWordInDict(word: string, gameToken: string): boolean {
        const uniqueName = this.liveGamesMap.get(gameToken);
        if (!uniqueName) {
            return false;
        }
        const liveDict = this.liveDictMap.get(uniqueName) as LiveDict;

        const wordLength = word.length;
        if (wordLength > MAX_WORD_LENGTH) {
            return false;
        }
        const words = liveDict.dynamicWordList[wordLength];
        return words.has(word.toLowerCase());
    }

    private getWords(dictionary: Dictionary): Set<string>[] {
        const words: Set<string>[] = [];
        for (let i = 0; i <= MAX_WORD_LENGTH; i++) {
            words.push(new Set());
        }
        dictionary.words.forEach((word) => {
            let wordLength = word.length;
            for (wordLength; wordLength <= MAX_WORD_LENGTH; wordLength++) {
                words[wordLength].add(word);
            }
        });
        return words;
    }

    wordGen(partWord: ValidWord): ValidWord[] {
        const wordList: ValidWord[] = [];
        const tmpWordList: ValidWord[] = [];

        let letterCountOfPartWord = 0;
        letterCountOfPartWord = this.dictionaryHelper.countNumberOfLetters(partWord, letterCountOfPartWord);

        let maxDictWordLength = 0;
        const missingLetters = partWord.word.length - letterCountOfPartWord + partWord.leftCount + partWord.rightCount;
        if (missingLetters === 0) {
            return wordList;
        }
        if (missingLetters > RACK_LETTER_COUNT) {
            maxDictWordLength = letterCountOfPartWord + RACK_LETTER_COUNT;
        } else {
            maxDictWordLength = letterCountOfPartWord + missingLetters;
        }
        if (maxDictWordLength > MAX_WORD_LENGTH) {
            maxDictWordLength = MAX_WORD_LENGTH;
        }

        const dictWords = this.dynamicWordList[maxDictWordLength];

        if (partWord.word.includes('-')) {
            this.dictionaryHelper.getSubWordsOfPartWord(partWord, tmpWordList);

            const tmpDict: ValidWord[] = [];
            const tmpDict2: ValidWord[] = [];
            const foundIndex: number = START_OF_STRING;
            let oldSubWordLength: number = RESET;
            const initialSettings: DictInitialSearchSettings = { partWord, dictWords, tmpWordList, letterCountOfPartWord, tmpDict, foundIndex };
            oldSubWordLength = this.dictionaryHelper.initialDictionarySearch(initialSettings);
            const subSettings: DictSubSearchSettings = { tmpWordList, tmpDict2, oldSubWordLength, wordList };
            this.dictionaryHelper.subDictionarySearch(initialSettings, subSettings);
        } else {
            const wholeSettings: DictWholeSearchSettings = { partWord, dictWords, letterCountOfPartWord, wordList };
            this.dictionaryHelper.wholePartWordDictionarySearch(wholeSettings);
        }
        return wordList;
    }

    regexValidation(dictWord: ValidWord, placedLetters: string, botLetterRack: Letter[]): string {
        const letterRack = botLetterRack;
        const mapRack = new Map<string, number>();
        const wordLength = dictWord.word.length;

        let placedWord = this.dictionaryHelper.placedWordReformat(placedLetters);
        this.dictionaryHelper.addLetterRackToMap(letterRack, mapRack);

        const regex = new RegExp(placedWord.toLowerCase());
        const index = dictWord.word.search(regex);
        if (index === NOT_FOUND) {
            return 'false';
        }
        const regexSettings: DictRegexSettings = { dictWord, placedWord, mapRack };
        placedWord = this.dictionaryHelper.validateLeftOfPlacedWord(regexSettings);
        placedWord = this.dictionaryHelper.validateMiddleOfPlacedWord(regexSettings);
        placedWord = this.dictionaryHelper.validateRightOfPlacedWord(regexSettings, wordLength);

        return dictWord.word === placedWord.toLowerCase() ? placedWord : 'false';
    }
}
