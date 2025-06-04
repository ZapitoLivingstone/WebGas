import { NextRequest, NextResponse } from "next/server";
import { Options, IntegrationApiKeys, IntegrationCommerceCodes, WebpayPlus } from "transbank-sdk";

// Cambia esto por tu dominio real en prod
const returnUrl = "http://localhost:3000/api/webpay/commit";

const options = new Options(
  IntegrationCommerceCodes.WEBPAY_PLUS, // Código de comercio de integración
  IntegrationApiKeys.WEBPAY,            // API Key de integración
  returnUrl                             // URL de confirmación
);

export async function POST(req: NextRequest) {
  const { amount, buyOrder, sessionId } = await req.json();

  try {
    const transaction = new WebpayPlus.Transaction(options);
    const response = await transaction.create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );
    // Devuelve la url y token al frontend
    return NextResponse.json({ url: response.url, token: response.token });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Error creando transacción", details: errorMessage }, { status: 500 });
  }
}
