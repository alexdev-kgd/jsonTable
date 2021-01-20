import { Location, DOCUMENT } from '@angular/common';
import { ElementRef, Inject, Renderer2, Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    template: ''
})
export class Table {

    public constructor(private location: Location, private renderer: Renderer2,
        private elRef: ElementRef, @Inject(DOCUMENT) private document,
        private router: Router) {
        
    }

    TableElements = {
        outerLink: this,
        header: null,
        container: null,

        setHeaderElement(header) {
            this.header = header
        },

        setContainerElement(container) {
            this.container = container
        },

        getHeaderElement() {
            return this.header;
        },

        getContainerElement() {
            return this.container;
        }
    } 

    TableManipulations = {
        outerLink: this,

        insertTitles(keys) {
            console.log(keys);
            let renderer = this.outerLink.renderer,
                th = this.outerLink.document.createElement('th'),
                title = renderer.createText(keys),
                header = this.outerLink.TableElements.getHeaderElement();

            renderer.appendChild(th, title);
            renderer.appendChild(header.nativeElement, th);
        },

        insertRow(values, rowIndex, data){
            let renderer = this.outerLink.renderer,
                tr = this.outerLink.document.createElement('tr'),
                container = this.outerLink.TableElements.getContainerElement();
            renderer.setAttribute(tr, 'data-value', Object.keys(data)[rowIndex]);
        
            for(let j = 0; j < values.length+1; j++) {
                let td = this.outerLink.document.createElement('td'),
                    value;
        
                if(j == values.length) {
                let buttonText = renderer.createText('Delete'),
                    button = renderer.createElement('button');
        
                    renderer.setAttribute(button, 'class', 'btn btn-secondary');
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
            
            renderer.appendChild(container.nativeElement, tr);
        },

        insertData(objectKeys) {
            let container = this.outerLink.TableElements.getContainerElement();
            let allRows = container.nativeElement.querySelectorAll('tr');

            for(let i = 0; i < allRows.length; i++ ) {
                let row = allRows[i],
                    allCells = row.querySelectorAll('td'),
                    cellValues = [];

                for(let j = 0; j < allCells.length; j++) {
                    cellValues.push(allCells[j].textContent);
                }
                let rowId = this.getRowId(row);

                row.addEventListener('click', this.outerLink.JSONdata.editData.bind(this, rowId, cellValues, 
                                                                objectKeys, false));
            }            
        },

        insertAddButton(data) {
            let header = this.outerLink.TableElements.getHeaderElement();

            let renderer = this.outerLink.renderer,
                th = this.outerLink.document.createElement('th'),
                buttonText = renderer.createText('Add New Row'),
                button = renderer.createElement('button');
    
                renderer.setAttribute(button, 'class', 'btn btn-primary');
                renderer.setAttribute(button, 'color', 'primary');
                renderer.setStyle(th, "width", "150px");
        
            renderer.appendChild(button, buttonText);
            renderer.appendChild(th, button);
            renderer.appendChild(header.nativeElement, th);
        
            button.addEventListener('click', this.outerLink.JSONdata.createNewRow.bind(this, data));    
        },

        getTitles() {
            let header = this.outerLink.TableElements.getHeaderElement(),
                allTitles = header.nativeElement.querySelectorAll('th'),
                titles = [];
        
            for(let i = 0; i < allTitles.length-1; i++ ) {
                titles.push(allTitles[i].innerText);
            }
            
            return titles;
        },

        getRowId(row) {
            return row.getAttribute('data-value');
        },

        deleteRow(data, button) {
            let rowId = button.currentTarget.getAttribute('data-value'),
                keys = Object.keys(data),
                container = this.outerLink.TableElements.getContainerElement(),
                rowsElements = container.nativeElement.querySelectorAll('tr');
            for (let i = 0; i < keys.length; i++) {
                if(+keys[i] == rowId) delete data[keys[i]];
            }
        
            for (let j = 0; j < rowsElements.length; j++) {
                let rowDataValue = rowsElements[j].getAttribute('data-value');
                if(rowDataValue == rowId) this.outerLink.renderer.removeChild(container, 
                                                                    rowsElements[j]);
            }
        
            this.outerLink.JSONdata.saveJSON(data);
        },

        // Prevent IDs conflicts by searching up in row DOM Elements and compare their data-values
        // with the new one
        preventConflict(newDataRowId) {
            let container = this.outerLink.TableElements.getContainerElement(),
                allRows = container.nativeElement.querySelectorAll('tr');
            for(let i = 0; i < allRows.length; i++ ) {
            let row = allRows[i];

            let rowId = this.getRowId(row);
            if(rowId == newDataRowId) newDataRowId++;
            } 

            return newDataRowId;
        },

        createLinkForJSONfile(data) {
        let link = this.outerLink.document.createElement('a');
            link.setAttribute('href', 
                              'data:text/plain;charset=utf-u,'+encodeURIComponent(data));
            link.setAttribute('download', 'jsonfile.json');
            link.click();
        }
    };

    JSONdata = {
        outerLink: this,

        checkData(data): boolean {
            if( data.rowId === undefined) {
                return false;
            } else {
                return true;
            }  
        },

        getEditedJSON(oldData, data) {
            let editedJSON;
            data.isNewRow ? editedJSON = this.outerLink.JSONdata.insertNewJSONRow(oldData, data) : 
                            editedJSON = this.outerLink.JSONdata.replaceJSONRow(oldData, data);
            
            return editedJSON;
        },

        getData(data) {
            if(data[0] === undefined) {
                this.outerLink.router.navigateByUrl('/enterjson');
                return;
            }

            //Get first object for extracting keys and values
            let objectKeys = this.getJSONkeys(data);
        
            //Go through these keys and implement them into DOM as a table titles
            this.getKeys(objectKeys);
        
            //Go through array of data and get values of these objects in order to fill in table content
            this.getValues(data);

            this.outerLink.TableManipulations.insertAddButton(data);
            this.outerLink.TableManipulations.insertData(objectKeys);
        },
        
        getJSONkeys(data) {
            return Object.keys(data[0]);
        },

        getKeys(objectKeys) {
            for(let i = 0; i < objectKeys.length; i++) {
                let keys = objectKeys[i];
                this.outerLink.TableManipulations.insertTitles(keys);
            }            
        },

        getValues(data) {
            console.log(data);
            for(let i = 0; i < Object.values(data).length; i++) {
                let length = Object.keys(data).length;

                if(i == (length - 1)) break;

                if(data[i] === undefined) {
                    console.log("Not found:", i);
                } else {
                    let values = Object.values<string>(data[i]),
                        rowIndex = i;

                    this.outerLink.TableManipulations.insertRow(values, rowIndex, data);
                }

                console.log(i);
            }            
        },

        createNewRow(data) {
            let dataLength = Object.keys(data).length,
                dataRowsCount = dataLength - 1,
                newDataRowId = dataRowsCount++;
        
                newDataRowId = this.outerLink.TableManipulations.preventConflict(newDataRowId);
                
            let titles = this.outerLink.TableManipulations.getTitles(),
                cellValues = [];
            
            for(let i = 0; i < titles.length; i++) {
                cellValues.push("");
            }
        
            let isNewRow = true;
        
            console.log(newDataRowId);
            this.outerLink.JSONdata.editData(newDataRowId, cellValues, titles, isNewRow);
        },

        insertNewJSONRow(oldData, data) {
            let JSONValueObject = {};

            for(let i = 0; i < data.data.length; i++) {
              let   title = data.data[i]['title'],
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
        
            this.saveJSON(updatedJSON);
            return updatedJSON;
        },

        editData(rowId, cellValues, titles, isNewRow) {
            this.outerLink.router.navigateByUrl('/editing', { state: { rowId: rowId, 
                                                              values: cellValues, 
                                                              titles: titles,
                                                              isNewRow: isNewRow } });
        },

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
        
            this.saveJSON(updatedData);
            return updatedData;
        },

        loadJSON() {
            return JSON.parse(localStorage.getItem('tableData'));
        },

        saveJSON(data) {
            localStorage.setItem('tableData', JSON.stringify(data));
        },

        loadoutJSON() {
            let JSONObject = this.loadJSON(),
                processedJSON = this.processJSONBeforeStringify(JSONObject);
        
            let stringifiedJSON = JSON.stringify(processedJSON);
        
            this.outerLink.router.navigateByUrl('/enterjson', { state: { stringifiedJSON } });   
        },

        saveAsJSONFile() {
            let JSONObject = this.loadJSON(),
                processedJSON = this.processJSONBeforeStringify(JSONObject),
                stringifiedJSON = JSON.stringify(processedJSON);
                
            this.outerLink.TableManipulations.createLinkForJSONfile(stringifiedJSON);
        },
        
        processJSONBeforeStringify(data) {
            delete data.navigationId;
            
            let jsonArray = [];
            for (const obj in data) {
                jsonArray.push(data[obj]);
            }
        
            return jsonArray;
        }
    }
}