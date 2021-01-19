export class Table {
    public constructor(json) {
        this.JSONdata.checkData(json);
    }

    TableManipulations = {
        outerLink: this,

        insertTitles(keys) {
            let renderer = this.renderer,
                th = document.createElement('th'),
                title = renderer.createText(keys);

            renderer.appendChild(th, title);
            renderer.appendChild(this.tableHeader.nativeElement, th);
        },

        insertRow(values, rowIndex, data){
            let renderer = this.renderer,
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
        },

        insertAddButton(data) {
            let renderer = this.renderer,
                th = document.createElement('th'),
                buttonText = renderer.createText('Add New Row'),
                button = renderer.createElement('button');
    
                renderer.setAttribute(button, 'mat-stroked-button', '');
                renderer.setAttribute(button, 'color', 'primary');
                renderer.setStyle(th, "width", "150px");
        
            renderer.appendChild(button, buttonText);
            renderer.appendChild(th, button);
            renderer.appendChild(this.tableHeader.nativeElement, th);
        
            button.addEventListener('click', this.outerLink.JSONdata.createNewRow.bind(this, data));    
        },

        getRowId(row) {
            return row.getAttribute('data-value');
        },

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
        
            this.outerLink.JSONdata.saveJSON(data);
            localStorage.setItem('tableData', JSON.stringify(data));
        },

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
    };

    JSONdata = {
        outerLink: this,

        checkData(data) {
            if( data.rowId === undefined) {
                localStorage.setItem('tableData', JSON.stringify(data));
                this.getData(data);
            } else {
                let oldData = JSON.parse(localStorage.getItem('tableData')),
                    editedJSON;
    
                data.isNewRow ? editedJSON = this.insertNewJSONRow(oldData, data) : 
                                            editedJSON = this.replaceJSONRow(oldData, data);
    
                this.getData(editedJSON);
            }  
        },

        getData(data) {
            if(data[0] === undefined) {
                this.router.navigateByUrl('/enterjson');
                return;
            }

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
                
            let titles = this.getTitles(),
                cellValues = [];
            
            for(let i = 0; i < titles.length; i++) {
                cellValues.push("");
            }
        
            let isNewRow = true;
        
            console.log(newDataRowId);
            this.editData(newDataRowId, cellValues, titles, isNewRow);
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
        },

        editData(rowId, cellValues, titles, isNewRow) {
            this.router.navigateByUrl('/editing', { state: { rowId: rowId, 
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

        saveJSON(data) {
            localStorage.setItem('tableData', JSON.stringify(data));
        },

        loadoutJSON() {
            let JSONObject = JSON.parse(localStorage.getItem('tableData')),
                processedJSON = this.processJSONBeforeStringify(JSONObject);
        
            let stringifiedJSON = JSON.stringify(processedJSON);
        
            this.router.navigateByUrl('/enterjson', { state: { stringifiedJSON } });   
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