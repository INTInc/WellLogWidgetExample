import { Component, ViewChild } from '@angular/core';
import { WellLogComponent } from './welllog/welllog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(WellLogComponent) welllog: WellLogComponent;
  title = 'app';
  public zoomIn(event) {
    this.welllog.zoomIn();
  }
  public zoomOut(event) {
    this.welllog.zoomOut();
  }
}
