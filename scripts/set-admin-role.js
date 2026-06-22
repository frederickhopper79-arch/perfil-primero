#!/usr/bin/env node
/**
 * set-admin-role.js
 * Asigna role:"admin" en Firestore al usuario indicado por email.
 *
 * Uso:
 *   node scripts/set-admin-role.js <email>
 *   node scripts/set-admin-role.js fabiancarrillo@gmail.com
 *
 * Requiere: Firebase CLI autenticado (npx firebase login)
 * No requiere service account ni gcloud.
 */

const https = require("https");
const path  = require("path");
const os    = require("os");
const fs    = require("fs");

const PROJECT_ID     = "perfil-primero";
const TARGET_EMAIL   = process.argv[2];

if (!TARGET_EMAIL) {
  console.error("Uso: node scripts/set-admin-role.js <email>");
  process.exit(1);
}

// ── Leer token del Firebase CLI ──────────────────────────────────────────────
const configPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
if (!fs.existsSync(configPath)) {
  console.error("❌ No se encontró el archivo de configuración del Firebase CLI.");
  console.error("   Ejecuta: npx firebase login");
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const ACCESS_TOKEN = config?.tokens?.access_token;
if (!ACCESS_TOKEN) {
  console.error("❌ No hay access_token en el Firebase CLI. Ejecuta: npx firebase login");
  process.exit(1);
}

// ── Helpers REST ─────────────────────────────────────────────────────────────
function firestoreRequest(method, docPath, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : "";
    const options = {
      hostname: "firestore.googleapis.com",
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${docPath}`,
      method,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} }));
    });
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function authRequest(path_) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "identitytoolkit.googleapis.com",
      path: `/v1/projects/${PROJECT_ID}/${path_}`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ email: TARGET_EMAIL });
    options.headers["Content-Length"] = Buffer.byteLength(body);
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔍 Buscando usuario: ${TARGET_EMAIL}`);

  // Buscar UID via Firebase Auth export (Firebase Admin REST)
  const authRes = await authRequest("accounts:lookup");
  const users = authRes.body?.users || [];
  const user = users.find((u) => u.email === TARGET_EMAIL);

  if (!user) {
    console.error(`\n❌ No se encontró "${TARGET_EMAIL}" en Firebase Auth del proyecto ${PROJECT_ID}.`);
    console.error("   El usuario debe haber iniciado sesión en la app al menos una vez.");
    process.exit(1);
  }

  const uid = user.localId;
  console.log(`✓ UID encontrado: ${uid}`);

  // Leer rol actual
  const getRes = await firestoreRequest("GET", `users/${uid}`);
  const currentRole = getRes.body?.fields?.role?.stringValue ?? "(sin documento)";
  console.log(`· Rol actual    : ${currentRole}`);

  if (currentRole === "admin") {
    console.log("\n✅ El usuario ya tiene role:admin — sin cambios.\n");
    process.exit(0);
  }

  // Actualizar con merge (PATCH + updateMask)
  const fields = {
    role:        { stringValue: "admin" },
    email:       { stringValue: TARGET_EMAIL },
    displayName: { stringValue: user.displayName || TARGET_EMAIL },
    updatedAt:   { stringValue: new Date().toISOString() },
  };
  const mask = Object.keys(fields)
    .map((f) => `updateMask.fieldPaths=${f}`)
    .join("&");

  const patchRes = await firestoreRequest(
    "PATCH",
    `users/${uid}?${mask}`,
    { fields }
  );

  if (patchRes.status === 200) {
    console.log(`\n✅ role:"admin" asignado a ${TARGET_EMAIL}`);
    console.log(`   Documento: users/${uid}\n`);
  } else {
    console.error("\n❌ Error al actualizar:", JSON.stringify(patchRes.body, null, 2));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌ Error inesperado:", err.message);
  process.exit(1);
});
