# 🔧 Cambios Requeridos en el Backend

## 🚨 **PROBLEMAS IDENTIFICADOS Y SOLUCIONES**

### 1. **PROBLEMA: Login no devuelve userId**

#### **Problema Actual:**
```json
// Login Response actual
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "email": "Ra@correo.com",
    "userName": "Ra@correo.com",
    "role": "USER",
    "message": "Login exitoso"
  }
}
```

#### **Solución Requerida:**
```json
// Login Response NECESARIO
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "email": "Ra@correo.com",
    "userName": "Ra@correo.com",
    "role": "USER",
    "userId": 1,  // ← AGREGAR ESTE CAMPO
    "message": "Login exitoso"
  }
}
```

#### **Cambio en Backend:**
```java
// En AuthController.java - método login()
@PostMapping("/login")
public ResponseEntity<ApiResponse<LoginResponseDto>> login(@RequestBody LoginRequestDto request) {
    // ... lógica de autenticación existente ...
    
    LoginResponseDto responseData = LoginResponseDto.builder()
        .token(jwtToken)
        .email(user.getEmail())
        .userName(user.getUserName())
        .role(user.getRole().toString())
        .userId(user.getUserId())  // ← AGREGAR ESTA LÍNEA
        .message("Login exitoso")
        .build();
    
    return ResponseEntity.ok(ApiResponse.success("Login exitoso", responseData));
}
```

---

### 2. **PROBLEMA: Observaciones - therapistId se obtiene del token**

#### **Situación Actual:**
- El POST `/api/observations` requiere `therapistId` en el body
- Pero el frontend no tiene acceso al `userId` del terapeuta
- **SOLUCIÓN**: El backend debe extraer el `therapistId` del token JWT

#### **Request Actual del Frontend:**
```json
{
  "sessionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": 1,
  "content": "Observación clínica aquí",
  "sessionDate": "2025-10-02"
}
```

#### **Cambio Requerido en Backend:**
```java
// En ClinicalObservationController.java
@PostMapping
public ResponseEntity<ApiResponse<ClinicalObservationResponseDto>> createObservation(
    @RequestBody CreateObservationRequestDto request,
    Authentication authentication) {  // ← Inyectar Authentication
    
    // Obtener userId del token JWT
    String userEmail = authentication.getName();
    User therapist = userService.findByEmail(userEmail);
    Integer therapistId = therapist.getUserId();  // ← Obtener del token
    
    // Crear observación con therapistId del token
    ClinicalObservation observation = ClinicalObservation.builder()
        .sessionId(UUID.fromString(request.getSessionId()))
        .patientId(request.getPatientId())
        .therapistId(therapistId)  // ← Usar el ID del token
        .content(request.getContent())
        .sessionDate(LocalDate.parse(request.getSessionDate()))
        .build();
    
    // ... resto de la lógica ...
}
```

#### **DTO Actualizado:**
```java
// CreateObservationRequestDto.java - REMOVER therapistId
public class CreateObservationRequestDto {
    private String sessionId;
    private Integer patientId;
    private String content;
    private String sessionDate;
    // NO incluir therapistId - se obtiene del token
}
```

---

### 3. **PROBLEMA: Analytics - Comparación necesita 2 sesiones mínimo**

#### **Request Actual:**
```json
{
  "sessionIds": ["244bc0ab-4c5c-4b56-bf44-5e0bada57bd4"]  // ← Solo 1 sesión
}
```

#### **Solución Requerida:**
```java
// En AnalyticsController.java
@PostMapping("/compare-sessions")
public ResponseEntity<ApiResponse<SessionComparisonDto>> compareSessions(
    @RequestBody CompareSessionsRequestDto request) {
    
    // Validar que hay al menos 2 sesiones
    if (request.getSessionIds() == null || request.getSessionIds().size() < 2) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("Se requieren al menos 2 sesiones para comparar"));
    }
    
    // ... resto de la lógica de comparación ...
}
```

#### **Frontend Actualizado:**
El frontend ahora enviará:
```json
{
  "sessionIds": [
    "244bc0ab-4c5c-4b56-bf44-5e0bada57bd4",
    "otro-session-id-aqui"
  ]
}
```

---

### 4. **PROBLEMA: Export PDF - Error 404 en descarga**

#### **Problema Identificado:**
- `POST /api/exports/patient/{patientId}/pdf` funciona
- `GET /api/exports/{exportId}/download` devuelve 404

