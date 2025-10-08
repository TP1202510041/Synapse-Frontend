// Configuración de entorno simple
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000'
};

// URLs de API
export const API_URLS = {
  AUTH: `${environment.apiUrl}/api/auth`,
  SESSIONS: `${environment.apiUrl}/api/sessions`,
  OBSERVATIONS: `${environment.apiUrl}/api/observations`,
  ANALYTICS: `${environment.apiUrl}/api/analytics`,
  EXPORTS: `${environment.apiUrl}/api/exports`,
  VR_SESSIONS: `${environment.apiUrl}/api/sessions/vr`,
  EVENTS: `${environment.apiUrl}/events`
};