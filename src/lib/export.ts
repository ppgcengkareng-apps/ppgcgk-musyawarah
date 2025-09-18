import * as XLSX from 'xlsx'

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export const exportToPDF = async (data: any[], filename: string, title: string) => {
  try {
    // Validasi data
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diekspor')
      return
    }

    // Flatten nested objects untuk display yang lebih baik
    const flattenedData = data.map(item => {
      const flattened: any = {}
      Object.keys(item).forEach(key => {
        if (typeof item[key] === 'object' && item[key] !== null) {
          // Handle nested objects (seperti peserta, sesi)
          if (item[key].nama) flattened[`${key}_nama`] = item[key].nama
          else if (item[key].nama_sesi) flattened[`${key}_nama`] = item[key].nama_sesi
          else if (item[key].username) flattened[`${key}_username`] = item[key].username
          else flattened[key] = JSON.stringify(item[key])
        } else {
          flattened[key] = item[key]
        }
      })
      return flattened
    })

    // Buat HTML untuk PDF
    const headers = Object.keys(flattenedData[0] || {})
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
          th { background-color: #f2f2f2; font-weight: bold; font-size: 11px; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .no-data { text-align: center; padding: 20px; color: #666; }
          @media print { 
            body { margin: 0; } 
            @page { size: A4 landscape; margin: 1cm; }
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
          <p>Total Data: ${flattenedData.length} record</p>
        </div>
        ${headers.length > 0 ? `
        <table>
          <thead>
            <tr>
              ${headers.map(key => `<th>${key.replace(/_/g, ' ').toUpperCase()}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${flattenedData.map(row => `
              <tr>
                ${headers.map(key => `<td>${formatCellValue(row[key])}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<div class="no-data">Tidak ada data untuk ditampilkan</div>'}
      </body>
      </html>
    `

    // Coba buka window baru
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    
    if (!printWindow) {
      // Fallback jika popup diblokir
      alert('Popup diblokir oleh browser. Silakan izinkan popup untuk mengunduh PDF.')
      return
    }

    printWindow.document.write(html)
    printWindow.document.close()
    
    // Tunggu sampai konten dimuat
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        
        // Tutup window setelah print dialog ditutup
        setTimeout(() => {
          printWindow.close()
        }, 1000)
      }, 500)
    }

  } catch (error) {
    console.error('Error exporting PDF:', error)
    alert('Gagal mengekspor PDF. Silakan coba lagi.')
  }
}

// Helper function untuk format nilai cell
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak'
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
    // Format tanggal ISO
    try {
      return new Date(value).toLocaleDateString('id-ID')
    } catch {
      return value
    }
  }
  return String(value)
}