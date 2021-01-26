import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-editing',
  templateUrl: './editing.component.html',
  styleUrls: ['./editing.component.sass'],
})
export class EditingComponent implements OnInit {
  public inputs: Array<{ title: string, value: any }> = [];
  public rowId: string;
  public isNewRow: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    const data = history.state;
    if (data.isNewRow) this.isNewRow = true;
    this.editData(data);
  }

  editData(data: any): void {
    if ( (data.titles === undefined) || (data.values === undefined) ) {
      this.router.navigateByUrl('/enterjson');
    }

    const titles = data.titles;
    const values = data.values;
    this.rowId = data.rowId;

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i];
      const value = values[i];

      const input = {'title': title, 'value': value};

      this.inputs.push(input);
    }
  }

  saveData(): void {
    this.router.navigateByUrl('/table', {state: {data: this.inputs,
      rowId: this.rowId,
      isNewRow: this.isNewRow}});
  }

  cancel(): void {
    this.router.navigateByUrl('/table', {state: {cancelled: true}});
  }
}
