#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Deploy seguro para Perfil Primero
# Verifica cuenta Firebase, construye y despliega en orden correcto.
#
# Uso:
#   bash scripts/deploy.sh              # deploy completo
#   bash scripts/deploy.sh --only hosting
#   bash scripts/deploy.sh --only functions
#   bash scripts/deploy.sh --only hosting,firestore
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuración del proyecto ────────────────────────────────────────────────
EXPECTED_ACCOUNT="fabiancarrillo@gmail.com"
EXPECTED_PROJECT="perfil-primero"
FUNCTIONS_DIR="functions"

# ── Colores ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # sin color

log()    { echo -e "${BLUE}[deploy]${NC} $1"; }
ok()     { echo -e "${GREEN}[ok]${NC}    $1"; }
warn()   { echo -e "${YELLOW}[warn]${NC}  $1"; }
abort()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── 1. Pre-flight checks (cuenta, proyecto, builds, git) ─────────────────────
log "Ejecutando pre-flight checks..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if bash "${SCRIPT_DIR}/predeploy-check.sh"; then
  ok "Todos los checks pasaron."
else
  EXIT_CODE=$?
  if [[ $EXIT_CODE -eq 1 ]]; then
    abort "Pre-flight checks fallaron. Corrige los errores antes de desplegar."
  fi
  # exit 0 con warnings — continúa con confirmación extra
  warn "Hay advertencias en el pre-flight check. Revisa antes de continuar."
fi

# Leer cuenta activa para el resumen
ACTIVE_ACCOUNT=$(npx firebase login:list 2>/dev/null | grep "Logged in as" | awk '{print $NF}' || echo "$EXPECTED_ACCOUNT")

# ── 3. Determinar qué desplegar ───────────────────────────────────────────────
DEPLOY_ONLY="${1:-}"
DEPLOY_FUNCTIONS=true
DEPLOY_HOSTING=true
DEPLOY_FIRESTORE=true

if [[ -n "$DEPLOY_ONLY" && "$DEPLOY_ONLY" == "--only" ]]; then
  TARGET="${2:-}"
  DEPLOY_FUNCTIONS=false
  DEPLOY_HOSTING=false
  DEPLOY_FIRESTORE=false
  [[ "$TARGET" == *"functions"* ]] && DEPLOY_FUNCTIONS=true
  [[ "$TARGET" == *"hosting"* ]]   && DEPLOY_HOSTING=true
  [[ "$TARGET" == *"firestore"* ]] && DEPLOY_FIRESTORE=true
fi

# ── 4. Build Cloud Functions (si aplica) ─────────────────────────────────────
if [[ "$DEPLOY_FUNCTIONS" == true ]]; then
  log "Compilando Cloud Functions (TypeScript)..."
  cd "$FUNCTIONS_DIR"
  npm run build
  cd ..
  ok "Cloud Functions compiladas."
fi

# ── 5. Build Next.js (si aplica) ─────────────────────────────────────────────
if [[ "$DEPLOY_HOSTING" == true ]]; then
  log "Compilando frontend (Next.js)..."
  npx next build
  ok "Frontend compilado."
fi

# ── 6. Resumen antes de desplegar ────────────────────────────────────────────
echo ""
echo -e "${BLUE}──────────────────────────────────────────${NC}"
echo -e "${BLUE}  Perfil Primero — Deploy${NC}"
echo -e "${BLUE}──────────────────────────────────────────${NC}"
echo -e "  Cuenta  : ${GREEN}${ACTIVE_ACCOUNT}${NC}"
echo -e "  Proyecto: ${GREEN}${EXPECTED_PROJECT}${NC}"
echo -e "  Hosting : $( [[ "$DEPLOY_HOSTING" == true ]]   && echo "${GREEN}sí${NC}" || echo "${YELLOW}no${NC}" )"
echo -e "  Firestore: $( [[ "$DEPLOY_FIRESTORE" == true ]] && echo "${GREEN}sí${NC}" || echo "${YELLOW}no${NC}" )"
echo -e "  Functions: $( [[ "$DEPLOY_FUNCTIONS" == true ]] && echo "${GREEN}sí${NC}" || echo "${YELLOW}no${NC}" )"
echo -e "${BLUE}──────────────────────────────────────────${NC}"
echo ""

read -r -p "¿Confirmar deploy? [s/N] " CONFIRM
if [[ ! "$CONFIRM" =~ ^[sS]$ ]]; then
  warn "Deploy cancelado por el usuario."
  exit 0
fi

# ── 7. Firebase deploy ────────────────────────────────────────────────────────
TARGETS=""
[[ "$DEPLOY_HOSTING" == true ]]   && TARGETS="${TARGETS}hosting,"
[[ "$DEPLOY_FIRESTORE" == true ]] && TARGETS="${TARGETS}firestore,"
[[ "$DEPLOY_FUNCTIONS" == true ]] && TARGETS="${TARGETS}functions,"
TARGETS="${TARGETS%,}" # quitar coma final

log "Ejecutando: firebase deploy --only ${TARGETS}"
npx firebase deploy --only "$TARGETS"

echo ""
ok "¡Deploy completado! → https://perfil-primero.web.app"
