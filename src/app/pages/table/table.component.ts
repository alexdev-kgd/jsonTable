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

    private json;
  
  ngAfterViewInit(): void {
    this.json = history.state;
    this.checkData(this.json);
  }

  checkData(data) {
    if( data.rowId !== undefined) {
      let oldData = JSON.parse(localStorage.getItem('tableData'));

      let editedJSON = this.replaceJSONRow(oldData, data);
      this.getData(editedJSON);
    } else {
      localStorage.setItem('tableData', JSON.stringify(data));

      this.getData(data);
    }
  }

  getData(data) {
    if(data[0] === undefined) this.router.navigateByUrl('/enterjson');

    //Get first object for extracting keys and values
    let dataObject = data[0],
        objectKeys = Object.keys(dataObject);

    //Go through these keys and implement them into DOM as a table titles
    this.getKeys(objectKeys);

    //Go through array of data and get values of these objects in order to fill in table content
    this.getValues(data);

    this.insertData(objectKeys);
  }

  editData(rowId, cellValues, titles) {
    this.router.navigateByUrl('/editing', { state: { rowId: rowId, 
                                                      values: cellValues, 
                                                      titles: titles } });
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
      let rowIndex = i;
      this.insertRow(values, rowIndex, data);
    }
  }

  insertRow(values, rowIndex, data) {
    const renderer = this.renderer,
          tr = document.createElement('tr');
    renderer.setAttribute(tr, 'data-value', Object.keys(data)[rowIndex]);

    for(let j = 0; j < values.length; j++) {
      const td = document.createElement('td'),
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

      let rowId = row.getAttribute('data-value');
      row.addEventListener('click', this.editData.bind(this, rowId, cellValues, objectKeys));
    }
  }

  replaceJSONRow(oldData, data) {
    let id = data.rowId;

    for(let el in oldData) {
      if(el == id) {
        let oldDataKeys = Object.keys(oldData[el]);

        for(let i = 0; i < data.data.length; i++) {
          for(let j = 0; j < oldDataKeys.length; j++) {
            if(data.data[i].title == oldDataKeys[j]) {
              oldData[el][oldDataKeys[j]] = data.data[i].value;
            }
          }
        }
      }
    }

    let updatedData = oldData;

    localStorage.setItem('tableData', JSON.stringify(updatedData));
    return updatedData;
  }

  loadoutJSON() {
    let JSONObject = JSON.parse(localStorage.getItem('tableData')),
        processedJSON = this.processJSONBeforeStringify(JSONObject);

    let stringifiedJSON = JSON.stringify(processedJSON);

    this.router.navigateByUrl('/enterjson', { state: { stringifiedJSON } });   
  }

  processJSONBeforeStringify(data) {
    delete data.navigationId;
    
    let jsonArray = [];
    for (const obj in data) {
      console.log(obj);
      console.log(data[obj]);
      jsonArray.push(data[obj]);
    }

    return jsonArray;
  }
}
