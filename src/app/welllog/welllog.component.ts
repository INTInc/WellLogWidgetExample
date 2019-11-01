import { Component, AfterViewInit, ViewChild, ElementRef, HostListener, OnInit } from '@angular/core';
import { TemplateService, CurveService } from '../services/index';
import { RemoteDataSource } from '../data/index';
@Component({
  selector: 'app-welllog-component',
  templateUrl: './welllog.component.html',
  styleUrls: ['./welllog.component.css']
})
export class WellLogComponent implements OnInit, AfterViewInit {
  @ViewChild('plot') canvas: ElementRef;
  @ViewChild('parent') parent: ElementRef;
  private plot: geotoolkit.plot.Plot;
  private widget: geotoolkit.welllog.widgets.WellLogWidget;
  private dataSource: RemoteDataSource;
  constructor(private templateService: TemplateService, private curveService: CurveService) {

  }
  ngOnInit() {
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
    this.plot = new geotoolkit.plot.Plot({
      'canvasElement': this.canvas.nativeElement,
      'root': new geotoolkit.scene.Group({ 'children': [widget] })
        .setAutoModelLimitsMode(true)
        .setLayout(new geotoolkit.layout.CssLayout()),
      'autoUpdate': true
    });
    // init tools container to support interactions with widget
    const toolContainer = new geotoolkit.controls.tools.ToolsContainer(this.plot);
    toolContainer.add(widget.getTool());
    widget.invalidate();
    this.widget = widget;
  }
  private async initData() {
    const dataSource = await RemoteDataSource.create(this.curveService);
    this.setDataSource(dataSource);
  }
  private createWidget(welltemplate: object): geotoolkit.welllog.widgets.WellLogWidget {
    const widget = new geotoolkit.welllog.widgets.WellLogWidget({
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
