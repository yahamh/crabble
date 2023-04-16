import { Md5 } from 'ts-md5';
import { Service } from 'typedi';

@Service()
export class PasswordEncryption {
    static encryptPassword(password: string): string {
        return Md5.hashStr(password);
    }
}
