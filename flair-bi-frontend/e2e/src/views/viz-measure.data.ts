import { AggregationType } from '../common/aggregation-type.enum';

export class VizMeasureData {

    private _measure: string;
    private _displayName: string;
    private _aggregationType: AggregationType;


    constructor(measure: string, displayName: string, aggregationType: AggregationType) {
        this._measure = measure;
        this._displayName = displayName;
        this._aggregationType = aggregationType;
    }


    /**
     * Getter measure
     * @return {string}
     */
    public get measure(): string {
        return this._measure;
    }

    /**
     * Getter displayName
     * @return {string}
     */
    public get displayName(): string {
        return this._displayName;
    }

    /**
     * Getter aggregationType
     * @return {string}
     */
    public get aggregationType(): AggregationType {
        return this._aggregationType;
    }

    /**
     * Setter measure
     * @param {string} value
     */
    public set measure(value: string) {
        this._measure = value;
    }

    /**
     * Setter displayName
     * @param {string} value
     */
    public set displayName(value: string) {
        this._displayName = value;
    }

    /**
     * Setter aggregationType
     * @param {string} value
     */
    public set aggregationType(value: AggregationType) {
        this._aggregationType = value;
    }




}