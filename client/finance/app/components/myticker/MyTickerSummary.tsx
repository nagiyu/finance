import React from 'react';
import { MyTickerSummaryDataType } from '@/interfaces/data/MyTickerSummaryDataType';

interface MyTickerSummaryProps {
  summary: MyTickerSummaryDataType[];
}

export default function MyTickerSummary({ summary }: MyTickerSummaryProps) {
  if (summary.length === 0) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Current Holdings Summary</h3>
        <p style={{ margin: 0, color: '#666' }}>No current holdings found.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '24px' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>Current Holdings Summary</h3>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '4px' }}>
          <thead>
            <tr style={{ backgroundColor: '#e3f2fd' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Exchange</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Ticker</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total Cost</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Avg Price</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, index) => (
              <tr key={`${item.exchangeId}-${item.tickerId}`} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.exchangeName}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.tickerName}</td>
                <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                  {item.currentQuantity.toLocaleString()}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                  {item.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                  {item.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
        Total holdings: {summary.length} different stocks
      </div>
    </div>
  );
}