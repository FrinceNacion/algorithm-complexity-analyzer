import { formatBytes } from './components/analysisResults.js';

export function exportCSV(data, filenamePrefix = 'aca-results') {
    if (!data || data.length === 0) {
        alert("No data available to export.");
        return;
    }

    const headers = ['Algorithm', 'Input Size', 'Time (ms)', 'Memory Usage (bytes)', 'Date'];
    const rows = data.map(r => [
        r.algorithmName,
        r.inputSize,
        Number(r.executionTime).toFixed(4),
        formatBytes(r.memoryUsage),
        new Date(r.timestamp).toLocaleString()
    ]);

    // Ensure fields with commas are properly quoted, though our current dataset shouldn't have them
    const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;

    const csv = [headers.map(escapeCsv), ...rows.map(row => row.map(escapeCsv))].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenamePrefix}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export function exportPDF(data, filenamePrefix = 'aca-results') {
    if (!data || data.length === 0) {
        alert("No data available to export.");
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF generator library is not loaded.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); // Landscape might be better for 9 columns

    doc.setFontSize(18);
    doc.text('Algorithm Complexity Analysis Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const headers = [['Algorithm', 'Input Size', 'Time (ms)', 'Memory Usage (bytes)', 'Date']];
    const rows = data.map(r => [
        r.algorithmName,
        r.inputSize,
        Number(r.executionTime).toFixed(4),
        formatBytes(r.memoryUsage),
        new Date(r.timestamp).toLocaleString()
    ]);

    doc.autoTable({
        startY: 36,
        head: headers,
        body: rows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246] }, // Primary blue color #3b82f6
        alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`${filenamePrefix}-${Date.now()}.pdf`);
}
