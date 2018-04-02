import { CurveService } from '../services/index';

const depthColumnName = 'Depth';
const curveMin = [21, 2];
const curveMax = [189, 3];
class CurveBinding extends geotoolkit.data.DataBinding {
    private dataTable: geotoolkit.data.DataTable;
    constructor(dataTable: geotoolkit.data.DataTable) {
        super();
        this.dataTable = dataTable;
    }
    public accept(node) {
        return node instanceof geotoolkit.welllog.LogCurve;
    }
    public bind(curve, data) {
        if (data == null) {
            return;
        }
        const id = curve.getName();
        const index = this.dataTable.indexOfColumn(this.dataTable.getColumnByName(id));
        const source = data.getCurveSource(id);
        if (source != null) {
            curve.setData(source, true, true);
        }
        curve.setNormalizationLimits(curveMin[index - 1], curveMax[index - 1]);
    }
    public unbind(curve, data) {
        // TODO: We are not allowed to set data = null
    }
}
geotoolkit.obfuscate(CurveBinding, geotoolkit.data.DataBinding);

export class RemoteDataSource extends geotoolkit.data.DataSource {
    private curveBinding: geotoolkit.data.DataBinding;
    private dataset: geotoolkit.data.DataSet;
    private logData: geotoolkit.data.DataTable;
    private onWidgetDataUpdated: any;
    private onDataSetDataFetching: any;
    private widget: any;
    private constructor(private curveService: CurveService) {
        super();
        this.onWidgetDataUpdated = this.fetchDataSet.bind(this);
        this.onDataSetDataFetching = this.dataSetDataFetching.bind(this);
    }
    static async create(curveService: CurveService) {
        const datasource = new RemoteDataSource(curveService);
        await datasource.init();
        return datasource;
    }
    private async init() {
        // load meta data
        const depthColumnMetaData = await this.curveService.getCurveMetaData(depthColumnName);
        if (!depthColumnMetaData) {
            throw new Error('Wrong depth column meta data');
        }
        // Load existing data range from server
        const range = await this.curveService.getCurveRange(depthColumnName);
        if (!range) {
            throw new Error('Wrong depth range');
        }
        // Request existing supported curves
        const curves = await this.curveService.getCurvesList();
        // Create a data table to keep some data in memory
        this.logData = new geotoolkit.data.DataTable({
            cols: curves['data'],
            colsdata: []
        });
        // Create dataset, which keeps a dataset range and manage data to be loaded
        this.dataset = new geotoolkit.data.DataSet();
        this.dataset.on(geotoolkit.data.Events.DataFetching, this.onDataSetDataFetching);
        // Add log data to data set
        this.dataset.addTable(this.logData, new geotoolkit.util.Range( +range['min'], +range['max']));
    }
    private fetchDataSet() {
        // get visible limits range from widget
        const limits = this.widget.getVisibleDepthLimits();
        // gets current scale
        const scale = Math.abs(this.widget.getTrackContainer().getSceneTransform().getScaleY());
        // fetch data range
        this.dataset.fetch(limits, scale);
    }
    /**
     * This method is called by dataset to receive data from serve
     * @param {string} type type of event
     * @param {object} source source of event
     * @param {object} args arguments
     */
    private async dataSetDataFetching(type, source, args) {
        // request a data range from server
        const cells = await this.getRangedData(args['limits'], args['scale'], this.dataset.isDecimationEnabled());
        // call callback and pass received data
        args['callback'](null, [cells]);
    }
    public connect(widget) {
        this.widget = widget;
        const binding = widget.getDataBinding();
        const dataTable = this.dataset.getTable(0);
        this.curveBinding = this.curveBinding || new CurveBinding(dataTable);
        binding.add(this.curveBinding);
        widget.on(geotoolkit.welllog.widgets.WellLogWidget.Events.VisibleDepthLimitsChanged, this.onWidgetDataUpdated);
        widget.setData(this);
        widget.setDepthLimits(this.dataset.getFullIndexRange().getLow(), this.dataset.getFullIndexRange().getHigh());
    }
    public disconnect(widget) {
        widget.off(geotoolkit.welllog.widgets.WellLogWidget.Events.VisibleDepthLimitsChanged, this.onWidgetDataUpdated);
        const binding = widget.getDataBinding();
        binding.remove(this.curveBinding);
        widget.setData(null);
    }
    /**
     * Get curve's ranged data from remote data provider
     * @private
     * @param {geotoolkit.util.Range} range requested range
     * @param {number} scale scale
     * @param {boolean} useDecimation is decimation used
     * @returns {*}
     */
    private async getRangedData(range, scale, useDecimation) {
        const columns = [];
        for (let i = 0; i < this.logData.getNumberOfColumns(); ++i) {
            columns.push(this.logData.getColumn(i).getName());
        }
        return this.curveService.getCurvesData(columns, range, scale, useDecimation);
    }
    /**
     * Add curve to update
     * @param {string} curveId curve's id
     */
    public async addCurve(curveId) {
        const curveMetaData = await this.curveService.getCurveMetaData(curveId);
        this.logData.addColumn(curveMetaData);
    }
    /**
     * Return curve data source
     * @param id
     * @returns {geotoolkit.welllog.data.LogCurveDataSource}
     */
    public getCurveSource(id) {
        const depths = this.dataset.getIndexColumn(0);
        const values = this.dataset.getTable(0).getColumnByName(id);
        return values !== null ? (new geotoolkit.welllog.data.LogCurveDataSource({
                'depths': depths,
                'values': values,
                'name': id
            })) :
            null;
    }
}
geotoolkit.obfuscate(RemoteDataSource, geotoolkit.data.DataSource);

