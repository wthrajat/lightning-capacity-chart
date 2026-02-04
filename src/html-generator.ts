import { NodeData } from './types';

const CHART_COLORS = [
    '#F0B90B',
    '#00C853',
    '#2196F3',
    '#E91E63',
    '#9C27B0',
    '#FF5722',
    '#00BCD4',
    '#8BC34A',
    '#FF9800',
    '#607D8B',
];

export function getColor(index: number): string {
    return CHART_COLORS[index % CHART_COLORS.length];
}

function formatCapacity(sats: number): string {
    const btc = sats / 100_000_000;
    if (btc >= 1) {
        return `${btc.toFixed(2)} BTC`;
    }
    if (sats >= 1_000_000_000) {
        return `${(sats / 1_000_000_000).toFixed(2)}B sats`;
    }
    if (sats >= 1_000_000) {
        return `${(sats / 1_000_000).toFixed(2)}M sats`;
    }
    return `${sats.toLocaleString()} sats`;
}

export function generateHTML(nodesData: NodeData[], fromDate: Date, toDate: Date): string {
    const fromStr = fromDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });
    const toStr = toDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const datasets = nodesData.map((node) => ({
        label: node.name,
        data: node.data.map((d) => ({
            x: d.date,
            y: d.value,
        })),
        borderColor: node.color,
        backgroundColor: node.color + '20',
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2,
    }));

    const statCardStyles = nodesData
        .map((node, i) => `.stat-card.node-${i} .value { color: ${node.color}; }`)
        .join('\n    ');

    const color1 = nodesData[0]?.color || '#F0B90B';
    const color2 = nodesData[1]?.color || nodesData[0]?.color || '#00C853';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exchange Lightning Capacity - ${fromStr} to ${toStr}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
      min-height: 100vh;
      padding: 40px;
      color: white;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 40px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
      background: linear-gradient(90deg, ${color1}, ${color2});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
    }
    .chart-container {
      position: relative;
      height: 500px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      padding: 20px;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 60px;
      margin-top: 30px;
      flex-wrap: wrap;
    }
    .stat-card {
      text-align: center;
      padding: 20px 30px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .stat-card h3 {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .stat-card .value {
      font-size: 24px;
      font-weight: 600;
    }
    ${statCardStyles}
    .footer {
      text-align: center;
      margin-top: 30px;
      color: rgba(255, 255, 255, 0.4);
      font-size: 12px;
    }
    .amboss-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .amboss-logo span {
      font-size: 16px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.6);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Exchange Lightning Network Capacity</h1>
      <p>${fromStr} → ${toStr}</p>
    </div>
    
    <div class="chart-container">
      <canvas id="chart"></canvas>
    </div>
    
    <div class="stats">
      ${nodesData
            .map((node, i) => {
                const lastValue = node.data[node.data.length - 1]?.value || 0;
                return `
        <div class="stat-card node-${i}">
          <h3>${node.name}</h3>
          <div class="value">${formatCapacity(lastValue)}</div>
        </div>
      `;
            })
            .join('')}
    </div>
    
    <div class="footer">
      <div class="amboss-logo">
        <span>Powered by Amboss</span>
      </div>
      <p>Data source: amboss.space</p>
    </div>
  </div>

  <script>
    const datasets = ${JSON.stringify(datasets)};
    
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'rgba(255, 255, 255, 0.8)',
              font: { size: 14, weight: '500' },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            displayColors: true,
            callbacks: {
              title: function(items) {
                const date = new Date(items[0].raw.x);
                return date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                });
              },
              label: function(context) {
                const value = context.raw.y;
                const btc = (value / 100000000).toFixed(2);
                return context.dataset.label + ': ' + btc + ' BTC';
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'month',
              displayFormats: {
                month: 'MMM yyyy'
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              callback: function(value) {
                return (value / 1000000000).toFixed(0) + 'B';
              }
            },
            title: {
              display: true,
              text: 'Capacity (sats)',
              color: 'rgba(255, 255, 255, 0.6)'
            }
          }
        }
      }
    });
  </script>
</body>
</html>`;
}
