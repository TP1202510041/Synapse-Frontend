# 🔧 Guía de Solución de Problemas

## 🚨 Errores Comunes y Soluciones

### 1. **Error de PowerShell - Política de Ejecución**
```
No se puede cargar el archivo npm.ps1. El archivo no está firmado digitalmente.
```

**Solución:**
```powershell
# Opción 1: Cambiar política temporalmente
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Opción 2: Usar cmd en lugar de PowerShell
cmd
ng serve

# Opción 3: Usar npx directamente
npx ng serve
```

### 2. **Errores de Compilación Angular**

#### Error: "Cannot find module"
```
Error: Cannot find module '@angular/common/http'
```

**Solución:**
```bash
npm install
# o
npm ci
```

#### Error: "Component not found"
```
Error: Component 'ClinicalObservationsComponent' is not found
```

**Solución:**
- Los componentes complejos están temporalmente deshabilitados
- Usa los componentes simples primero:
  - `SimpleObservationsComponent` en lugar de `ClinicalObservationsComponent`
  - `DiagnosticComponent` para probar la conexión

### 3. **Errores de Conexión Backend**

#### Error: "CORS policy"
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución:**
- Verifica que el backend esté corriendo en `localhost:5000`
- Asegúrate de que el backend tenga CORS configurado para `localhost:4200`

#### Error: "Connection refused"
```
GET http://localhost:5000/api/auth/test net::ERR_CONNECTION_REFUSED
```

**Solución:**
1. Verifica que el backend esté corriendo:
   ```bash
   # En la carpeta del backend
   mvn spring-boot:run
   # o
   java -jar target/tu-backend.jar
   ```

2. Verifica que el puerto sea correcto (5000)

### 4. **Errores de Dependencias**

#### Error: "Circular dependency"
```
Warning: Circular dependency detected
```

**Solución:**
- Usa los servicios simplificados
- Evita importar `AuthService` en componentes complejos temporalmente

## 🛠️ Comandos de Diagnóstico

### Verificar Estado del Proyecto
```bash
# Verificar versión de Angular
ng version

# Verificar dependencias
npm list

# Limpiar caché
npm cache clean --force
rm -rf node_modules
npm install
```

### Probar Conexión Backend
1. Ve a `http://localhost:4200/diagnostic`
2. Haz clic en "Probar Conexión Backend"
3. Verifica el resultado

### Compilación Paso a Paso
```bash
# 1. Compilar sin servir
ng build

# 2. Si hay errores, compilar en modo desarrollo
ng build --configuration development

# 3. Servir con información detallada
ng serve --verbose
```

## 📋 Lista de Verificación

### ✅ Antes de ejecutar `ng serve`:

1. **Backend corriendo:**
   - [ ] Backend en `localhost:5000`
   - [ ] Endpoint `/api/auth/test` responde

2. **Dependencias instaladas:**
   - [ ] `npm install` ejecutado
   - [ ] No hay errores en `package.json`

3. **Archivos principales:**
   - [ ] `app.config.ts` existe
   - [ ] `app.routes.ts` existe
   - [ ] No hay errores de sintaxis

4. **Configuración:**
   - [ ] URLs apuntan a `localhost:5000`
   - [ ] No hay imports circulares

### ✅ Si `ng serve` falla:

1. **Usar componentes simples:**
   - [ ] Comentar imports complejos
   - [ ] Usar `SimpleObservationsComponent`
   - [ ] Usar `DiagnosticComponent`

2. **Verificar errores específicos:**
   - [ ] Leer mensaje de error completo
   - [ ] Buscar línea específica del error
   - [ ] Verificar imports y exports

## 🚀 Pasos para Arrancar Exitosamente

### Opción 1: Arranque Mínimo
```bash
# 1. Asegurar que solo lo básico funcione
# 2. Comentar componentes complejos
# 3. Usar rutas simples
ng serve
```

### Opción 2: Arranque con Diagnóstico
```bash
# 1. Ir a localhost:4200/diagnostic
# 2. Probar conexión backend
# 3. Verificar que todo esté verde
# 4. Luego habilitar funcionalidades avanzadas
```

### Opción 3: Arranque Gradual
```bash
# 1. Empezar con funcionalidades existentes
# 2. Agregar una funcionalidad nueva a la vez
# 3. Probar cada paso
```

## 📞 Si Nada Funciona

1. **Resetear a estado conocido:**
   ```bash
   git stash  # Guardar cambios
   git checkout main  # Volver a versión estable
   ng serve  # Probar que funcione
   ```

2. **Aplicar cambios gradualmente:**
   - Aplicar un archivo a la vez
   - Probar después de cada cambio
   - Identificar qué archivo causa el problema

3. **Usar versiones simplificadas:**
   - Todos los componentes tienen versiones simples
   - Usar `DiagnosticComponent` para probar
   - Habilitar funcionalidades avanzadas después

## 🎯 Objetivo Inmediato

**Meta:** Que `ng serve` arranque sin errores

**Pasos:**
1. ✅ Backend corriendo en localhost:5000
2. ✅ `ng serve` sin errores de compilación
3. ✅ Página principal carga
4. ✅ Login funciona
5. ✅ Navegación básica funciona

**Después:** Habilitar nuevas funcionalidades una por una.