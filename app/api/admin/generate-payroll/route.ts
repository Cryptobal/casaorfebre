import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BANK_CODES: Record<string, string> = {
  "Banco Santander": "037",
  "Banco de Chile": "001",
  "BancoEstado": "012",
  "Banco BCI": "016",
  "Banco Itau": "039",
  "Scotiabank": "014",
  "Banco Falabella": "051",
  "Banco Ripley": "053",
  "Banco Security": "049",
  "Banco BICE": "028",
  "Banco Consorcio": "055",
  "Banco Internacional": "009",
  "HSBC": "031",
};

const ACCOUNT_TYPE_CODES: Record<string, string> = {
  "Cuenta Corriente": "01",
  "Cuenta Vista/RUT": "02",
  "Cuenta de Ahorro": "03",
};

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const pendingItems = await prisma.orderItem.findMany({
    where: { payoutStatus: "PENDING" },
    include: {
      artisan: {
        select: {
          id: true, displayName: true,
          bankRut: true, bankHolderName: true, bankName: true,
          bankAccountType: true, bankAccountNumber: true,
        },
      },
      order: { select: { orderNumber: true } },
    },
  });

  if (pendingItems.length === 0) {
    return NextResponse.json({ error: "No hay pagos pendientes" }, { status: 404 });
  }

  // Group by artisan
  const grouped: Record<string, { artisan: typeof pendingItems[0]["artisan"]; totalAmount: number; orders: string[] }> = {};
  for (const item of pendingItems) {
    const key = item.artisanId;
    if (!grouped[key]) {
      grouped[key] = { artisan: item.artisan, totalAmount: 0, orders: [] };
    }
    grouped[key].totalAmount += item.artisanPayout;
    if (!grouped[key].orders.includes(item.order.orderNumber)) {
      grouped[key].orders.push(item.order.orderNumber);
    }
  }

  const header = "RUT Beneficiario;Nombre Beneficiario;Codigo Banco;Tipo Cuenta;Numero Cuenta;Monto;Glosa";

  const rows = Object.values(grouped).map((g) => {
    const a = g.artisan;
    if (!a.bankRut || !a.bankAccountNumber || !a.bankName) {
      return `SIN_DATOS;${a.displayName};ERROR;--;--;${g.totalAmount};ORFEBRE SIN DATOS BANCARIOS`;
    }
    const bankCode = BANK_CODES[a.bankName] || "000";
    const accountTypeCode = ACCOUNT_TYPE_CODES[a.bankAccountType ?? ""] || "01";
    const cleanRut = (a.bankRut || "").replace(/\./g, "");
    return `${cleanRut};${a.bankHolderName || a.displayName};${bankCode};${accountTypeCode};${a.bankAccountNumber};${g.totalAmount};Pago Casa Orfebre ${g.orders.join(" ")}`;
  });

  const csv = [header, ...rows].join("\n");
  const today = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nomina_pagos_casaorfebre_${today}.csv"`,
    },
  });
}