#### **Posibles Causas:**
1. El `exportId` no se está guardando correctamente
2. El archivo PDF no se está generando en la ruta esperada
3. El endpoint de descarga no encuentra el archivo

#### **Verificaciones Necesarias:**
```java
// En ExportController.java
@GetMapping("/{exportId}/download")
public ResponseEntity<Resource> downloadPdf(@PathVariable String exportId) {
    try {
        // 1. Verificar que el exportId existe en la base de datos
        ExportLog exportLog = exportService.findByExportId(UUID.fromString(exportId));
        if (exportLog == null) {
            return ResponseEntity.notFound().build();
        }
        
        // 2. Verificar que el archivo existe físicamente
        Path filePath = Paths.get(exportLog.getFilePath());
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        
        // 3. Verificar que no ha expirado
        if (exportLog.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.notFound().build();
        }
        
        // 4. Servir el archivo
        Resource resource = new FileSystemResource(filePath);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, 
                   "attachment; filename=\"" + resource.getFilename() + "\"")
            .body(resource);
            
    } catch (Exception e) {
        log.error("Error downloading PDF: " + e.getMessage(), e);
        return ResponseEntity.notFound().build();
    }
}
```

---

### 5. **MEJORA: VR Sessions - Funcionalidad opcional**

#### **Estado Actual:**
- Los endpoints de VR Sessions están implementados
- Pero no se están usando en el frontend actual

#### **Recomendación:**
- Mantener los endpoints para uso futuro
- No requiere cambios inmediatos
- Se puede implementar gradualmente

---

## 🔧 **RESUMEN DE CAMBIOS REQUERIDOS**

### **CRÍTICOS (Necesarios para que funcione):**

1. **✅ AGREGAR userId al Login Response**
   ```java
   // En LoginResponseDto
   private Integer userId;  // ← AGREGAR
   ```

2. **✅ OBTENER therapistId del token JWT en Observaciones**
   ```java
   // En ClinicalObservationController
   Integer therapistId = getCurrentUserIdFromToken(authentication);
   ```

3. **✅ VALIDAR mínimo 2 sesiones en Analytics Compare**
   ```java
   // En AnalyticsController
   if (request.getSessionIds().size() < 2) {
       throw new BadRequestException("Mínimo 2 sesiones requeridas");
   }
   ```

4. **✅ ARREGLAR descarga de PDF Export**
   ```java
   // Verificar que el archivo existe y no ha expirado
   // Logs detallados para debugging
   ```

### **OPCIONALES (Mejoras futuras):**

1. **Implementar VR Sessions en frontend**
2. **Mejorar manejo de errores**
3. **Agregar más validaciones**

---

## 🧪 **CÓMO PROBAR LOS CAMBIOS**

### **1. Probar Login con userId:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"Ra@correo.com","password":"hola"}'
```
**Esperado:** Response debe incluir `"userId": 1`

### **2. Probar Observaciones:**
```bash
curl -X POST http://localhost:5000/api/observations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "244bc0ab-4c5c-4b56-bf44-5e0bada57bd4",
    "patientId": 1,
    "content": "Prueba de observación",
    "sessionDate": "2025-10-02"
  }'
```
**Esperado:** Debe crear la observación sin requerir `therapistId`

### **3. Probar Analytics Compare:**
```bash
curl -X POST http://localhost:5000/api/analytics/compare-sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionIds": [
      "244bc0ab-4c5c-4b56-bf44-5e0bada57bd4",
      "otro-session-id"
    ]
  }'
```
**Esperado:** Debe comparar las 2 sesiones

### **4. Probar Export PDF:**
```bash
# 1. Generar PDF
curl -X POST http://localhost:5000/api/exports/patient/1/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"includeGraphs": true, "dateFrom": "2025-10-01", "dateTo": "2025-10-02"}'

# 2. Descargar PDF (usar exportId de la respuesta anterior)
curl -X GET http://localhost:5000/api/exports/{exportId}/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output reporte.pdf
```
**Esperado:** Debe descargar el archivo PDF

---

## 🎯 **PRIORIDAD DE IMPLEMENTACIÓN**

1. **🔴 ALTA:** Login userId (sin esto no funcionan las observaciones)
2. **🔴 ALTA:** Observaciones therapistId del token
3. **🟡 MEDIA:** Analytics validación 2 sesiones
4. **🟡 MEDIA:** Export PDF descarga
5. **🟢 BAJA:** VR Sessions (futuro)

---

**Una vez implementados estos cambios, el frontend funcionará completamente con el backend real.** 🚀