#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# predeploy-check.sh — Checklist de seguridad pre-deploy para Perfil Primero
#
# Verifica 5 condiciones antes de cualquier deploy:
#   1. Cuenta Firebase activa correcta
#   2. Proyecto en .firebaserc correcto
#   3. Build de Next.js actualizado (out/ más nuevo que src)
#   4. Build de Functions actualizado (lib/ más nuevo que src/)
#   5. Sin cambios sin commitear en git
#
# Uso:
#   bash scripts/predeploy-check.sh          # solo chequeo, no despliega
#   bash scripts/predeploy-check.sh --fix    # intenta corregir lo que puede
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuración ─────────────────────────────────────────────────────────────
EXPECTED_ACCOUNT="fabiancarrillo@gmail.com"
EXPECTED_PROJECT="perfil-primero"
FIX_MODE=false
[[ "${1:-}" == "--fix" ]] && FIX_MODE=true

# ── Colores ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

pass()  { echo -e "  ${GREEN}✓${NC} $1"; ((PASS++)); }
fail()  { echo -e "  ${RED}✗${NC} $1"; ((FAIL++)); }
warn()  { echo -e "  ${YELLOW}⚠${NC} $1"; ((WARN++)); }
info()  { echo -e "  ${BLUE}·${NC} $1"; }
title() { echo -e "\n${BOLD}$1${NC}"; }

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo -e "${BOLD}${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BOLD}${BLUE}  Perfil Primero — Pre-deploy Checklist${NC}"
echo -e "${BOLD}${BLUE}════════════════════════════════════════════${NC}"

# ── CHECK 1: Cuenta Firebase ──────────────────────────────────────────────────
title "1. Cuenta Firebase CLI"

ACTIVE_ACCOUNT=$(npx firebase login:list 2>/dev/null | grep "Logged in as" | awk '{print $NF}' || echo "")

if [[ -z "$ACTIVE_ACCOUNT" ]]; then
  fail "Sin sesión activa en Firebase CLI"
  info "Solución: npx firebase login  →  usa ${EXPECTED_ACCOUNT}"
elif [[ "$ACTIVE_ACCOUNT" == "$EXPECTED_ACCOUNT" ]]; then
  pass "Cuenta correcta: ${ACTIVE_ACCOUNT}"
else
  fail "Cuenta incorrecta: ${RED}${ACTIVE_ACCOUNT}${NC}"
  info "Esperada        : ${GREEN}${EXPECTED_ACCOUNT}${NC}"
  if [[ "$FIX_MODE" == true ]]; then
    warn "Modo --fix: ejecuta 'npx firebase logout && npx firebase login' manualmente."
  else
    info "Solución: npx firebase logout  →  npx firebase login  →  selecciona ${EXPECTED_ACCOUNT}"
  fi
fi

# ── CHECK 2: Proyecto en .firebaserc ─────────────────────────────────────────
title "2. Proyecto en .firebaserc"

if [[ -f ".firebaserc" ]]; then
  FIREBASERC_PROJECT=$(node -pe "require('./.firebaserc').projects.default" 2>/dev/null || echo "")
  if [[ "$FIREBASERC_PROJECT" == "$EXPECTED_PROJECT" ]]; then
    pass "Proyecto en .firebaserc: ${FIREBASERC_PROJECT}"
  else
    fail "Proyecto en .firebaserc: ${RED}${FIREBASERC_PROJECT}${NC} (esperado: ${EXPECTED_PROJECT})"
    if [[ "$FIX_MODE" == true ]]; then
      echo "{\"projects\":{\"default\":\"${EXPECTED_PROJECT}\"}}" > .firebaserc
      pass "Corregido automáticamente → .firebaserc apunta a ${EXPECTED_PROJECT}"
    fi
  fi
else
  fail ".firebaserc no encontrado en la raíz del proyecto"
fi

# ── CHECK 3: Build de Next.js actualizado ────────────────────────────────────
title "3. Build Next.js (directorio out/)"

if [[ ! -d "out" ]]; then
  fail "Directorio out/ no existe — ejecuta: npx next build"
