// Configuración centralizada de la API
export const API_CONFIG = {
  // URL base del backend
  BASE_URL: 'http://localhost:5000',
  
  // Endpoints principales
  ENDPOINTS: {
    // Autenticación
    AUTH: {
      BASE: '/api/auth',
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      CHECK_EMAIL: '/api/auth/check-email',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      LOGIN_ATTEMPTS: '/api/auth/login-attempts',
      TEST: '/api/auth/test'
    },
    
    // Sesiones
    SESSIONS: {
      BASE: '/api/sessions',
      BY_PATIENT: '/api/sessions/patient',
      TODAY: '/today',
      LATEST: '/latest',
      FILTERED: '/filtered',
      CALENDAR: '/api/sessions/calendar'
    },
    
    // Observaciones clínicas
    OBSERVATIONS: {
      BASE: '/api/observations',
      BY_SESSION: '/api/observations/session',
      BY_PATIENT: '/api/observations/patient'
    },
    
    // Analytics
    ANALYTICS: {
      BASE: '/api/analytics',
      PROGRESS: '/progress',
      COMPARE: '/compare-sessions',
      METRICS: '/metrics'
    },
    
    // Exportación
    EXPORTS: {
      BASE: '/api/exports',
      PDF: '/pdf',
      DOWNLOAD: '/download'
    },
    
    // Sesiones VR
    VR_SESSIONS: {
      BASE: '/api/sessions/vr',
      BY_PATIENT: '/patient',
      BY_SCENARIO: '/scenario',
      BY_DEVICE: '/device'
    },
    
    // Eventos (existente)
    EVENTS: '/events'
  },
  
  // Configuración de timeouts
  TIMEOUTS: {
    DEFAULT: 30000, // 30 segundos
    UPLOAD: 60000,  // 60 segundos para uploads
    EXPORT: 120000  // 2 minutos para exportaciones
  },
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  },
  
  // Configuración de archivos
  FILES: {
    MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword']
  }
};

// Función helper para construir URLs completas
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Función helper para construir URLs con parámetros
export function buildApiUrlWithParams(endpoint: string, params: { [key: string]: any }): string {
  const url = new URL(buildApiUrl(endpoint));
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      if (Array.isArray(params[key])) {
        params[key].forEach((value: any) => {
          url.searchParams.append(key, value.toString());
        });
      } else {
        url.searchParams.append(key, params[key].toString());
      }
    }
  });
  
  return url.toString();
}

// Configuración de headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Función para obtener headers con autenticación
export function getAuthHeaders(): { [key: string]: string } {
  const token = localStorage.getItem('token');
  return {
    ...DEFAULT_HEADERS,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}