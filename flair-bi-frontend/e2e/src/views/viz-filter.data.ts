export class VizFilterData {
    private _filterName: string;
    private _filterValues: string[];


    constructor(filterName: string, filterValues: string[]) {
        this._filterName = filterName;
        this._filterValues = filterValues;
    }

    /**
     * Getter filterName
     * @return {string}
     */
    public get filterName(): string {
        return this._filterName;
    }

    /**
     * Getter filterValues
     * @return {string[]}
     */
    public get filterValues(): string[] {
        return this._filterValues;
    }

    /**
     * Setter filterName
     * @param {string} value
     */
    public set filterName(value: string) {
        this._filterName = value;
    }

    /**
     * Setter filterValues
     * @param {string[]} value
     */
    public set filterValues(value: string[]) {
        this._filterValues = value;
    }

}