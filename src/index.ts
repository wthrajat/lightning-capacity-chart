import { writeFileSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { config } from 'dotenv';
import { GraphQLResponse, NodeData } from './types';
import { generateHTML, getColor } from './html-generator';

config();

const PUBKEY1 = process.env.PUBKEY1 || '03a1f3afd646d77bdaf545cceaf079bab6057eae52c6319b63b5803d0989d6a72f';
const NAME1 = process.env.NAME1 || 'Binance';

const PUBKEY2 = process.env.PUBKEY2 || '0294ac3e099def03c12a37e30fe5364b1223fd60069869142ef96580c8439c2e0a';
const NAME2 = process.env.NAME2 || 'OKX';

const FROM_DATE = new Date(`${process.env.FROM_DATE || '2025-07-01'}T00:00:00.000Z`);
const TO_DATE = new Date(`${process.env.TO_DATE || '2025-12-31'}T23:59:59.999Z`);

const API_URL = 'https://amboss.space/graphql';

const NODES = [
    { name: NAME1, pubkey: PUBKEY1, color: getColor(0) },
    { name: NAME2, pubkey: PUBKEY2, color: getColor(1) },
];

async function fetchNodeMetrics(
    pubkey: string,
    fromDate: Date
): Promise<string[][]> {
    const query = `
    query GetNodeMetrics($pubkey: String!, $from: String!, $metric: NodeMetricsKeys!, $submetric: ChannelMetricsKeys) {
      getNodeMetrics(pubkey: $pubkey) {
        historical_series(from: $from, submetric: $submetric, metric: $metric)
        __typename
      }
    }
  `;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apollographql-client-name': 'space-prod',
            'apollographql-client-version': '1.0.0',
            'amboss-client': 'amboss-space',
        },
        body: JSON.stringify({
            operationName: 'GetNodeMetrics',
            variables: {
                metric: 'capacity',
                from: fromDate.toISOString(),
                pubkey: pubkey,
            },
            query,
        }),
    });

    const result = (await response.json()) as GraphQLResponse;
    return result.data?.getNodeMetrics?.historical_series || [];
}

function filterByDateRange(
    data: string[][],
    from: Date,
    to: Date
): Array<{ date: string; value: number }> {
    return data
        .map(([dateStr, valueStr]) => ({
            date: dateStr,
            value: parseFloat(valueStr),
            dateObj: new Date(dateStr),
        }))
        .filter((item) => item.dateObj >= from && item.dateObj <= to)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
        .map(({ date, value }) => ({ date, value }));
}

function openInBrowser(filePath: string): void {
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
        command = `open "${filePath}"`;
    } else if (platform === 'win32') {
        command = `start "" "${filePath}"`;
    } else {
        command = `xdg-open "${filePath}"`;
    }

    exec(command, (error) => {
        if (error) {
            console.log('Could not open browser automatically. Please open the file manually.');
        }
    });
}

async function main() {
    console.log('Configuration:');
    console.log(`  Node 1: ${NAME1} (${PUBKEY1.slice(0, 8)}...)`);
    console.log(`  Node 2: ${NAME2} (${PUBKEY2.slice(0, 8)}...)`);
    console.log(`  Date range: ${FROM_DATE.toISOString().split('T')[0]} to ${TO_DATE.toISOString().split('T')[0]}\n`);

    const nodesData: NodeData[] = [];

    for (const node of NODES) {
        console.log(`Fetching data for ${node.name}...`);
        const rawData = await fetchNodeMetrics(node.pubkey, FROM_DATE);
        const filteredData = filterByDateRange(rawData, FROM_DATE, TO_DATE);

        nodesData.push({
            name: node.name,
            color: node.color,
            data: filteredData,
        });
        console.log(`  Found ${filteredData.length} data points`);
    }

    const html = generateHTML(nodesData, FROM_DATE, TO_DATE);
    const outputPath = join(process.cwd(), 'capacity-chart.html');
    writeFileSync(outputPath, html);

    console.log(`\nChart saved to: ${outputPath}`);
    console.log('Opening in browser...');

    openInBrowser(outputPath);
}

main();
