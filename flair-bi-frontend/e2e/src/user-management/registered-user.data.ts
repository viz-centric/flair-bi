import { User } from '../user-data';

export class RegisteredUser extends User {

    private _firstName: string;
    private _lastName: string;
    private _email: string;
    private _activated: boolean;
    private _lang: string;
    private _profiles: string[];

    constructor(username: string, password: string, firstName: string, lastName: string, email: string, activated: boolean, lang: string, profiles: string[]) {
        super(username, password);
        this._firstName = firstName;
        this._lastName = lastName;
        this._email = email;
        this._activated = activated;
        this._lang = lang;
        this._profiles = profiles;
    }

    /**
     * Getter firstName
     * @return {string}
     */
    public get firstName(): string {
        return this._firstName;
    }

    /**
     * Getter lastName
     * @return {string}
     */
    public get lastName(): string {
        return this._lastName;
    }

    /**
     * Getter email
     * @return {string}
     */
    public get email(): string {
        return this._email;
    }

    /**
     * Getter activated
     * @return {boolean}
     */
    public get activated(): boolean {
        return this._activated;
    }

    /**
     * Getter lang
     * @return {string}
     */
    public get lang(): string {
        return this._lang;
    }

    /**
     * Getter profiles
     * @return {string[]}
     */
    public get profiles(): string[] {
        return this._profiles;
    }

    /**
     * Setter firstName
     * @param {string} value
     */
    public set firstName(value: string) {
        this._firstName = value;
    }

    /**
     * Setter lastName
     * @param {string} value
     */
    public set lastName(value: string) {
        this._lastName = value;
    }

    /**
     * Setter email
     * @param {string} value
     */
    public set email(value: string) {
        this._email = value;
    }

    /**
     * Setter activated
     * @param {boolean} value
     */
    public set activated(value: boolean) {
        this._activated = value;
    }

    /**
     * Setter lang
     * @param {string} value
     */
    public set lang(value: string) {
        this._lang = value;
    }

    /**
     * Setter profiles
     * @param {string[]} value
     */
    public set profiles(value: string[]) {
        this._profiles = value;
    }

}