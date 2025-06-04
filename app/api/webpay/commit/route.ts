// /app/api/webpay/commit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys } from "transbank-sdk";
import { createClient } from "@supabase/supabase-js";

const options = new Options(
  IntegrationCommerceCodes.WEBPAY_PLUS,
  IntegrationApiKeys.WEBPAY,
  "https://webpay3gint.transbank.cl"
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usa la clave con permisos de escritura
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token_ws = searchParams.get("token_ws");
  const origin = req.headers.get("origin") || "http://localhost:3000";

  if (!token_ws) {
    return NextResponse.redirect(`${origin}/webpay/thanks?status=fail&error=token_ws_faltante`);
  }

  try {
    const transaction = new WebpayPlus.Transaction(options);
    const response = await transaction.commit(token_ws);

    // Busca el pedido asociado usando buyOrder (deberías guardar buyOrder al crear el pedido)
    const { data: pedido, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("buy_order", response.buy_order)
      .single();

    if (!pedido) {
      // Si no se encuentra la orden, redirige a error
      return NextResponse.redirect(`${origin}/webpay/thanks?status=fail&error=orden_no_encontrada`);
    }

    // Actualiza el estado de la orden
    await supabase
      .from("pedidos")
      .update({ estado: "pagado" })
      .eq("id", pedido.id);

    // Obtén los productos del detalle_pedido
    const { data: detalles } = await supabase
      .from("detalle_pedido")
      .select("*")
      .eq("pedido_id", pedido.id);

    // Descuenta stock de productos propios
    if (detalles) {
      for (const item of detalles) {
        if (item.tipo_producto === "propio") {
          await supabase.rpc("descontar_stock", {
            producto_id: item.producto_id,
            cantidad: item.cantidad
          });
        }
      }
    }

    // Listo: redirige a la página de gracias
    const url = `${origin}/webpay/thanks?status=ok&buyOrder=${response.buy_order}&amount=${response.amount}`;
    return NextResponse.redirect(url);
  } catch (err: any) {
    return NextResponse.redirect(
      `${origin}/webpay/thanks?status=fail&error=${encodeURIComponent(err.message)}`
    );
  }
}
