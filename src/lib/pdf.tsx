import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Table } from "@/lib/db/schema";

type QrCard = {
  table: Pick<Table, "id" | "label" | "groupName">;
  qrDataUrl: string;
  url: string;
};

type Props = {
  restaurantName: string;
  cards: QrCard[];
};

const COLORS = {
  bg: "#FAF7F2",
  ink: "#1A1A18",
  muted: "#7C766F",
  border: "#E0D8CC",
  accent: "#D4633D",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: COLORS.bg,
  },
  header: {
    fontSize: 9,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  card: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    border: `1pt solid ${COLORS.border}`,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 230,
  },
  brand: {
    fontSize: 8,
    color: COLORS.muted,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.ink,
    marginBottom: 4,
  },
  groupName: {
    fontSize: 9,
    color: COLORS.muted,
    marginBottom: 12,
  },
  qrImage: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },
  accentBar: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginBottom: 10,
  },
  scanText: {
    fontSize: 9,
    color: COLORS.ink,
    marginTop: 4,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 12,
    left: 28,
    right: 28,
    fontSize: 8,
    color: COLORS.muted,
    textAlign: "center",
  },
});

function QrPdfDocument({ restaurantName, cards }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>
          {restaurantName} — QR codes à plastifier et coller sur les tables
        </Text>
        <View style={styles.grid}>
          {cards.map((card) => (
            <View key={card.table.id} style={styles.card}>
              <Text style={styles.brand}>{restaurantName}</Text>
              <Text style={styles.label}>{card.table.label}</Text>
              {card.table.groupName ? (
                <Text style={styles.groupName}>{card.table.groupName}</Text>
              ) : null}
              <View style={styles.accentBar} />
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={card.qrDataUrl} style={styles.qrImage} />
              <Text style={styles.scanText}>Scannez pour commander</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footer}>Propulsé par QR Restaurant</Text>
      </Page>
    </Document>
  );
}

export async function buildQrPdf(props: Props): Promise<Buffer> {
  return renderToBuffer(<QrPdfDocument {...props} />);
}
