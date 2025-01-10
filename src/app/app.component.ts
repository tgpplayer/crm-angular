import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeadsComponent } from './components/leads/leads/leads.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LeadsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'crm_angular';
}
