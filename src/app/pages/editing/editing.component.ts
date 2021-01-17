import { Component, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editing',
  templateUrl: './editing.component.html',
  styleUrls: ['./editing.component.sass']
})
export class EditingComponent implements OnInit {

  public inputs: Array<{ title: string, value: any }> = [];
  public rowId: string;
  public isNewRow: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    let data = history.state;
    if(data.isNewRow) this.isNewRow = true;
    this.editData(data);
  }

  editData(data) {
    if( (data.titles === undefined) && (data.values === undefined) ) 
      this.router.navigateByUrl('/enterjson');

    let titles = data.titles,
        values = data.values;
    this.rowId = data.rowId;

    for (let i = 0; i < titles.length; i++) {
      let title = titles[i],
          value = values[i];
      
      let input = {"title": title, "value": value};
      
      this.inputs.push(input);
    }
  }

  saveData() {
    this.router.navigateByUrl('/table', { state: { data: this.inputs, 
                                                   rowId: this.rowId,
                                                   isNewRow: this.isNewRow } });
  }
}
