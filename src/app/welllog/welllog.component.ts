import { Plot } from '@int/geotoolkit/plot/Plot';
import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';
import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { TemplateService, CurveService } from '../services';
import { RemoteDataSource } from '../data';
@Component({
  selector: 'app-welllog-component',
  templateUrl: './welllog.component.html',
  styleUrls: ['./welllog.component.css']
})
export class WellLogComponent implements AfterViewInit {
  @ViewChild('plot') canvas: ElementRef;
  @ViewChild('parent') parent: ElementRef;
  private plot: Plot;
  private widget: WellLogWidget;
  private dataSource: RemoteDataSource;
  constructor(private templateService: TemplateService, private curveService: CurveService) {

  }
  ngAfterViewInit() {
    this.init();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resize(event);
  }
  public zoomIn() {
    this.widget.scale(2);
  }
  public zoomOut() {
    this.widget.scale(0.5);
  }
  public setDataSource(dataSource: RemoteDataSource) {
    if (this.dataSource) {
      this.dataSource.disconnect(this.widget);
    }
    dataSource.connect(this.widget);
    this.widget.updateLayout();
    this.dataSource = dataSource;
  }
  private async init() {
    const wellTemplate = await this.templateService.getTemplate('template1.json');
    this.initPlot(wellTemplate);
    this.initData();
    this.resize(null);
  }
  private initPlot(welltemplate: object) {
    const widget = this.createWidget(welltemplate);
    widget.setLayoutStyle({ 'left': 0, 'right': 0, 'top': 0, 'bottom': 0 });
    this.plot = new Plot({
      'canvaselement': this.canvas.nativeElement,
      'root': widget,
      'autoupdate': true
    });
    this.widget = widget;
  }
  private async initData() {
    const dataSource = await RemoteDataSource.create(this.curveService);
    this.setDataSource(dataSource);
  }
  private createWidget(welltemplate: object): WellLogWidget {
    const widget = new WellLogWidget({
      'horizontalscrollable': false,
      'verticalscrollable': true,
      'trackcontainer': {
        'border': { 'visible': false }
      },
      'border': { 'visible': false }
    });
    widget.loadTemplate(JSON.stringify(welltemplate));
    return widget;
  }
  private resize(event) {
    if (this.plot) {
      this.plot.setSize(this.parent.nativeElement.clientWidth, this.parent.nativeElement.clientHeight);
    }
  }
}
