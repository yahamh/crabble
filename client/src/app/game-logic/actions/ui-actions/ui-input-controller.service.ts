import { Injectable } from '@angular/core';
import { Action } from '@app/game-logic/actions/action';
import { ActionValidatorService } from '@app/game-logic/actions/action-validator/action-validator.service';
import { PassTurn } from '@app/game-logic/actions/pass-turn';
import { UIAction } from '@app/game-logic/actions/ui-actions/ui-action';
import { UIPlace } from '@app/game-logic/actions/ui-actions/ui-place';
import { ENTER, ESCAPE } from '@app/game-logic/constants';
import { BoardService } from '@app/game-logic/game/board/board.service';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { InputComponent, InputType, UIInput, WheelRoll } from '@app/game-logic/interfaces/ui-input';
import { User } from '@app/game-logic/player/user';
import { PointCalculatorService } from '@app/game-logic/point-calculator/point-calculator.service';
import { WordSearcher } from '@app/game-logic/validator/word-search/word-searcher.service';
import { DragAndDropService } from '@app/services/drag-and-drop.service';
import { UIExchange } from './ui-exchange';

@Injectable({
    providedIn: 'root',
})
export class UIInputControllerService {
    static defaultComponent = InputComponent.Horse;
    activeComponent = InputComponent.Chatbox;
    activeAction: UIAction | null = null;

    get canBeExecuted(): boolean {
        return this.activeAction ? this.activeAction.canBeCreated : false;
    }

    constructor(
        private avs: ActionValidatorService,
        private info: GameInfoService,
        private pointCalculator: PointCalculatorService,
        private wordSearcher: WordSearcher,
        private boardService: BoardService,
        private dragAndDropService: DragAndDropService
    ) {
        this.info.endTurn$?.subscribe(() => {
            if (this.activeAction instanceof UIPlace) {
                this.discardAction();
            }
        });
    }

    receive(input: UIInput) {
        if (this.info.isEndOfGame) {
            return;
        }
        this.processInput(input);
    }

    cancel() {
        this.discardAction();
        this.dragAndDropService.cancel();
        this.activeComponent = InputComponent.Outside;
    }

    confirm() {
        if(this.dragAndDropService.isPlacementRight()) {

            const placement = this.dragAndDropService.placedLettersInOrder;

            if(!placement) {
                return;
            }

            this.activeAction = new UIPlace(
                this.info,
                this.pointCalculator,
                this.wordSearcher,
                this.boardService
            );

            (this.activeAction as UIPlace).pointerPosition = {
                x: placement.pos.x,
                y: placement.pos.y
            };
            (this.activeAction as UIPlace).direction = placement.direction;

            this.dragAndDropService.cancel();

            for(const key of placement.keyStrokes) {
                this.activeAction.receiveKey(key);
            }
        }
        
        if (!this.activeAction || !this.canBeExecuted) {
            return;
        }
        const newAction: Action | null = this.activeAction.create();
        if (!newAction) {
            return;
        }
        this.discardAction();
        this.avs.sendAction(newAction);
        this.activeComponent = InputComponent.Outside;
    }

    exchange(indexes: number[]) {
        this.activeAction = new UIExchange(this.info.user);
        for(const index of indexes) {
            (this.activeAction as UIExchange).concernedIndexes.add(index)
        }

        if (!this.activeAction || !this.canBeExecuted) {
            return;
        }
        const newAction: Action | null = this.activeAction.create();
        if (!newAction) {
            return;
        }
        this.discardAction();
        this.avs.sendAction(newAction);
        this.activeComponent = InputComponent.Outside;
    }

    pass(user: User) {
        this.avs.sendAction(new PassTurn(user));
    }

    private processInput(input: UIInput) {
        this.processInputComponent(input);
        this.updateActiveAction(input.type);
        this.processInputType(input);
    }

    private processInputComponent(input: UIInput) {
        if (input.from) {
            this.activeComponent = input.from;
            return;
        }
        if (this.activeComponent === InputComponent.Outside) {
            this.activeComponent = UIInputControllerService.defaultComponent;
        }
    }

    private updateActiveAction(inputType: InputType): void {
        switch (this.activeComponent) {
            case InputComponent.Board:
                if (!(this.activeAction instanceof UIPlace)) {
                    this.discardAction();
                    this.activeAction = new UIPlace(this.info, this.pointCalculator, this.wordSearcher, this.boardService);
                    return;
                }
                break;
        }
    }

    private processInputType(input: UIInput) {
        switch (input.type) {
            case InputType.LeftClick:
                this.processLeftCLick(input.args);
                break;
            case InputType.RightClick:
                this.processRightCLick(input.args as number);
                break;
            case InputType.KeyPress:
                this.processKeyPress(input.args);
                break;
            case InputType.MouseRoll:
                this.processMouseRoll(input.args as WheelRoll);
                break;
            default:
                throw Error('Unresolved input of type ' + input.type);
        }
    }

    discardAction() {
        if (this.activeAction) {
            this.activeAction.destroy();
        }
        this.activeAction = null;
    }

    private processMouseRoll(args?: WheelRoll) {
        if (this.activeAction) {
            this.activeAction.receiveRoll(args);
        }
    }

    private processKeyPress(args: unknown) {
        const keyPressed = args as string;
        switch (keyPressed) {
            case ESCAPE:
                if (this.activeComponent === InputComponent.Chatbox) {
                    return;
                }
                this.discardAction();
                this.activeComponent = InputComponent.Outside;
                break;
            case ENTER:
                this.confirm();
                break;
            default:
                if (this.activeAction) {
                    this.activeAction.receiveKey(keyPressed);
                    return;
                }
        }
    }

    private processLeftCLick(args: unknown) {
        if (this.activeAction !== null) {
            this.activeAction.receiveLeftClick(args);
            return;
        }
    }

    private processRightCLick(args: number) {
        if (this.activeAction !== null) {
            this.activeAction.receiveRightClick(args);
            return;
        }
    }
}
