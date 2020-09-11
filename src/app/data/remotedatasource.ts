import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { DataTable } from '@int/geotoolkit/data/DataTable';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { DataSource } from '@int/geotoolkit/data/DataSource';
import { DataSet } from '@int/geotoolkit/data/DataSet';
import { Events } from '@int/geotoolkit/data/Events';
import { Range } from '@int/geotoolkit/util/Range';
import { Events as WidgetEvents } from '@int/geotoolkit/welllog/widgets/Events';
import { LogCurveDataSource } from '@int/geotoolkit/welllog/data/LogCurveDataSource';
import { obfuscate } from '@int/geotoolkit/lib';
import { CurveService } from '../services';

const depthColumnName = 'Depth';
const curveMin = [21, 2];
const curveMax = [189, 3];
class CurveBinding extends DataBinding {
  private dataTable: DataTable;
  constructor(dataTable: DataTable) {
    super();
    this.dataTable = dataTable;
  }
  public accept(node) {
    return node instanceof LogCurve;
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
obfuscate(CurveBinding);

export class RemoteDataSource extends DataSource {
  private curveBinding: DataBinding;
  private dataset: DataSet;
  private logData: DataTable;
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
    this.logData = new DataTable({
      cols: curves['data'],
      colsdata: []
    });
    // Create dataset, which keeps a dataset range and manage data to be loaded
    this.dataset = new DataSet();
    this.dataset.on(Events.DataFetching, this.onDataSetDataFetching);
    // Add log data to data set
    this.dataset.addTable(this.logData, new Range( +range['min'], +range['max']));
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
    widget.on(WidgetEvents.VisibleDepthLimitsChanged, this.onWidgetDataUpdated);
    widget.setData(this);
    widget.setDepthLimits(this.dataset.getFullIndexRange().getLow(), this.dataset.getFullIndexRange().getHigh());
  }
  public disconnect(widget) {
    widget.off(WidgetEvents.VisibleDepthLimitsChanged, this.onWidgetDataUpdated);
    const binding = widget.getDataBinding();
    binding.remove(this.curveBinding);
    widget.setData(null);
  }
  /**
   * Get curve's ranged data from remote data provider
   * @private
   * @param {Range} range requested range
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
   * @returns {LogCurveDataSource}
   */
  public getCurveSource(id) {
    const depths = this.dataset.getIndexColumn(0);
    const values = this.dataset.getTable(0).getColumnByName(id);
    return values !== null ? (new LogCurveDataSource({
        'depths': depths,
        'values': values,
        'name': id
      })) :
      null;
  }
}
obfuscate(RemoteDataSource);

