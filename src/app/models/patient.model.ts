// src/app/models/patient.model.ts

export interface Patient {
  patientId: number;      // Coincide con la API
  patientName: string;
  age: number;
  gender: string;
  imageUrl: string;
  userName: string;
  totalSessions: number;
}

// Para crear nuevos pacientes (sin campos autogenerados)
export interface CreatePatientDto {
  patientName: string;
  age: number;
  gender: string;
  imageUrl: string;
}

// Para actualizar pacientes existentes
export interface UpdatePatientDto extends Partial<CreatePatientDto> {}
