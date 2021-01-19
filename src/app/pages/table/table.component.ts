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
    if( data.rowId === undefined) {
      localStorage.setItem('tableData', JSON.stringify(data));
      this.getData(data);
    } else {
      let oldData = JSON.parse(localStorage.getItem('tableData'));
      
      let editedJSON;
      if(data.isNewRow) {
        editedJSON = this.insertNewRow(oldData, data);
      } else {
        editedJSON = this.replaceJSONRow(oldData, data);
      }
      this.getData(editedJSON);
    }
  }

  insertNewRow(oldData, data) {
    let JSONValueObject = {};

    for(let i = 0; i < data.data.length; i++) {
      const td = document.createElement('td'),
            title = data.data[i]['title'],
            value = data.data[i]['value'];

      let newKeyValuePair = {
        [title]: value
      }
      Object.assign(JSONValueObject, newKeyValuePair);
    }

    let newJSONDataRow = {
      [data.rowId]: JSONValueObject
    }
    let updatedJSON = Object.assign(oldData, newJSONDataRow);

    localStorage.setItem('tableData', JSON.stringify(updatedJSON));
    return updatedJSON;
  }

  getData(data) {
    if(data[0] === undefined) this.router.navigateByUrl('/enterjson');

    //Get first object for extracting keys and values
    let dataObject = data[0],
        objectKeys = Object.keys(dataObject);

    //Go through these keys and implement them into DOM as a table titles
    this.getKeys(objectKeys);

    // Create Add New Row button
    this.insertAddButton(data);

    //Go through array of data and get values of these objects in order to fill in table content
    this.getValues(data);

    this.insertData(objectKeys);
  }

  editData(rowId, cellValues, titles, isNewRow) {
    this.router.navigateByUrl('/editing', { state: { rowId: rowId, 
                                                      values: cellValues, 
                                                      titles: titles,
                                                      isNewRow: isNewRow } });
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

  insertAddButton(data) {
    const renderer = this.renderer,
          th = document.createElement('th'),
          buttonText = renderer.createText('Add New Row'),
          button = renderer.createElement('button');

          renderer.setAttribute(button, 'mat-stroked-button', '');
          renderer.setAttribute(button, 'color', 'primary');
          renderer.setStyle(th, "width", "150px");

    renderer.appendChild(button, buttonText);
    renderer.appendChild(th, button);
    renderer.appendChild(this.tableHeader.nativeElement, th);

    button.addEventListener('click', this.createNewRow.bind(this, data));    
  }

  createNewRow(data) {
    let dataLength = Object.keys(data).length,
        dataRowsCount = dataLength - 1,
        newDataRowId = dataRowsCount++;

        newDataRowId = this.preventConflict(newDataRowId);
      
    let titles = this.getTitles(),
        cellValues = [];
    
    for(let i = 0; i < titles.length; i++) {
      cellValues.push("");
    }

    let isNewRow = true;

    console.log(newDataRowId);
    this.editData(newDataRowId, cellValues, titles, isNewRow);
  }

  getTitles() {
    let allTitles = this.tableHeader.nativeElement.querySelectorAll('th'),
        titles = [];

    for(let i = 0; i < allTitles.length-1; i++ ) {
      titles.push(allTitles[i].innerText);
    }
    
    return titles;
  }

  // Prevent IDs conflicts by searching up in row DOM Elements and compare their data-values
  // with the new one
  preventConflict(newDataRowId) {
    let allRows = this.tableContent.nativeElement.querySelectorAll('tr');
    for(let i = 0; i < allRows.length; i++ ) {
      let row = allRows[i];

      let rowId = this.getRowId(row);
      if(rowId == newDataRowId) newDataRowId++;
    } 

    return newDataRowId;
  }

  getValues(data) {
    console.log(data);
    for(let i = 0; i < Object.values(data).length; i++) {
      let length = Object.keys(data).length;
      if(i == (length - 1)) break;
      if(data[i] === undefined) {
        console.log("Not found:", i);
      } else {
        const values = Object.values<string>(data[i]);
        let rowIndex = i;
        this.insertRow(values, rowIndex, data);
      }
      console.log(i);
    }
  }

  insertRow(values, rowIndex, data) {
    const renderer = this.renderer,
          tr = document.createElement('tr');
    renderer.setAttribute(tr, 'data-value', Object.keys(data)[rowIndex]);

    for(let j = 0; j < values.length+1; j++) {
      const td = document.createElement('td');
      let value;

      if(j == values.length) {
        let buttonText = renderer.createText('Delete'),
            button = renderer.createElement('button');

            renderer.setAttribute(button, 'mat-stroked-button', '');
            renderer.setAttribute(button, 'color', 'primary');
            renderer.setAttribute(button, 'data-value', Object.keys(data)[rowIndex]);
            renderer.setStyle(td, "width", "150px");
            renderer.appendChild(button, buttonText);
            button.addEventListener('click', function(event) {event.stopPropagation()});
            button.addEventListener('click', this.deleteRow.bind(this, data));

        value = button;
      } else {
        value = renderer.createText(values[j]);
      }

      renderer.appendChild(td, value);
      renderer.appendChild(tr, td);        
    }
    
    this.renderer.appendChild(this.tableContent.nativeElement, tr);
  };

  deleteRow(data, button) {
    let rowId = button.currentTarget.getAttribute('data-value'),
        keys = Object.keys(data),
        rowsElements = this.tableContent.nativeElement.querySelectorAll('tr');
    for (let i = 0; i < keys.length; i++) {
      if(+keys[i] == rowId) delete data[keys[i]];
    }

    for (let j = 0; j < rowsElements.length; j++) {
      let rowDataValue = rowsElements[j].getAttribute('data-value');
      if(rowDataValue == rowId) this.renderer.removeChild(this.tableContent, 
                                                          rowsElements[j]);
    }

    localStorage.setItem('tableData', JSON.stringify(data));
  }

  insertData(objectKeys) {
    let allRows = this.tableContent.nativeElement.querySelectorAll('tr');
    for(let i = 0; i < allRows.length; i++ ) {
      let row = allRows[i],
          allCells = row.querySelectorAll('td'),
          cellValues = [];

      for(let j = 0; j < allCells.length; j++) {
        cellValues.push(allCells[j].textContent);
      }

      let rowId = this.getRowId(row);
      row.addEventListener('click', this.editData.bind(this, rowId, cellValues, 
                                                       objectKeys, false));
    }
  }

  getRowId(row) {
    return row.getAttribute('data-value');
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
      jsonArray.push(data[obj]);
    }

    return jsonArray;
  }

}
