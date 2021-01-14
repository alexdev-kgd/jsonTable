import { Location, DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.sass']
})
export class TableComponent implements OnInit {

  @ViewChild('tableHeader', { static: true }) tableHeader: ElementRef;

  constructor(private location: Location, private renderer: Renderer2,
              private elRef: ElementRef, @Inject(DOCUMENT) private document) { }

  ngOnInit(): void {
    this.getData(history.state);
  }

  getData(data) {
    if(!data) return;
    
    //Get first object for extracting keys
    let dataObject = data[0];
    let objectKeys = Object.keys(dataObject);

    //Go through these keys and implement them into DOM as a table titles
    for(let i = 0; i < objectKeys.length; i++) {
      const renderer = this.renderer
      const th = document.createElement('th');
      const title = renderer.createText(objectKeys[i]);

      renderer.appendChild(th, title);
      renderer.appendChild(this.tableHeader.nativeElement, th);
    }
  }

}
