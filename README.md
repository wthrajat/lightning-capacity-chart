# Lightning Capacity Chart

A TypeScript tool that fetches Lightning Network node capacity metrics from the [Amboss](https://amboss.space) GraphQL API and generates an interactive HTML chart.

## Features

- Fetches historical capacity data for configured Lightning nodes
- Generates a beautiful, responsive HTML chart using Chart.js
- Configurable via environment variables
- Auto-opens chart in default browser
- Auto-assigns colors from a vibrant palette

## Setup

```bash
pnpm install
cp .env.example .env
```

## Configuration

Edit `.env` to configure:

```env
# Node 1 Configuration
PUBKEY1=03a1f3afd646d77bdaf545cceaf079bab6057eae52c6319b63b5803d0989d6a72f
NAME1=Binance

# Node 2 Configuration
PUBKEY2=0294ac3e099def03c12a37e30fe5364b1223fd60069869142ef96580c8439c2e0a
NAME2=OKX

# Date Range (YYYY-MM-DD format)
FROM_DATE=2025-07-01
TO_DATE=2025-12-31
```

## Usage

```bash
npm run dev
```

This will:
1. Generate `capacity-chart.html` in the project root
2. Automatically open it in your default browser

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBKEY1` | First node pubkey | Binance pubkey |
| `NAME1` | First node display name | Binance |
| `PUBKEY2` | Second node pubkey | OKX pubkey |
| `NAME2` | Second node display name | OKX |
| `FROM_DATE` | Start date (YYYY-MM-DD) | 2025-07-01 |
| `TO_DATE` | End date (YYYY-MM-DD) | 2025-12-31 |

## Project Structure

```
src/
├── index.ts          # Main entry point
├── html-generator.ts # HTML generation & color palette
└── types.ts          # TypeScript interfaces
```

## Output

The generated HTML file includes:
- Interactive line chart with capacity over time
- Hover tooltips showing exact values in BTC
- Stats cards showing latest capacity for each node
- Dark mode design with gradient background

## Data Source

All data is fetched from [Amboss Space](https://amboss.space/graphql).

## License

MIT
