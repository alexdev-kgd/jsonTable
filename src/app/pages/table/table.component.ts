import {AfterViewInit, Component, ElementRef} from '@angular/core';
import {ViewChild, ViewEncapsulation} from '@angular/core';
import {Table} from '../table/table';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.sass'],
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements AfterViewInit {
  @ViewChild('tableHeader', {static: true}) tableHeader: ElementRef;
  @ViewChild('tableContent', {static: true}) tableContent: ElementRef;

  constructor(private table: Table) { }

  ngAfterViewInit(): void {
    const json = history.state;

    this.table.TableElements.setHeaderElement(this.tableHeader),
    this.table.TableElements.setContainerElement(this.tableContent);

    const hasRowId = this.table.JSONdata.checkData(json);
    if (hasRowId) {
      const oldData = this.table.JSONdata.loadJSON();
      const editedJSON = this.table.JSONdata.getEditedJSON(oldData, json);

      this.table.JSONdata.getData(editedJSON);
    } else {
      this.table.JSONdata.saveJSON(json);
      this.table.JSONdata.getData(json);
    }
  }

  // Onclick functions
  loadoutJSON() {
    this.table.JSONdata.loadoutJSON();
  }
  saveAsJSONFile() {
    this.table.JSONdata.saveAsJSONFile();
  }
  saveAsCSVFile() {
    this.table.JSONdata.saveAsCSVFile();
  }
}
