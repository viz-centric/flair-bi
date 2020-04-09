import { Sort } from './sort.enum';

export class VizDimension {
    private _dimension: string;
    private _displayName: string;
    private _sort: Sort;


    constructor(dimension: string, displayName: string, sort: Sort) {
        this._dimension = dimension;
        this._displayName = displayName;
        this._sort = sort;
    }

    /**
     * Getter dimension
     * @return {string}
     */
    public get dimension(): string {
        return this._dimension;
    }

    /**
     * Getter displayName
     * @return {string}
     */
    public get displayName(): string {
        return this._displayName;
    }

    /**
     * Getter sort
     * @return {string}
     */
    public get sort(): Sort {
        return this._sort;
    }

    /**
     * Setter dimension
     * @param {string} value
     */
    public set dimension(value: string) {
        this._dimension = value;
    }

    /**
     * Setter displayName
     * @param {string} value
     */
    public set displayName(value: string) {
        this._displayName = value;
    }

    /**
     * Setter sort
     * @param {string} value
     */
    public set sort(value: Sort) {
        this._sort = value;
    }

}
