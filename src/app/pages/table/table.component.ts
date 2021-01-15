import { Location, DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnInit,
        Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent implements AfterViewInit {

  @ViewChild('tableHeader', { static: true }) tableHeader: ElementRef;
  @ViewChild('tableContent', { static: true }) tableContent: ElementRef;

  constructor(private location: Location, private renderer: Renderer2,
              private elRef: ElementRef, @Inject(DOCUMENT) private document,
              private router: Router) { }

  ngAfterViewInit(): void {
    this.getData(history.state);
  }

  getData(data) {
    if(data[0] === undefined) this.router.navigateByUrl('/enterjson');
    
    //Get first object for extracting keys and values
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

    //Go through array of data and get values of these objects in order to fill in table content
    for(let i = 0; i < Object.values(data).length; i++) {
      let length = Object.keys(data).length;
      if(i == (length - 1)) break;

      const values = Object.values<string>(data[i]);
      const tr = document.createElement('tr');

      for(let j = 0; j < values.length; j++) {
        const renderer = this.renderer;
        const td = document.createElement('td');
        const value = renderer.createText(values[j]);
  
        renderer.appendChild(td, value);
        renderer.appendChild(tr, td);        
      }
      
      this.renderer.appendChild(this.tableContent.nativeElement, tr);
    }

    let allRows = this.tableContent.nativeElement.querySelectorAll('tr');
    for(let i = 0; i < allRows.length; i++ ) {
      let row = allRows[i];
      let allCells = row.querySelectorAll('td');
      let cellValues = [];

      for(let j = 0; j < allCells.length; j++) {
        cellValues.push(allCells[j].textContent);
      }

      row.addEventListener('click', this.editData.bind(this, cellValues, objectKeys));
    }
  }

  editData(cellValues, titles) {
    this.router.navigateByUrl('/editing', { state: { values: cellValues, titles: titles } });
  }

}
