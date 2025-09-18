import * as XLSX from 'xlsx'

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diekspor')
    return
  }

  try {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, `${filename}.xlsx`)
  } catch (error) {
    console.error('Export Excel error:', error)
    alert('Gagal mengekspor ke Excel')
  }
}

export const exportToPDF = async (data: any[], filename: string, title: string) => {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diekspor')
    return
  }

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Popup diblokir. Izinkan popup untuk download PDF')
    return
  }

  const headers = Object.keys(data[0] || {})
  if (headers.length === 0) {
    alert('Data tidak valid untuk diekspor')
    printWindow.close()
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
        h1 { color: #333; text-align: center; margin-bottom: 10px; }
        .info { text-align: center; margin-bottom: 20px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; word-wrap: break-word; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .no-data { text-align: center; padding: 20px; color: #666; }
        @media print { 
          body { margin: 0; font-size: 10px; } 
          th, td { padding: 4px; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="info">
        <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p>Total Data: ${data.length} record</p>
      </div>
      ${data.length > 0 ? `
        <table>
          <thead>
            <tr>
              ${headers.map(key => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(key => `<td>${row[key] || '-'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<div class="no-data">Tidak ada data untuk ditampilkan</div>'}
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  
  setTimeout(() => {
    printWindow.print()
    setTimeout(() => printWindow.close(), 1000)
  }, 500)
}