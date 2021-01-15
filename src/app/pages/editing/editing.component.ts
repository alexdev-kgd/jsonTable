import { Component, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editing',
  templateUrl: './editing.component.html',
  styleUrls: ['./editing.component.sass']
})
export class EditingComponent implements OnInit {

  public inputs: Array<{ title: string, value: any }> = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.editData(history.state)
  }

  editData(data) {
    if( (data.titles === undefined) && (data.values === undefined) ) 
      this.router.navigateByUrl('/enterjson');

      console.log(data);
    let titles = data.titles,
        values = data.values;

    for (let i = 0; i < titles.length; i++) {
      let title = titles[i],
          value = values[i];
      
      let input = {"title": title, "value": value};
      
      this.inputs.push(input);
    }
  }

  saveData() {
    this.router.navigateByUrl('/table', { state: this.inputs });
  }
}
