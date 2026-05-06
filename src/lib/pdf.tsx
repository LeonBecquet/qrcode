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

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 9,
    color: "#666666",
    textAlign: "center",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48.5%",
    border: "1pt solid #DDDDDD",
    borderRadius: 6,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 220,
  },
  brand: {
    fontSize: 8,
    color: "#999999",
    marginBottom: 4,
  },
  label: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  groupName: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 12,
  },
  qrImage: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },
  scanText: {
    fontSize: 9,
    color: "#000000",
    marginTop: 4,
  },
  url: {
    fontSize: 7,
    color: "#999999",
    marginTop: 2,
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
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={card.qrDataUrl} style={styles.qrImage} />
              <Text style={styles.scanText}>Scannez pour commander</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export async function buildQrPdf(props: Props): Promise<Buffer> {
  return renderToBuffer(<QrPdfDocument {...props} />);
}
