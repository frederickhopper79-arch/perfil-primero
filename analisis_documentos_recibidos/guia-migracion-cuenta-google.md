# Guía de migración — fabiancarrillo@gmail.com → perfil_primero@gmail.com

> **Estado:** Pendiente de ejecución · Sin urgencia · Cero pérdida de datos si se sigue el orden.
>
> **Tiempo estimado total:** 45–90 minutos
>
> **Riesgo:** Bajo si se respeta el orden. La plataforma permanece operativa durante todo el proceso.

---

## Resumen del plan

No se mueven datos. Se transfiere la **propiedad del proyecto Firebase** de una cuenta Google a otra. Los datos (Firestore, Auth, Storage, Functions) están dentro del proyecto y viajan con él automáticamente.

```
fabiancarrillo@gmail.com  →  Owner actual
perfil_primero@gmail.com  →  nuevo Owner principal
```

---

## Fase 0 — Preparación (hacer ANTES del día de migración)

### 0.1 Crear la cuenta Google

- Crear `perfil_primero@gmail.com` en accounts.google.com
- Activar verificación en dos pasos (2FA) desde el primer día
- Guardar la contraseña en un gestor seguro
- **No usar esta cuenta para nada más** (no YouTube, no Drive personal)

### 0.2 Verificar acceso de fabiancarrillo

- Confirmar que puedes iniciar sesión en Firebase Console con fabiancarrillo@gmail.com
- Confirmar que puedes acceder a Google Cloud Console del proyecto `perfil-primero`
- Tener ambas cuentas abiertas en navegadores distintos (ej: Chrome y Edge) durante el proceso

### 0.3 Hacer backup de variables de entorno

- Guardar una copia de `.env.local` y `functions/.env` en lugar seguro
- Estos archivos contienen claves de Mercado Pago, Stripe, Gemini — son independientes de la cuenta Google

---

## Fase 1 — Agregar perfil_primero como Owner en Firebase

> **Sin impacto en producción.** Agregar un Owner no interrumpe ningún servicio.

### Paso 1.1 — Abrir Firebase Console

1. Ir a https://console.firebase.google.com con **fabiancarrillo@gmail.com**
2. Seleccionar proyecto **perfil-primero**

### Paso 1.2 — Agregar el nuevo Owner

1. Hacer clic en el ícono ⚙️ (Configuración del proyecto) → **Usuarios y permisos**
2. Clic en **Agregar miembro**
3. Ingresar: `perfil_primero@gmail.com`
4. Rol: seleccionar **Propietario (Owner)**
5. Clic en **Agregar**
6. Google enviará un correo de invitación a perfil_primero@gmail.com

### Paso 1.3 — Aceptar la invitación

1. Abrir el correo en la cuenta `perfil_primero@gmail.com`
2. Aceptar la invitación
3. Verificar que ahora aparece con rol **Owner** en la consola de Firebase

**✅ Checkpoint:** Ambas cuentas son Owner del proyecto. La plataforma sigue funcionando normal.

---

## Fase 2 — Migrar la cuenta de facturación (Billing)

> Esta fase es importante para que los costos futuros se carguen a la cuenta correcta.

### Paso 2.1 — Crear cuenta de facturación en la nueva cuenta

1. Abrir Google Cloud Console: https://console.cloud.google.com con **perfil_primero@gmail.com**
2. Ir a **Facturación** (menú lateral o buscarlo)
3. Crear una nueva cuenta de facturación con los datos de Perfil Primero SpA:
   - Nombre: Perfil Primero SpA
   - RUT: 78.449.783-6
   - Tarjeta de crédito o débito corporativa

### Paso 2.2 — Vincular el proyecto a la nueva cuenta de facturación

1. Abrir Google Cloud Console con **fabiancarrillo@gmail.com**
2. Ir a **Facturación** → **Mis proyectos**
3. Buscar `perfil-primero`
4. Clic en los tres puntos → **Cambiar facturación**
5. Seleccionar la cuenta de facturación creada en el paso anterior
6. Confirmar

**✅ Checkpoint:** Los costos futuros se cargan a Perfil Primero SpA. La tarjeta de Fabián ya no recibe cobros del proyecto.

---

## Fase 3 — Configurar perfil_primero como admin en la app

> La cuenta Google es distinta al rol de admin dentro de la aplicación. Hay que hacer ambos.

### Paso 3.1 — Primer login en la consola admin

