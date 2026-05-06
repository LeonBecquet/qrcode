import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { tables } from "@/lib/db/schema";
import { buildQrPdf } from "@/lib/pdf";
import { buildTableUrl, generateQRDataURL } from "@/lib/qr";
import { requireRestaurant } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ctx = await requireRestaurant();
  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get("tableId");

  const rows = await db
    .select()
    .from(tables)
    .where(
      tableId
        ? and(eq(tables.restaurantId, ctx.restaurant.id), eq(tables.id, tableId))
        : eq(tables.restaurantId, ctx.restaurant.id),
    )
    .orderBy(asc(tables.sortOrder), asc(tables.createdAt));

  if (rows.length === 0) {
    return NextResponse.json({ error: "Aucune table." }, { status: 404 });
  }

  const cards = await Promise.all(
    rows.map(async (table) => {
      const url = buildTableUrl(ctx.restaurant.slug, table.token);
      return {
        table: { id: table.id, label: table.label, groupName: table.groupName },
        qrDataUrl: await generateQRDataURL(url),
        url,
      };
    }),
  );

  const pdf = await buildQrPdf({
    restaurantName: ctx.restaurant.name,
    cards,
  });

  const filename = tableId
    ? `qr-${rows[0]!.label.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
    : `qr-codes-${ctx.restaurant.slug}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
