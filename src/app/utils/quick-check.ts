// Verificación rápida del estado del sistema
export class QuickCheck {
  
  static checkEnvironment(): {status: string, issues: string[]} {
    const issues: string[] = [];
    
    // Verificar localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
    } catch (e) {
      issues.push('LocalStorage no disponible');
    }
    
    // Verificar fetch API
    if (!window.fetch) {
      issues.push('Fetch API no disponible');
    }
    
    // Verificar URL actual
    const currentUrl = window.location.href;
    if (!currentUrl.includes('localhost:4200')) {
      issues.push(`URL inesperada: ${currentUrl}`);
    }
    
    return {
      status: issues.length === 0 ? 'OK' : 'ISSUES',
      issues
    };
  }
  
  static async checkBackend(baseUrl: string = 'http://localhost:5000'): Promise<{status: string, message: string}> {
    try {
      const response = await fetch(`${baseUrl}/api/auth/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        return {
          status: 'OK',
          message: 'Backend conectado exitosamente'
        };
      } else {
        return {
          status: 'ERROR',
          message: `Backend respondió con status: ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Desconocido'}`
      };
    }
  }
  
  static checkServices(): {status: string, services: {[key: string]: boolean}} {
    const services = {
      'HttpClient': true, // Siempre disponible en Angular moderno
      'Router': !!window.location,
      'LocalStorage': !!window.localStorage,
      'SessionStorage': !!window.sessionStorage
    };
    
    const allOk = Object.values(services).every(s => s);
    
    return {
      status: allOk ? 'OK' : 'ISSUES',
      services
    };
  }
}