1. Abrir https://perfil-primero.web.app/consola-admin en navegador con `perfil_primero@gmail.com`
2. Hacer clic en "Entrar con Google"
3. Firebase Auth creará automáticamente un nuevo usuario para esta cuenta
4. Anota el UID que aparece (o lo buscamos en Firebase Console → Authentication)

### Paso 3.2 — Asignar rol admin en Firestore

1. Abrir Firebase Console con cualquier cuenta Owner
2. Ir a **Firestore Database** → colección `users`
3. Buscar el documento con el UID de `perfil_primero@gmail.com`
   - Si no existe: crear documento nuevo con ese UID como ID
4. Agregar o editar el campo:
   - Campo: `role`
   - Tipo: string
   - Valor: `admin`
5. Guardar

### Paso 3.3 — Verificar acceso admin

1. Volver a https://perfil-primero.web.app/consola-admin
2. Iniciar sesión con `perfil_primero@gmail.com`
3. Confirmar que carga el dashboard de administración correctamente

**✅ Checkpoint:** perfil_primero@gmail.com tiene acceso completo de administración a la plataforma.

---

## Fase 4 — Reasignar servicios conectados

### Paso 4.1 — Mercado Pago

1. Ingresar a https://www.mercadopago.cl con la cuenta de Mercado Pago actual
2. Evaluar si crear una cuenta Mercado Pago para Perfil Primero SpA (con el RUT 78.449.783-6)
3. Si se crea cuenta nueva: actualizar `MERCADOPAGO_ACCESS_TOKEN` en `functions/.env` y redesplegar Cloud Functions

### Paso 4.2 — Dominio perfil-primero.cl (cuando esté activo)

- El dominio se vincula al proyecto Firebase, no a la cuenta Google personal
- No requiere cambio si el proyecto ya está migrado

### Paso 4.3 — GitHub (si el código está en repositorio)

- Crear organización GitHub `perfil-primero` (o usuario `perfil-primero`)
- Transferir el repositorio desde la cuenta actual
- Actualizar el remote en el repositorio local:
  ```bash
  git remote set-url origin https://github.com/perfil-primero/perfil-primero.git
  ```

---

## Fase 5 — Rebajar fabiancarrillo@gmail.com (opcional)

> Solo hacer esto cuando perfil_primero tenga acceso confirmado a todo.

### Opción A — Mantener como Editor (recomendado)

1. Firebase Console → Usuarios y permisos
2. Cambiar rol de fabiancarrillo@gmail.com de **Owner** a **Editor**
3. Mantiene acceso de respaldo sin ser propietario

### Opción B — Eliminar del proyecto

1. Firebase Console → Usuarios y permisos
2. Eliminar fabiancarrillo@gmail.com del proyecto
3. Solo hacer si se está seguro de que perfil_primero tiene acceso completo y estable

---

## Fase 6 — Verificación final

| Verificación | Cómo hacerlo |
|---|---|
| Firebase Console accesible | Login con perfil_primero en console.firebase.google.com |
| Firestore con datos | Ver colecciones en Firebase Console |
| Cloud Functions activas | Firebase Console → Functions → verificar estado |
| Hosting funcionando | Abrir perfil-primero.web.app en navegador |
| Admin app funcional | Login en /consola-admin con perfil_primero |
| Billing correcto | Google Cloud Console → Billing → confirmar cuenta |
| Gemini API activa | Probar análisis de CV en panel postulante |

---

## Qué NO hay que hacer

- ❌ No crear un proyecto Firebase nuevo — perdería todos los datos
- ❌ No eliminar fabiancarrillo antes de confirmar que perfil_primero tiene acceso
- ❌ No cambiar el nombre del proyecto Firebase (`perfil-primero`) — rompe las URLs de Functions
- ❌ No revocar el token de Mercado Pago sin tener el nuevo token listo

---

## Tiempo por fase

| Fase | Tiempo estimado |
|---|---|
| Fase 0 — Preparación | 20 min |
| Fase 1 — Firebase Owner | 10 min |
| Fase 2 — Billing | 15 min |
| Fase 3 — Admin en app | 10 min |
| Fase 4 — Servicios conectados | 15–30 min |
| Fase 5 — Rebajar cuenta vieja | 5 min |
| Fase 6 — Verificación | 10 min |
| **Total** | **~90 min** |

---

## Notas finales

- Esta migración puede hacerse **en cualquier momento** — no hay fecha límite
- La plataforma permanece **100% operativa** durante todo el proceso
- Si algo falla en cualquier fase, fabiancarrillo@gmail.com sigue siendo Owner hasta que confirmes que todo está bien
- Cuando estés listo, avísame y lo ejecutamos juntos paso a paso en tiempo real
