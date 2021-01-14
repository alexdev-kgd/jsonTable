import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.sass']
})
export class TableComponent implements OnInit {

  
  constructor(private location:Location) { }

  ngOnInit(): void {
    this.getData(history.state);
  }

  getData(data) {
    if(!data) return;

    for (const obj in data) {
      for(const title in data[obj]) {
        console.log(title);
      }
    }
  }

}
