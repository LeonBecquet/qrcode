import Image from "next/image";
import { CallWaiterButton } from "./call-waiter-button";
import { resolvePublicTable } from "@/lib/server/public-resolver";

export default async function PublicTableLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const { restaurant, table } = await resolvePublicTable(slug, token);

  const themePrimary = restaurant.theme?.primary;

  return (
    <div
      className="bg-background min-h-svh"
      style={
        themePrimary
          ? ({
              "--client-accent": themePrimary,
            } as React.CSSProperties)
          : undefined
      }
    >
      <header className="bg-background sticky top-0 z-20 border-b">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          {restaurant.logoUrl ? (
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full border">
              <Image
                src={restaurant.logoUrl}
                alt=""
                fill
                className="object-cover"
                sizes="40px"
                unoptimized
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold">{restaurant.name}</h1>
            <p className="text-muted-foreground text-xs">
              Table <span className="font-mono">{table.label}</span>
              {table.groupName ? ` · ${table.groupName}` : ""}
            </p>
          </div>
          <CallWaiterButton slug={slug} token={token} />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-32">{children}</main>
    </div>
  );
}
