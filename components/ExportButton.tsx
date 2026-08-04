'use client';

import React from 'react';

export function ExportButton({ data, filename, label }: { data: any[], filename: string, label: string }) {
  const handleExport = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    // Get headers
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : row[header];
        // Escape quotes and wrap in quotes if it contains a comma
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExport}
      className="btn btn-ghost card" 
      style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--chrome-dark)' }}
    >
      <span style={{ fontWeight: 500 }}>{label}</span>
      <span style={{ color: 'var(--accent-signal)' }}>↓</span>
    </button>
  );
}
