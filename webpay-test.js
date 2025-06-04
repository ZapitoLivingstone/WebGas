const { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys } = require("transbank-sdk");

async function testWebpay() {
  const buyOrder = "ORD123456";
  const sessionId = "SESSION789";
  const amount = 1000;
  const returnUrl = "http://localhost:3000/retorno";

  // Crear opciones manualmente (nuevo estilo)
  const options = new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS, // código de comercio de test
    IntegrationApiKeys.WEBPAY,            // api key de test
    "https://webpay3gint.transbank.cl"    // URL del ambiente de integración
  );

  try {
    const response = await new WebpayPlus.Transaction(options).create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );

    console.log("✅ Conexión exitosa con Transbank");
    console.log("➡️ URL Webpay:", response.url);
    console.log("🪪 Token:", response.token);
    console.log("\n📎 Pega este link en el navegador para simular el pago:");
    console.log(`${response.url}?token_ws=${response.token}`);
  } catch (err) {
    console.error("❌ Error al crear transacción:", err.message);
  }
}

testWebpay();
