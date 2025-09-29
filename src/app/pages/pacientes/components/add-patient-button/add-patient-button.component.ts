import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Patient, CreatePatientDto } from '../../../../models/patient.model'; // ✅ Importar CreatePatientDto
import { PatientService } from '../../../../services/patient.service';

@Component({
  selector: 'app-add-patient-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-patient-button.component.html',
  styleUrls: ['./add-patient-button.component.css']
})
export class AddPatientButtonComponent {
  showForm = false;
  name = '';
  age: number | null = null;
  gender = 'Femenino';

  @Output() patientAdded = new EventEmitter<void>();

  constructor(
    private patientService: PatientService,
    private http: HttpClient
  ) {}

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  submitForm(): void {
    if (!this.name || !this.age) {
      alert('Por favor complete todos los campos');
      return;
    }

    const randomId = Math.floor(Math.random() * 898) + 1;

    this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${randomId}`).subscribe({
      next: (pokemonData) => {
        // ✅ Usar CreatePatientDto en lugar de Omit<Patient, 'patient_id'>
        const newPatient: CreatePatientDto = {
          patientName: this.name,
          age: this.age!,
          gender: this.gender,
          imageUrl: pokemonData.sprites.front_default || ''
        };

        this.patientService.createPatient(newPatient).subscribe({
          next: (createdPatient) => {
            console.log('Paciente creado exitosamente:', createdPatient);
            this.toggleForm();
            this.patientAdded.emit();
            this.resetForm();
          },
          error: (err) => {
            console.error('Error al crear el paciente:', err);
            alert('Error al crear el paciente');
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener el Pokémon:', err);
        alert('No se pudo obtener la imagen del Pokémon');
      }
    });
  }

  resetForm(): void {
    this.name = '';
    this.age = null;
    this.gender = 'Femenino';
  }
}
