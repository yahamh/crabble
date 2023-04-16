import { Language } from '@app/enums/language';
import * as texts from '../../assets/UITexts.json';

export class UITextUtil {
    private static currentLanguage: Language = Language.fr;
    constructor() {
        console.log('texts', texts);
    }

    static getText(key: string): string {
        try {
            return (texts as any)[key][UITextUtil.currentLanguage];
        } catch (e) {
            return `${key} not found`;
        }
    }

    static switchLanguage(): void {
        UITextUtil.currentLanguage = UITextUtil.currentLanguage == Language.fr ? Language.en : Language.fr;
    }

    static get language(): Language {
        return UITextUtil.currentLanguage;
    }

    static set language(Newlanguage: Language) {
        UITextUtil.currentLanguage = Newlanguage;
    }
}
