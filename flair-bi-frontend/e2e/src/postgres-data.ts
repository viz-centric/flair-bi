export class PostgresData {
    private _connectionName: string;
    private _serverAddress: string;
    private _port: string;
    private _databaseName: string;
    private _connectionParams: string;
    private _username: string;
    private _password: string;
    private _datasource: string;



    constructor(connectionName: string,
        serverAddress: string,
        port: string,
        databaseName: string,
        connectionParams: string,
        username: string,
        password: string,
        datasource: string) {
        this._connectionName = connectionName;
        this._serverAddress = serverAddress;
        this._port = port;
        this._databaseName = databaseName;
        this._connectionParams = connectionParams;
        this._username = username;
        this._password = password;
        this._datasource = datasource;
    }


    /**
     * Getter connectionName
     * @return {string}
     */
    public get connectionName(): string {
        return this._connectionName;
    }

    /**
     * Getter serverAddress
     * @return {string}
     */
    public get serverAddress(): string {
        return this._serverAddress;
    }

    /**
     * Getter port
     * @return {string}
     */
    public get port(): string {
        return this._port;
    }

    /**
     * Getter databaseName
     * @return {string}
     */
    public get databaseName(): string {
        return this._databaseName;
    }

    /**
     * Getter connectionParams
     * @return {string}
     */
    public get connectionParams(): string {
        return this._connectionParams;
    }

    /**
     * Getter username
     * @return {string}
     */
    public get username(): string {
        return this._username;
    }

    /**
     * Getter password
     * @return {string}
     */
    public get password(): string {
        return this._password;
    }

    /**
     * Getter datasource
     * @return {string}
     */
    public get datasource(): string {
        return this._datasource;
    }

    /**
     * Setter connectionName
     * @param {string} value
     */
    public set connectionName(value: string) {
        this._connectionName = value;
    }

    /**
     * Setter serverAddress
     * @param {string} value
     */
    public set serverAddress(value: string) {
        this._serverAddress = value;
    }

    /**
     * Setter port
     * @param {string} value
     */
    public set port(value: string) {
        this._port = value;
    }

    /**
     * Setter databaseName
     * @param {string} value
     */
    public set databaseName(value: string) {
        this._databaseName = value;
    }

    /**
     * Setter connectionParams
     * @param {string} value
     */
    public set connectionParams(value: string) {
        this._connectionParams = value;
    }

    /**
     * Setter username
     * @param {string} value
     */
    public set username(value: string) {
        this._username = value;
    }

    /**
     * Setter password
     * @param {string} value
     */
    public set password(value: string) {
        this._password = value;
    }

    /**
     * Setter datasource
     * @param {string} value
     */
    public set datasource(value: string) {
        this._datasource = value;
    }


}

export let connectionData =
    new PostgresData("postgres-e2e-connection",
        "localhost",
        "5432",
        "services",
        "",
        "postgres",
        "admin",
        "transactions");