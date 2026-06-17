# Usuarios demo preparados

Password comun:

```text
PerfilPrimero2026!
```

## Admin

```text
admin@perfilprimero.cl
```

## Trabajadores

```text
trabajador1@perfilprimero.cl
trabajador2@perfilprimero.cl
trabajador3@perfilprimero.cl
trabajador4@perfilprimero.cl
trabajador5@perfilprimero.cl
```

## Empresas

```text
empresa1@perfilprimero.cl
empresa2@perfilprimero.cl
```

## Crear usuarios reales en Firebase

Cuando haya acceso con credenciales de administrador de Google/Firebase:

```powershell
cd functions
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\service-account.json"
node scripts\seed-demo-data.mjs
```

El script crea usuarios en Firebase Auth y documentos en Firestore.
