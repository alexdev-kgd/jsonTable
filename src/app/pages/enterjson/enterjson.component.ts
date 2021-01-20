import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enterjson',
  templateUrl: './enterjson.component.html',
  styleUrls: ['./enterjson.component.sass']
})
export class EnterjsonComponent implements OnInit {

  public jsonValue = '[{"name":"Name 1","year":"2010"},{"name":"Name 2","year":"1997"},{"name":"Name 3","year":"2004"}]';

  constructor(private router: Router) { }

  ngOnInit(): void {
    let json = history.state;
    this.checkData(json);
  }

  onLoaded(event) {
    let file = event.srcElement.files[0];

    if(!file) throw Error('Error occured while loading file');
    if(file.type != "application/json") throw Error('Wrong file type');

    let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = (evt) => {
          let receivedJSON = JSON.stringify(evt.target['result']);
          this.jsonValue = JSON.parse(receivedJSON);
        }
        reader.onerror = (evt) => {
          console.log('Error occured reading file');
        }
  }

  checkData(data) {
    let stringifiedJSON = data.stringifiedJSON;

    if(stringifiedJSON !== undefined) {
      this.appendData(stringifiedJSON);
    }
  }

  textToJSON() {
    this.jsonValue = this.jsonValue.replace('"[','[');
    this.jsonValue = this.jsonValue.replace(']"',']');

    let json = JSON.parse(this.jsonValue);
    this.sendToTable(json);
  }

  sendToTable(json) {
    this.router.navigateByUrl('/table', { state: json });
  }

  appendData(data) {
    this.jsonValue = data;
  }
}
