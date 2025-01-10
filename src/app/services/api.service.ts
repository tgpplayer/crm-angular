import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api/leads';

  constructor(private http: HttpClient) {}

  getLeads(estado?: string): Observable<any> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<any>(this.baseUrl, { params });
  }

  getLeadById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createLead(nuevoLead: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, nuevoLead);
  }

  updateFollowUp(id: number, seguimiento: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/followup/${id}`, { seguimiento });
  }

  actualizarEstadoLead(id: number, estado: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/status/${id}`, { estado });
  }

  actualizarFechaSeguimiento(id: number, seguimiento: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/followup/${id}`, { seguimiento });
  }
  
  actualizarUsuario(id: number, usuario: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/usuario/${id}`, { usuario });
  }

  eliminarLead(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
  
}
