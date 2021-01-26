import {Component, OnInit} from '@angular/core';
import {ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';

import {TableDataService} from './table-data.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.sass'],
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements OnInit {
  constructor(private router: Router,
              private tableData: TableDataService) { }

  public titles: string[];
  public rows: number;
  public data: Array<any> = [];

  private json: any;

  ngOnInit(): void {
    this.json = history.state;
    const hasRowId = this.tableData.checkData(this.json);

    if (this.json.cancelled) {
      const oldData = this.tableData.loadJSON();
      this.getData(oldData);
    } else {
      if (hasRowId) {
        const oldData = this.tableData.loadJSON();
        const editedJSON = this.tableData.getEditedJSON(oldData, this.json);
        this.getData(editedJSON);
      } else {
        this.tableData.saveJSON(this.json);
        this.getData(this.json);
      }
    }
  }

  getData(json: Object) {
    if (json[0] === undefined) {
      this.router.navigateByUrl('/enterjson', {state: {isTableEmpty: true}});
      return;
    }

    this.titles = this.tableData.getTitles(json);
    this.rows = this.tableData.getRowsCount(json);
    this.data = this.tableData.getValues(json);
  }

  resetComponentData() {
    this.titles = [];
    this.rows = 0;
    this.data = [];
    this.getData(this.tableData.loadJSON());
  }

  createNewRow(titles: string[]): void {
    const dataLength = Object.keys(this.data).length;
    let dataRowsCount = dataLength - 1;
    let newDataRowId = dataRowsCount++;

    newDataRowId =
        this.tableData.preventConflict(newDataRowId, this.data);

    const cellValues = [];
    for (let i = 0; i < titles.length; i++) {
      cellValues.push('');
    }

    const isNewRow = true;
    this.editValues(newDataRowId,
        cellValues, titles, isNewRow);
  }

  deleteRow(event: MouseEvent, rowId: number) {
    event.stopPropagation();
    this.tableData.deleteRow(rowId, this.tableData.loadJSON());
    this.resetComponentData();
  }

  moveRow(event: MouseEvent, direction: string, rowId: number) {
    event.stopPropagation();
    this.tableData.moveRow(this.tableData.loadJSON(), direction, rowId);
    this.resetComponentData();
  }

  editValues(rowId: number, values: any[],
      titles: string[], isNewRow: boolean): void {
    this.router.navigateByUrl('/editing', {state: {rowId: rowId,
      values: values,
      titles: titles,
      isNewRow: isNewRow}});
  }

  // Onclick functions
  loadoutJSON() {
    this.tableData.loadoutJSON();
  }
  saveAsJSONFile() {
    this.tableData.saveAsJSONFile();
  }
  saveAsCSVFile() {
    this.tableData.saveAsCSVFile();
  }
}
