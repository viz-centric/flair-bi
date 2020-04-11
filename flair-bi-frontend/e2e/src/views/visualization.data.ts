import { VizMeasureData } from './viz-measure.data';
import { VizDimensionData } from './viz-dimension.data';
import { VizFilterData } from './viz-filter.data';

export class VisualizationData {

    private _measures: VizMeasureData[];
    private _dimensions: VizDimensionData[];
    private _filters: VizFilterData[];
    private _favouriteFilters: string[];


    constructor(measures: VizMeasureData[], dimensions: VizDimensionData[], filters: VizFilterData[], favouriteFilters: string[]) {
        this._measures = measures;
        this._dimensions = dimensions;
        this._filters = filters;
        this._favouriteFilters = favouriteFilters;
    }


    /**
     * Getter measures
     * @return {VizMeasureData[]}
     */
    public get measures(): VizMeasureData[] {
        return this._measures;
    }

    /**
     * Getter dimensions
     * @return {VizDimensionData[]}
     */
    public get dimensions(): VizDimensionData[] {
        return this._dimensions;
    }

    /**
     * Getter filters
     * @return {VizFilterData[]}
     */
    public get filters(): VizFilterData[] {
        return this._filters;
    }

    /**
     * Getter favouriteFilters
     * @return {string[]}
     */
    public get favouriteFilters(): string[] {
        return this._favouriteFilters;
    }

    /**
     * Setter measures
     * @param {VizMeasureData[]} value
     */
    public set measures(value: VizMeasureData[]) {
        this._measures = value;
    }

    /**
     * Setter dimensions
     * @param {VizDimensionData[]} value
     */
    public set dimensions(value: VizDimensionData[]) {
        this._dimensions = value;
    }

    /**
     * Setter filters
     * @param {VizFilterData[]} value
     */
    public set filters(value: VizFilterData[]) {
        this._filters = value;
    }

    /**
     * Setter favouriteFilters
     * @param {string[]} value
     */
    public set favouriteFilters(value: string[]) {
        this._favouriteFilters = value;
    }


}