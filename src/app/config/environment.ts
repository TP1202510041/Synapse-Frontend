// Configuración de entorno simple
export const environment = {
  production: false,
  apiUrl: 'https://synapse-backend--0000001.wonderfulforest-e77213bb.brazilsouth.azurecontainerapps.io'
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