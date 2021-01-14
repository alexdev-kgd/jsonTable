import { Component, OnInit } from '@angular/core';
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
  }

  textToJSON() {
    this.jsonValue = this.jsonValue.replace('"[','[');
    this.jsonValue = this.jsonValue.replace(']"',']');

    let json = JSON.parse(this.jsonValue);
    console.log(json);
    this.sendToTable(json);
  }

  sendToTable(json) {
    this.router.navigateByUrl('/table', { state: json });
  }
}
