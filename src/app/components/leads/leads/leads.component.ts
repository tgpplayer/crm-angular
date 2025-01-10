import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-leads',
  imports: [CommonModule, FormsModule],
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css']
})
export class LeadsComponent {
  leads: any[] = [];
  leadsFiltrados: any[] = [];
  estados = ['Nueva conversacion', 'Oferta pasada', 'Reunion agendada', 'Seguimiento 1', 'Seguimiento 2', 'Seguimiento 3', 'CLOSE THE DEAL'];
  filtroUsuario: string = '';
  filtroEstado: string = '';
  fechaInicio: string | null = null;
  fechaFin: string | null = null;

  nuevoLead = {
    usuario: '',
    estado: '',
    seguimiento: ''
  };

  mostrarFormularioNuevoLead = false;

  // Variables para el modal de seguimiento
  mostrarModalSeguimiento: boolean = false;
  fechaSeguimiento: string = '';
  leadActual: any = null;

  // Variables para el modal de edición de usuario
  mostrarModalEditarUsuario: boolean = false;
  usuarioEditado: string = '';

  // Variables para el modal de eliminar lead
  mostrarModalEliminar = false;
  leadAEliminar: number | null = null;

  mostrarSoloHoy: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarLeads();
  }

  cargarLeads() {
    this.apiService.getLeads().subscribe((data) => {
      this.leads = data;
      this.leadsFiltrados = data; // Inicializamos los leads filtrados con todos los leads
    });
  }

  filtrarLeads(): void {
    this.leadsFiltrados = [...this.leads]; // Reinicia los leads filtrados

    // Filtro por usuario
    if (this.filtroUsuario.trim()) {
      this.leadsFiltrados = this.leadsFiltrados.filter((lead) =>
        lead.usuario.toLowerCase().includes(this.filtroUsuario.toLowerCase())
      );
    }

    // Filtro por estado
    if (this.filtroEstado) {
      this.leadsFiltrados = this.leadsFiltrados.filter((lead) => lead.estado === this.filtroEstado);
    }

    // Filtro por rango de fechas
    if (this.fechaInicio && this.fechaFin) {
      const inicio = new Date(this.fechaInicio).getTime();
      const fin = new Date(this.fechaFin).getTime();
      this.leadsFiltrados = this.leadsFiltrados.filter((lead) => {
        const seguimiento = lead.seguimiento ? new Date(lead.seguimiento).getTime() : 0;
        return seguimiento >= inicio && seguimiento <= fin;
      });
    }
  }

  // Funciones de Modal
  abrirModalCrearLead(): void {
    this.mostrarFormularioNuevoLead = true;
  }

  cerrarModalCrearLead(): void {
    this.mostrarFormularioNuevoLead = false;
    this.nuevoLead = { usuario: '', estado: '', seguimiento: '' };
  }

  guardarNuevoLead(): void {
    if (this.nuevoLead.usuario) {
      // Asignar valores internos para el estado y seguimiento
      const leadConEstado = {
        usuario: this.nuevoLead.usuario,
        estado: 'Nueva conversacion',  // El estado predeterminado
        seguimiento: ''  // Deja el seguimiento vacío
      };
  
      // Llamada a la API para crear el nuevo lead con estos valores
      this.apiService.createLead(leadConEstado).subscribe((nuevoLead) => {
        this.leads.push(nuevoLead);
        this.filtrarLeads();  // Filtrar los leads actualizados
        this.cerrarModalCrearLead();  // Cerrar el modal
      });
    } else {
      alert('Por favor, completa el campo de nombre de usuario.');
    }
  }
  

  abrirLead(id: number): void {
    console.log(`Abrir detalles del lead con ID: ${id}`);
  }

  cambiarEstadoLead(lead: any): void {
    const nuevoEstado = lead.estado;

    if (['Seguimiento 1', 'Seguimiento 2', 'Seguimiento 3'].includes(nuevoEstado)) {
      this.leadActual = lead;
      this.mostrarModalSeguimiento = true;
    } else {
      this.apiService.actualizarEstadoLead(lead.id, nuevoEstado).subscribe(
        (updatedLead) => {
          const index = this.leads.findIndex((l) => l.id === updatedLead.id);
          if (index !== -1) {
            this.leads[index].estado = updatedLead.estado;
            this.filtrarLeads(); // Actualiza los leads filtrados
          }
        },
        (error) => {
          console.error(`Error al actualizar el estado del lead con ID ${lead.id}`, error);
        }
      );
    }
  }

  guardarFechaSeguimiento(): void {
    if (this.leadActual && this.fechaSeguimiento) {
      const seguimiento = new Date(this.fechaSeguimiento).toISOString();
      const nuevoEstado = this.leadActual.estado; // Estado seleccionado previamente
  
      // Llamada para actualizar tanto seguimiento como estado
      this.apiService.actualizarEstadoLead(this.leadActual.id, nuevoEstado).subscribe(
        () => {
          this.apiService.actualizarFechaSeguimiento(this.leadActual.id, seguimiento).subscribe(
            (updatedLead) => {
              // Actualizamos el lead actual con la respuesta del backend
              const index = this.leads.findIndex((l) => l.id === this.leadActual.id);
              if (index !== -1) {
                this.leads[index] = updatedLead;
                this.filtrarLeads(); // Refrescamos la vista filtrada
              }
              this.cerrarModalSeguimiento();
            },
            (error) => {
              console.error('Error al actualizar la fecha de seguimiento', error);
            }
          );
        },
        (error) => {
          console.error('Error al actualizar el estado del lead', error);
        }
      );
    } else {
      console.error('Falta información del lead o de la fecha de seguimiento.');
    }
  }

  cerrarModalSeguimiento(): void {
    this.mostrarModalSeguimiento = false;
    this.fechaSeguimiento = '';
    this.leadActual = null;
  }

  abrirModalEditarUsuario(lead: any): void {
    this.leadActual = lead;
    this.usuarioEditado = lead.usuario;
    this.mostrarModalEditarUsuario = true;
  }

  guardarUsuarioEditado(): void {
    this.apiService.actualizarUsuario(this.leadActual.id, this.usuarioEditado).subscribe(
      (updatedLead) => {
        this.leadActual.usuario = updatedLead.usuario;
        this.cerrarModalEditarUsuario();
      },
      (error) => {
        console.error('Error al actualizar el usuario', error);
      }
    );
  }

  cerrarModalEditarUsuario(): void {
    this.mostrarModalEditarUsuario = false;
    this.usuarioEditado = '';
    this.leadActual = null;
  }

  abrirModalEliminarLead(id: number, event: Event): void {
    event.stopPropagation(); // Evitar que el click en el botón abra la fila del lead
    this.leadAEliminar = id;
    this.mostrarModalEliminar = true;
  }
  
  cerrarModalEliminarLead(): void {
    this.mostrarModalEliminar = false;
    this.leadAEliminar = null;
  }
  
  eliminarLead(): void {
    if (this.leadAEliminar !== null) {
      this.apiService.eliminarLead(this.leadAEliminar).subscribe(() => {
        this.leads = this.leads.filter(lead => lead.id !== this.leadAEliminar);
        this.filtrarLeads();
        this.cerrarModalEliminarLead();
      });
    }
  }

  filtrarLeadsPorHoy(): void {
    if (this.mostrarSoloHoy) {
      const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      this.leadsFiltrados = this.leads.filter((lead) => {
        const fechaApertura = new Date(lead.fecha_apertura).toISOString().split('T')[0];
        return fechaApertura === hoy;
      });
    } else {
      this.leadsFiltrados = [...this.leads]; // Mostrar todos los leads
    }
  }
}
