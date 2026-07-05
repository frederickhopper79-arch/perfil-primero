# Onboarding de Desarrollo — Perfil Primero (HTES Cap. 29)

Guía de entrada para cualquier persona (o IA) que empiece a trabajar en este
proyecto. Objetivo: poder contribuir con seguridad sin depender de una sola
persona (principio HTES 10).

## 1. Orden oficial de lectura (HTES Cap. 31)

`README.md` → `AI_CONTEXT.md` → arquitectura (`docs/adr/`, `docs/DATABASE_DOC.md`,
`docs/API_DOC.md`) → `ROADMAP.md` → HTES (`docs/HTES_v1.0.docx`) → código.

Leer **antes** de tocar código. Si falta información, decirlo; nunca asumir.

## 2. Reglas no negociables de este repositorio

- **Aislamiento:** este repo es solo Perfil Primero. Nunca tocar otros proyectos
  (Kineassistance, Hopper Tech, etc.). Una sesión = un proyecto = una carpeta.
- **Cuenta Firebase:** todo `firebase deploy` debe hacerse como
  `perfilprimero7@gmail.com`. Verificar con `firebase login:list` **antes** de
  desplegar (PC multi-cliente).
- **Secretos:** nunca commitear `.env` reales. Frontend en `.env.local`,
  backend en `functions/.env`.
- **Dinero y anonimato:** no proponer escritura de cliente sobre colecciones
  write-locked; no exponer PII en `workerPublicProfiles`. Ver ADR-002.

## 3. Puesta en marcha local

```bash
# Frontend
cp .env.example .env.local     # completar variables Firebase
npm install
npm run dev                    # localhost:3000

# Cloud Functions
cd functions && npm ci && npm run build
```

## 4. Cómo probar (obligatorio antes de un cambio relevante — Cap. 5)

```bash
npm run test:unit     # 56 tests de lógica pura (dinero, matching, pricing)
npm run test:rules    # 25 tests de reglas Firestore (requiere emuladores)
npm run lint          # ESLint (pendiente de config — DEBT-003)
npm run build         # build estático del frontend
cd functions && npm run build   # typecheck de las functions
```

La lógica sensible (pagos, desbloqueos, cupones, semáforo financiero) está
extraída a `functions/src/lib/` justamente para poder testearla sin Firestore.
Todo cambio ahí debe venir con tests.

## 5. Cómo desplegar

```bash
firebase login:list                 # confirmar perfilprimero7@gmail.com
firebase deploy --only hosting                       # solo frontend
firebase deploy --only functions:NOMBRE              # una función
firebase deploy --only firestore:rules               # solo reglas
```

El CI/CD (`.github/workflows/deploy.yml`) está en modo manual hasta configurar
los GitHub Secrets (DEBT-003); por ahora los despliegues son manuales.

## 6. Flujo de trabajo y decisiones

- Commits pequeños, un cambio lógico cada uno, mensaje que dice qué y por qué.
- Decisiones de arquitectura → un ADR en `docs/adr/`. Cambios importantes en
  curso → un RFC en `docs/rfc/`. Incidentes → un postmortem (`docs/plantillas/`).
- Toda excepción a una regla HTES se documenta (Cap. 42; ver AI_CONTEXT §9).
- Antes de modificar un módulo, construir el mapa de impacto: qué depende de él
  (Cap. 33).

## 7. Dónde está cada cosa

| Necesito… | Ver |
|---|---|
| Contexto general y restricciones | `AI_CONTEXT.md` |
| Modelo de datos y privacidad | `docs/DATABASE_DOC.md`, `docs/privacidad/RAT_REGISTRO_TRATAMIENTO.md` |
| API de Cloud Functions | `docs/API_DOC.md` |
| Por qué se decidió X | `docs/adr/` |
| Qué falta / riesgos / deuda | `ROADMAP.md`, `docs/RISK_REGISTER.md`, `docs/TECHNICAL_DEBT.md` |
| Antes de lanzar | `docs/CHECKLIST_PRE_LANZAMIENTO.md` |
