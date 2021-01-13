import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { EditingComponent } from './pages/editing/editing.component';
import { EnterjsonComponent } from './pages/enterjson/enterjson.component';
import { TableComponent } from './pages/table/table.component';

const routes: Routes = [{
  path: '',
  component: AppComponent,
  children: [{
    path: '',
    redirectTo: 'enterjson',
    pathMatch: 'full'
  }, {
    path: 'enterjson',
    component: EnterjsonComponent
  }, {
    path: 'table',
    component: TableComponent
  }, {
    path: 'editing',
    component: EditingComponent
  }]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
