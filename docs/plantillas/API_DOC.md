<!--
  Plantilla Oficial API — HTES-TPL v1.1
  Basada en HTES Anexo E (antes 59.13). Un bloque por endpoint.
-->

## `[MÉTODO] /ruta/del/endpoint`

**Autenticación:** [Ninguna / Bearer token / API Key / OAuth2]

### Parámetros

| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
|---|---|---|---|---|
| | query / path / body | | Sí/No | |

### Respuesta Exitosa

```json
{
  "ejemplo": "de respuesta 200"
}
```

### Errores Posibles

| Código | Significado | Cuándo ocurre |
|---|---|---|
| 400 | | |
| 401 | | |
| 404 | | |
| 500 | | |

### Ejemplo de Uso

```bash
curl -X [MÉTODO] https://api.ejemplo.com/ruta \
  -H "Authorization: Bearer [token]"
```
