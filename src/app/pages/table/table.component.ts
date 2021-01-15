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
    console.log(data);
    //Get first object for extracting keys and values
    let dataObject = data[0],
        objectKeys = Object.keys(dataObject);

    //Go through these keys and implement them into DOM as a table titles
    this.getKeys(objectKeys);

    //Go through array of data and get values of these objects in order to fill in table content
    this.getValues(data);

    this.insertData(objectKeys);
  }

  editData(cellValues, titles) {
    this.router.navigateByUrl('/editing', { state: { values: cellValues, titles: titles } });
  }

  getKeys(objectKeys) {
    for(let i = 0; i < objectKeys.length; i++) {
      let keys = objectKeys[i];
      this.insertTitles(keys);
    }
  }

  insertTitles(keys) {
      const renderer = this.renderer,
            th = document.createElement('th'),
            title = renderer.createText(keys);
      renderer.appendChild(th, title);
      renderer.appendChild(this.tableHeader.nativeElement, th);
  }

  getValues(data) {
    for(let i = 0; i < Object.values(data).length; i++) {
      let length = Object.keys(data).length;
      if(i == (length - 1)) break;

      const values = Object.values<string>(data[i]);
      this.insertRow(values);
    }
  }

  insertRow(values) {
    const tr = document.createElement('tr');

    for(let j = 0; j < values.length; j++) {
      const renderer = this.renderer,
            td = document.createElement('td'),
            value = renderer.createText(values[j]);

      renderer.appendChild(td, value);
      renderer.appendChild(tr, td);        
    }
    
    this.renderer.appendChild(this.tableContent.nativeElement, tr);
  };

  insertData(objectKeys) {
    let allRows = this.tableContent.nativeElement.querySelectorAll('tr');
    for(let i = 0; i < allRows.length; i++ ) {
      let row = allRows[i],
          allCells = row.querySelectorAll('td'),
          cellValues = [];

      for(let j = 0; j < allCells.length; j++) {
        cellValues.push(allCells[j].textContent);
      }

      row.addEventListener('click', this.editData.bind(this, cellValues, objectKeys));
    }
  }

}
