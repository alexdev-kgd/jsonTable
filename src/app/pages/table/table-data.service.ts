import {Injectable, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import * as $ from 'jquery-csv';
declare let $: any;

@Injectable({
  providedIn: 'root',
})
export class TableDataService {
  constructor(private router: Router,
    @Inject(DOCUMENT) private document) { }

  checkData(json): boolean {
    return ( json.isNewRow === undefined) ? false : true;
  }

  getTitles(json): string[] {
    return Object.keys(json[0]);
  }

  getRowsCount(json): number {
    return Object.keys(json).length-1;
  }

  getValues(json): any[] {
    const values = [];

    for (let i = 0; i < Object.keys(json).length-1; i++) {
      const id = i;
      const valuesArray = Object.values(json[i]);

      const dataRow = {
        values: valuesArray,
        id: id,
      };
      values.push(dataRow);
    }

    return values;
  }

  getEditedJSON(oldData, data) {
    let editedJSON;
        data['isNewRow'] ? editedJSON = this.insertNewJSONRow(oldData, data) :
        editedJSON = this.replaceJSONRow(oldData, data);

        return editedJSON;
  }

  // Prevent IDs conflicts by searching up in row DOM Elements and
  // compare their data-values with the new one
  preventConflict(newDataRowId: number, rows: Array<any>): number {
    for (let i = 0; i < rows.length; i++ ) {
      const rowId = rows[i].id;
      if (rowId === newDataRowId) newDataRowId++;
    }

    return newDataRowId;
  }

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
  }

  replaceJSONRow(oldData, data) {
    const id = data.rowId;

    for (const el in oldData) {
      if (el === id) {
        const oldDataKeys = Object.keys(oldData[el]);
        for (let i = 0; i < data.data.length; i++) {
          for (let j = 0; j < oldDataKeys.length; j++) {
            if (data.data[i].title === oldDataKeys[j]) {
              oldData[el][oldDataKeys[j]] = data.data[i].value;
            }
          }
        }
      }
    }

    const updatedData = oldData;

    this.saveJSON(updatedData);
    return updatedData;
  }

  deleteRow(rowId: number, data) {
    let deletedKey;
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      if (+keys[i] === rowId) {
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

    this.saveJSON(data);
  }

  moveRow(data, direction: string, rowId: number) {
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      if (+keys[i] === rowId) {
        if (direction === 'up') {
          let decrementKey = +keys[i];
          decrementKey--;

          if (data[decrementKey] === undefined) return;
          const saveRowData = data[decrementKey];
          data[decrementKey] = data[keys[i]];
          data[keys[i]] = saveRowData;
        } else if (direction === 'down') {
          let incrementKey = +keys[i];
          incrementKey++;

          if (data[incrementKey] === undefined) return;
          const saveRowData = data[incrementKey];
          data[incrementKey] = data[keys[i]];
          data[keys[i]] = saveRowData;
        }
      }
    }
    this.saveJSON(data);
  }

  loadJSON() {
    return JSON.parse(localStorage.getItem('tableData'));
  }

  saveJSON(data): void {
    localStorage.setItem('tableData', JSON.stringify(data));
  }

  private processJSONBeforeStringify(json): any[] {
    delete json['navigationId'];

    const jsonArray = [];
    for (const obj in json) {
      jsonArray.push(json[obj]);
    }

    return jsonArray;
  }

  loadoutJSON(): void {
    const JSONObject = this.loadJSON();
    const processedJSON = this.processJSONBeforeStringify(JSONObject);

    const stringifiedJSON = JSON.stringify(processedJSON);

    this.router.navigateByUrl('/enterjson',
        {state: {stringifiedJSON}});
  }

  saveAsJSONFile(): void {
    const JSONObject = this.loadJSON();
    const processedJSON = this.processJSONBeforeStringify(JSONObject);
    const stringifiedJSON = JSON.stringify(processedJSON);

    this.createLink(stringifiedJSON, 'json');
  }

  saveAsCSVFile(): void {
    const JSONObject = this.loadJSON();
    const dataArray = [];

    for (const obj in JSONObject) {
      if (typeof JSONObject[obj] === 'object') {
        dataArray.push(JSONObject[obj]);
      }
    }

    const csv = $.csv.fromObjects(dataArray);
    this.createLink(csv, 'csv');
  }

  createLink(data: string, extension: string) {
    const link = document.createElement('a');
    link.setAttribute('href',
        'data:text/plain;charset=utf-u,'+encodeURIComponent(data));
    link.setAttribute('download', 'datafile.'+extension);
    link.click();
  }
}