else
  NEWEST_SRC=$(find app components lib public -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.json" \) \
    ! -path "*/node_modules/*" -printf "%T@\n" 2>/dev/null | sort -rn | head -1 || echo "0")
  NEWEST_OUT=$(find out -type f -printf "%T@\n" 2>/dev/null | sort -rn | head -1 || echo "0")

  OUT_AGE_MIN=$(( ( $(date +%s) - ${NEWEST_OUT%.*} ) / 60 ))

  if (( $(echo "$NEWEST_SRC > $NEWEST_OUT" | bc -l 2>/dev/null || echo 0) )); then
    warn "out/ puede estar desactualizado (hay archivos fuente más nuevos)"
    info "Última modificación en src: $(date -d @${NEWEST_SRC%.*} '+%d/%m %H:%M' 2>/dev/null || echo '?')"
    info "Último build en out/      : $(date -d @${NEWEST_OUT%.*} '+%d/%m %H:%M' 2>/dev/null || echo '?')"
    if [[ "$FIX_MODE" == true ]]; then
      info "Modo --fix: reconstruyendo Next.js..."
      npx next build && pass "Build Next.js completado." || fail "Build Next.js falló."
    else
      info "Solución: npx next build"
    fi
  else
    pass "out/ actualizado (compilado hace ${OUT_AGE_MIN} min)"
  fi
fi

# ── CHECK 4: Build de Cloud Functions actualizado ────────────────────────────
title "4. Build Cloud Functions (functions/lib/)"

if [[ ! -d "functions/lib" ]]; then
  fail "functions/lib/ no existe — ejecuta: cd functions && npm run build"
else
  NEWEST_FUNC_SRC=$(find functions/src -type f -name "*.ts" -printf "%T@\n" 2>/dev/null | sort -rn | head -1 || echo "0")
  NEWEST_FUNC_LIB=$(find functions/lib -type f -name "*.js" -printf "%T@\n" 2>/dev/null | sort -rn | head -1 || echo "0")

  FUNC_AGE_MIN=$(( ( $(date +%s) - ${NEWEST_FUNC_LIB%.*} ) / 60 ))

  if (( $(echo "$NEWEST_FUNC_SRC > $NEWEST_FUNC_LIB" | bc -l 2>/dev/null || echo 0) )); then
    warn "functions/lib/ puede estar desactualizado (hay .ts más nuevos que el .js compilado)"
    if [[ "$FIX_MODE" == true ]]; then
      info "Modo --fix: compilando Functions..."
      (cd functions && npm run build) && pass "Build Functions completado." || fail "Build Functions falló."
    else
      info "Solución: cd functions && npm run build"
    fi
  else
    pass "functions/lib/ actualizado (compilado hace ${FUNC_AGE_MIN} min)"
  fi
fi

# ── CHECK 5: Git — sin cambios sin commitear ──────────────────────────────────
title "5. Estado de git"

if ! command -v git &>/dev/null; then
  warn "git no disponible — omitiendo verificación"
else
  UNCOMMITTED=$(git status --porcelain 2>/dev/null | grep -v "^??" || echo "")
  UNTRACKED=$(git status --porcelain 2>/dev/null | grep "^??" | wc -l | tr -d ' ')
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")

  info "Rama activa: ${BRANCH}"

  if [[ -z "$UNCOMMITTED" ]]; then
    pass "Sin cambios sin commitear"
  else
    MODIFIED_COUNT=$(echo "$UNCOMMITTED" | wc -l | tr -d ' ')
    warn "${MODIFIED_COUNT} archivo(s) modificado(s) sin commitear:"
    echo "$UNCOMMITTED" | head -10 | while read -r line; do
      echo -e "     ${YELLOW}${line}${NC}"
    done
    [[ "$MODIFIED_COUNT" -gt 10 ]] && info "  ... y más. Ejecuta: git status"
  fi

  if [[ "$UNTRACKED" -gt 0 ]]; then
    info "${UNTRACKED} archivo(s) sin trackear (git untracked)"
  fi
fi

# ── Resultado final ───────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${BLUE}════════════════════════════════════════════${NC}"

TOTAL=$(( PASS + FAIL + WARN ))

if [[ "$FAIL" -eq 0 && "$WARN" -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}  ✓ Todo OK — listo para deploy${NC}"
  echo -e "  ${PASS}/${TOTAL} checks pasados"
  echo -e "${BOLD}${BLUE}════════════════════════════════════════════${NC}"
  echo ""
  echo -e "  Ejecuta: ${BOLD}bash scripts/deploy.sh${NC}"
  echo ""
  exit 0
elif [[ "$FAIL" -gt 0 ]]; then
  echo -e "${RED}${BOLD}  ✗ ${FAIL} check(s) fallido(s) — deploy bloqueado${NC}"
  echo -e "  ${PASS} ok · ${FAIL} fallos · ${WARN} advertencias"
  echo -e "${BOLD}${BLUE}════════════════════════════════════════════${NC}"
  echo ""
  echo -e "  Corrige los errores o ejecuta: ${BOLD}bash scripts/predeploy-check.sh --fix${NC}"
  echo ""
  exit 1
else
  echo -e "${YELLOW}${BOLD}  ⚠ ${WARN} advertencia(s) — deploy posible pero revisa${NC}"
  echo -e "  ${PASS} ok · ${FAIL} fallos · ${WARN} advertencias"
  echo -e "${BOLD}${BLUE}════════════════════════════════════════════${NC}"
  echo ""
  echo -e "  Ejecuta: ${BOLD}bash scripts/deploy.sh${NC}"
  echo ""
  exit 0
fi
