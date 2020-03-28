export class DashboardData {
    private _name: string;
    private _category: string;
    private _description: string;
    private _datasource: string;


    constructor(name: string, category: string, description: string, datasource: string) {
        this._name = name;
        this._category = category;
        this._description = description;
        this._datasource = datasource;
    }

    /**
     * Getter name
     * @return {string}
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Getter category
     * @return {string}
     */
    public get category(): string {
        return this._category;
    }

    /**
     * Getter description
     * @return {string}
     */
    public get description(): string {
        return this._description;
    }

    /**
     * Getter datasource
     * @return {string}
     */
    public get datasource(): string {
        return this._datasource;
    }

    /**
     * Setter name
     * @param {string} value
     */
    public set name(value: string) {
        this._name = value;
    }

    /**
     * Setter category
     * @param {string} value
     */
    public set category(value: string) {
        this._category = value;
    }

    /**
     * Setter description
     * @param {string} value
     */
    public set description(value: string) {
        this._description = value;
    }

    /**
     * Setter datasource
     * @param {string} value
     */
    public set datasource(value: string) {
        this._datasource = value;
    }

}

export let dashboardData = new DashboardData("e2e-dashboard", "e2e", "this is a e2e dashboard", "transactions (posts)");