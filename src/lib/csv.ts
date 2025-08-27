export function exportToCsv<T extends Record<string, any>>(filename: string, data: T[]): void {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), 
    ...data.map(row => 
      headers.map(fieldName => 
        JSON.stringify(row[fieldName], (_, value) => value === null ? '' : value)
      ).join(',')
    )
  ];

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
