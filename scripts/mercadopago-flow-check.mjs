const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const appUrl = process.env.APP_URL ?? "https://perfil-primero.web.app";
const functionsBaseUrl = process.env.FUNCTIONS_BASE_URL ?? "https://us-central1-perfil-primero.cloudfunctions.net";
const approvedPaymentId = process.env.MP_APPROVED_PAYMENT_ID;

if (!accessToken) {
  console.error("Falta MERCADOPAGO_ACCESS_TOKEN. Ejecuta este script con el token productivo o sandbox correspondiente.");
  process.exit(1);
}

const externalReference = `flowcheck_${Date.now()}`;
const preferenceResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    items: [
      {
        title: "Perfil Primero - verificacion flujo productivo",
        quantity: 1,
        unit_price: 999,
        currency_id: "CLP"
      }
    ],
    back_urls: {
      success: `${appUrl}/postulante?checkout=success`,
      failure: `${appUrl}/postulante?checkout=failure`,
      pending: `${appUrl}/postulante?checkout=pending`
    },
    external_reference: externalReference,
    notification_url: `${functionsBaseUrl}/mercadoPagoWebhook`,
    metadata: {
      type: "flow_check",
      paymentId: externalReference
    }
  })
});

const preferenceText = await preferenceResponse.text();
if (!preferenceResponse.ok) {
  console.error(preferenceText);
  process.exit(1);
}

const preference = JSON.parse(preferenceText);
const checks = [
  ["preference_id", Boolean(preference.id)],
  ["checkout_url", Boolean(preference.init_point || preference.sandbox_init_point)],
  ["external_reference", preference.external_reference === externalReference],
  ["notification_url", preference.notification_url === `${functionsBaseUrl}/mercadoPagoWebhook`],
  ["success_redirect", preference.back_urls?.success === `${appUrl}/postulante?checkout=success`]
];

const result = {
  ok: checks.every(([, ok]) => ok),
  externalReference,
  preferenceId: preference.id,
  checkoutUrl: preference.init_point || preference.sandbox_init_point,
  checks: Object.fromEntries(checks)
};

if (approvedPaymentId) {
  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${approvedPaymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  const paymentText = await paymentResponse.text();
  result.approvedPaymentProbe = {
    ok: paymentResponse.ok,
    status: paymentResponse.ok ? JSON.parse(paymentText).status : "error",
    raw: paymentResponse.ok ? undefined : paymentText
  };
  result.ok = result.ok && paymentResponse.ok && result.approvedPaymentProbe.status === "approved";
}

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exit(1);
}
