import { Routes } from '@angular/router';
import { LeadsComponent } from './components/leads/leads/leads.component';

export const routes: Routes = [
    { path: '', redirectTo: '/leads', pathMatch: 'full' },
    { path: 'leads', component: LeadsComponent },
];
