import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import * as $ from 'jquery-csv';
declare let $: any;

@Component({
  selector: 'app-enterjson',
  templateUrl: './enterjson.component.html',
  styleUrls: ['./enterjson.component.sass'],
})
export class EnterjsonComponent implements OnInit {
  public jsonValue = '';
  public errorString: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    const json = history.state;
    this.checkData(json);
  }

  isJSONValid(json: any): void {
    try {
      JSON.parse(json);
    } catch (e) {
      this.onError(`Invalid JSON: ${e}`);
      return;
    }
  }

  private onError(text: string): void {
    this.errorString = text;
  }

  onLoaded(event: any): void {
    const file = event.srcElement.files[0];
    const allowedExtensions = ['application/json', 'application/vnd.ms-excel'];

    if (!file) {
      this.onError('Error occured while loading file');
      return;
    }
    if (!allowedExtensions.includes(file.type)) {
      this.onError('Wrong file type');
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (evt) => {
      let receivedJSON;
      if (file.type == 'application/vnd.ms-excel') {
        receivedJSON = JSON.stringify($.csv.toObjects(evt.target['result']));
        this.jsonValue = receivedJSON;
        return;
      }
      receivedJSON = JSON.stringify(evt.target['result']);
      this.jsonValue = JSON.parse(receivedJSON);
    };
    reader.onerror = (evt) => {
      this.onError('Error occured while reading a file');
    };
  }

  checkData(data: any): void {
    const stringifiedJSON = data.stringifiedJSON;

    if (stringifiedJSON !== undefined) {
      this.appendData(stringifiedJSON);
    }
  }

  isTextareaEmpty(jsonValue: string): boolean {
    if (jsonValue == '') return true;
    return false;
  }

  textToJSON(): void {
    if (this.isTextareaEmpty(this.jsonValue)) return;
    this.isJSONValid(this.jsonValue);

    this.jsonValue = this.jsonValue.replace('"[', '[');
    this.jsonValue = this.jsonValue.replace(']"', ']');

    const json = JSON.parse(this.jsonValue);
    this.sendToTable(json);
  }

  sendToTable(json: any): void {
    this.router.navigateByUrl('/table', {state: json});
  }

  appendData(data: any): void {
    this.jsonValue = data;
  }
}
