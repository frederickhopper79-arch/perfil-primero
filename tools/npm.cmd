@echo off
if "%1"=="root" (
  echo %CD%\node_modules
  exit /b 0
)
if "%1"=="list" (
  "C:\Users\fabia\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" "C:\Users\fabia\OneDrive\Documentos\Pagina de Empleos\tools\npm-list-shim.cjs" %2
  exit /b 0
)
"C:\Users\fabia\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" "C:\Users\fabia\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\pnpm\bin\pnpm.cjs" %*
