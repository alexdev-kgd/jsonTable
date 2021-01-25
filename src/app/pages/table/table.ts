import {Location, DOCUMENT} from '@angular/common';
import {ElementRef, Inject, Renderer2, Component} from '@angular/core';
import {Router} from '@angular/router';
import * as $ from 'jquery-csv';
declare let $: any;

@Component({
  template: '',
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
        this.header = header;
      },

      setContainerElement(container) {
        this.container = container;
      },

      getHeaderElement() {
        return this.header;
      },

      getContainerElement() {
        return this.container;
      },
    }

    TableManipulations = {
      outerLink: this,

      updateTable(data) {
        const header = this.outerLink.TableElements.getHeaderElement();
        const container = this.outerLink.TableElements.getContainerElement();
        const allRows = container.nativeElement.querySelectorAll('tr');
        const allTitles = header.nativeElement.querySelectorAll('th');

        for (let i = 0; i < allRows.length; i++) {
          allRows[i].remove();
        }
        for (let j = 0; j < allTitles.length; j++) {
          allTitles[j].remove();
        }

        this.outerLink.JSONdata.getData(data);
      },

      insertTitles(keys) {
        const renderer = this.outerLink.renderer;
        const th = this.outerLink.document.createElement('th');
        const title = renderer.createText(keys);
        const header = this.outerLink.TableElements.getHeaderElement();

        renderer.appendChild(th, title);
        renderer.appendChild(header.nativeElement, th);
      },

      insertRow(values, rowIndex, data) {
        const renderer = this.outerLink.renderer;
        const tr = this.outerLink.document.createElement('tr');
        const container = this.outerLink.TableElements.getContainerElement();
        renderer.setAttribute(tr, 'data-value', Object.keys(data)[rowIndex]);

        for (let j = 0; j < values.length+1; j++) {
          const td = this.outerLink.document.createElement('td');

          if (j == values.length) {
            renderer.setStyle(td, 'width', '150px');
            const rowId = Object.keys(data)[rowIndex];

            const button = this.createButton('btn btn-secondary',
                'Delete', rowId);
            this.bindFuncToButton(button, function(event) {
              event.stopPropagation()
              ;
            });
            this.bindFuncToButton(button, this.deleteRow.bind(this, data));
            this.insertButton(button, td);

            const buttonUp = this.createButton('btn btn-primary btn-up',
                'Up', rowId);
            this.bindFuncToButton(buttonUp, function(event) {
              event.stopPropagation()
              ;
            });
            this.bindFuncToButton(buttonUp,
                this.outerLink.JSONdata.moveRow.bind(this, data, 'up'));

            const buttonDown =
                this.createButton('btn btn-primary btn-down', 'Down', rowId);
            this.bindFuncToButton(buttonDown, function(event) {
              event.stopPropagation()
              ;
            });
            this.bindFuncToButton(buttonDown,
                this.outerLink.JSONdata.moveRow.bind(this, data, 'down'));

            const orderBtnsContainer =
                this.createBtnContainer('orderBtnsContainer');

            this.appendContainer(orderBtnsContainer, td);
            const orderBtns = [];
            orderBtns.push(buttonUp);
            orderBtns.push(buttonDown);
            orderBtns.map((el) => {
              renderer.appendChild(orderBtnsContainer, el);
            });
          } else {
            const value = renderer.createText(values[j]);
            renderer.appendChild(td, value);
          }
          renderer.appendChild(tr, td);
        }
        renderer.appendChild(container.nativeElement, tr);
      },

      createBtnContainer(className) {
        const renderer = this.outerLink.renderer;
        const divContainer = renderer.createElement('div');

        renderer.setAttribute(divContainer, 'class', className);

        return divContainer;
      },

      appendContainer(container, destination) {
        const renderer = this.outerLink.renderer;
        renderer.appendChild(destination, container);
      },

      createButton(className, text, dataValue) {
        const renderer = this.outerLink.renderer;
        const buttonText = renderer.createText(text);
        const button = renderer.createElement('button');

        renderer.setAttribute(button, 'class', className);
        renderer.setAttribute(button, 'color', 'primary');
        if (dataValue !== null) {
          renderer.setAttribute(button, 'data-value', dataValue);
        }

        renderer.appendChild(button, buttonText);

        return button;
      },

      insertButton(button, destination) {
        const renderer = this.outerLink.renderer;
        renderer.appendChild(destination, button);
      },

      bindFuncToButton(button, func) {
        button.addEventListener('click', func);
      },

      insertData(objectKeys) {
        const container = this.outerLink.TableElements.getContainerElement();
        const allRows = container.nativeElement.querySelectorAll('tr');

        for (let i = 0; i < allRows.length; i++ ) {
          const row = allRows[i];
          const allCells = row.querySelectorAll('td');
          const cellValues = [];

          for (let j = 0; j < allCells.length; j++) {
            cellValues.push(allCells[j].textContent);
          }
          const rowId = this.getRowId(row);

          row.addEventListener('click',
              this.outerLink.JSONdata.editData.bind(this, rowId, cellValues,
                  objectKeys, false));
        }
      },

      insertAddButton(data) {
        const header = this.outerLink.TableElements.getHeaderElement();
        const renderer = this.outerLink.renderer;
        const th = this.outerLink.document.createElement('th');
        renderer.appendChild(header.nativeElement, th);
        renderer.setStyle(th, 'width', '150px');

        const button =
            this.createButton('btn btn-primary', 'Add New Row', null);

        this.insertButton(button, th);
        this.bindFuncToButton(button,
            this.outerLink.JSONdata.createNewRow.bind(this, data));
      },

      insertUpButton(data) {
        const header = this.outerLink.TableElements.getHeaderElement();

        const renderer = this.outerLink.renderer;
        const th = this.outerLink.document.createElement('th');
        const buttonText = renderer.createText('Up');
        const button = renderer.createElement('button');

        renderer.setAttribute(button, 'class', 'btn btn-primary btn-up');
        renderer.setAttribute(button, 'color', 'primary');
        renderer.setStyle(th, 'width', '150px');

        renderer.appendChild(button, buttonText);
        renderer.appendChild(th, button);
        renderer.appendChild(header.nativeElement, th);

        button.addEventListener('click',
            this.outerLink.JSONdata.moveRowUp.bind(this, data));
      },

      insertDownButton(data) {
        const header = this.outerLink.TableElements.getHeaderElement();

        const renderer = this.outerLink.renderer;
        const th = this.outerLink.document.createElement('th');
        const buttonText = renderer.createText('Down');
        const button = renderer.createElement('button');

        renderer.setAttribute(button, 'class', 'btn btn-primary btn-up');
        renderer.setAttribute(button, 'color', 'primary');
        renderer.setStyle(th, 'width', '150px');

        renderer.appendChild(button, buttonText);
        renderer.appendChild(th, button);
        renderer.appendChild(header.nativeElement, th);

        button.addEventListener('click',
            this.outerLink.JSONdata.moveRowDown.bind(this, data));
      },

      getTitles() {
        const header = this.outerLink.TableElements.getHeaderElement();
        const allTitles = header.nativeElement.querySelectorAll('th');
        const titles = [];

        for (let i = 0; i < allTitles.length-1; i++ ) {
          titles.push(allTitles[i].innerText);
        }

        return titles;
      },

      getRowId(row) {
        return row.getAttribute('data-value');
      },

      deleteRow(data, button) {
        const rowId = button.currentTarget.getAttribute('data-value');
        const keys = Object.keys(data);

        let deletedKey;
        for (let i = 0; i < keys.length; i++) {
          if (+keys[i] == rowId) {
            deletedKey = +keys[i];
            delete data[keys[i]];
          }
        }
        for (let j = 0; j < keys.length; j++) {
          if (+keys[j] > deletedKey) {
            let decrementKey = +keys[j];
            decrementKey--;

            data[decrementKey] = data[keys[j]];
            delete data[keys[j]];
          }
        }

        this.outerLink.JSONdata.saveJSON(data);
        this.updateTable(data);
      },

      // Prevent IDs conflicts by searching up in row DOM Elements and
      // compare their data-values with the new one
      preventConflict(newDataRowId) {
        const container = this.outerLink.TableElements.getContainerElement();
        const allRows = container.nativeElement.querySelectorAll('tr');
        for (let i = 0; i < allRows.length; i++ ) {
          const row = allRows[i];

          const rowId = this.getRowId(row);
          if (rowId == newDataRowId) newDataRowId++;
        }

        return newDataRowId;
      },

      createLinkForJSONfile(data) {
        const link = this.outerLink.document.createElement('a');
        link.setAttribute('href',
            'data:text/plain;charset=utf-u,'+encodeURIComponent(data));
        link.setAttribute('download', 'jsonfile.json');
        link.click();
      },

      createLinkForCSVfile(data) {
        const link = this.outerLink.document.createElement('a');
        link.setAttribute('href',
            'data:text/plain;charset=utf-u,'+encodeURIComponent(data));
        link.setAttribute('download', 'csvfile.csv');
        link.click();
      },
    };

    JSONdata = {
      outerLink: this,

      checkData(data): boolean {
        if ( data.rowId === undefined) {
          return false;
        } else {
          return true;
        }
      },

      getEditedJSON(oldData, data) {
        let editedJSON;
            data.isNewRow ? editedJSON = this.outerLink.JSONdata
                .insertNewJSONRow(oldData, data) :
            editedJSON = this.outerLink.JSONdata.replaceJSONRow(oldData, data);

            return editedJSON;
      },

      getData(data) {
        if (data[0] === undefined) {
          this.outerLink.router.navigateByUrl('/enterjson');
          return;
        }

        // Get first object for extracting keys and values
        const objectKeys = this.getJSONkeys(data);

        // Go through these keys and implement them into DOM as a table titles
        this.getKeys(objectKeys);

        // Go through array of data and get values of these objects
        // in order to fill in table content
        this.getValues(data);

        this.outerLink.TableManipulations.insertAddButton(data);
        this.outerLink.TableManipulations.insertData(objectKeys);
      },

      getJSONkeys(data) {
        return Object.keys(data[0]);
      },

      getKeys(objectKeys) {
        for (let i = 0; i < objectKeys.length; i++) {
          const keys = objectKeys[i];
          this.outerLink.TableManipulations.insertTitles(keys);
        }
      },

      getValues(data) {
        for (let i = 0; i < Object.values(data).length; i++) {
          const length = Object.keys(data).length;

          if (i == (length - 1)) break;

          if (data[i] === undefined) {
            console.log('Not found:', i);
          } else {
            const values = Object.values<string>(data[i]);
            const rowIndex = i;

            this.outerLink.TableManipulations.insertRow(values, rowIndex, data);
          }
        }
      },

      createNewRow(data) {
        const dataLength = Object.keys(data).length;
        let dataRowsCount = dataLength - 1;
        let newDataRowId = dataRowsCount++;

        newDataRowId =
            this.outerLink.TableManipulations.preventConflict(newDataRowId);

        const titles = this.outerLink.TableManipulations.getTitles();
        const cellValues = [];

        for (let i = 0; i < titles.length; i++) {
          cellValues.push('');
        }

        const isNewRow = true;

        console.log(newDataRowId);
        this.outerLink.JSONdata.editData(newDataRowId,
            cellValues, titles, isNewRow);
      },

      insertNewJSONRow(oldData, data) {
        const JSONValueObject = {};

        for (let i = 0; i < data.data.length; i++) {
          const title = data.data[i]['title'];
          const value = data.data[i]['value'];

          const newKeyValuePair = {
            [title]: value,
          };

          Object.assign(JSONValueObject, newKeyValuePair);
        }

        const newJSONDataRow = {
          [data.rowId]: JSONValueObject,
        };
        const updatedJSON = Object.assign(oldData, newJSONDataRow);

        this.saveJSON(updatedJSON);
        return updatedJSON;
      },

      editData(rowId, cellValues, titles, isNewRow) {
        this.outerLink.router.navigateByUrl('/editing', {state: {rowId: rowId,
          values: cellValues,
          titles: titles,
          isNewRow: isNewRow}});
      },

      moveRow(data, direction, button) {
        const rowId = button.currentTarget.getAttribute('data-value');
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
          if (+keys[i] == rowId) {
            if (direction == 'up') {
              let decrementKey = +keys[i];
              decrementKey--;

              if (data[decrementKey] === undefined) return;
              const saveRowData = data[decrementKey];
              data[decrementKey] = data[keys[i]];
              data[keys[i]] = saveRowData;
            } else if (direction == 'down') {
              let incrementKey = +keys[i];
              incrementKey++;

              if (data[incrementKey] === undefined) return;
              const saveRowData = data[incrementKey];
              data[incrementKey] = data[keys[i]];
              data[keys[i]] = saveRowData;
            }
          }
        }

        this.outerLink.JSONdata.saveJSON(data);
        this.outerLink.TableManipulations.updateTable(data);
      },

      replaceJSONRow(oldData, data) {
        const id = data.rowId;

        for (const el in oldData) {
          if (el == id) {
            const oldDataKeys = Object.keys(oldData[el]);
            for (let i = 0; i < data.data.length; i++) {
              for (let j = 0; j < oldDataKeys.length; j++) {
                if (data.data[i].title == oldDataKeys[j]) {
                  oldData[el][oldDataKeys[j]] = data.data[i].value;
                }
              }
            }
          }
        }

        const updatedData = oldData;

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
        const JSONObject = this.loadJSON();
        const processedJSON = this.processJSONBeforeStringify(JSONObject);

        const stringifiedJSON = JSON.stringify(processedJSON);

        this.outerLink.router.navigateByUrl('/enterjson',
            {state: {stringifiedJSON}});
      },

      saveAsJSONFile() {
        const JSONObject = this.loadJSON();
        const processedJSON = this.processJSONBeforeStringify(JSONObject);
        const stringifiedJSON = JSON.stringify(processedJSON);

        this.outerLink.TableManipulations
            .createLinkForJSONfile(stringifiedJSON);
      },

      saveAsCSVFile() {
        const JSONObject = this.loadJSON();
        const dataArray = [];

        for (const obj in JSONObject) {
          if (typeof JSONObject[obj] === 'object') {
            dataArray.push(JSONObject[obj]);
          }
        }

        const csv = $.csv.fromObjects(dataArray);
        this.outerLink.TableManipulations.createLinkForCSVfile(csv);
      },

      processJSONBeforeStringify(data) {
        delete data.navigationId;

        const jsonArray = [];
        for (const obj in data) {
          jsonArray.push(data[obj]);
        }

        return jsonArray;
      },
    }
}
