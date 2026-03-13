import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule], // Need this for router-outlet
  templateUrl: './app.html'
})
export class App {}
