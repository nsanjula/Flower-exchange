import { useEffect, useState } from 'react'

const STATUS_COLORS = {
  'New': 'text-gray-500',
  'Fill': 'text-success',
  'PFill': 'text-warning',
  'Rejected': 'text-danger',
}

const STATUS_BG_COLORS = {
  'New': 'bg-gray-100',
  'Fill': 'bg-success bg-opacity-10',
  'PFill': 'bg-warning bg-opacity-10',
  'Rejected': 'bg-danger bg-opacity-10',
}

export default function ExecutionReportTable({ reports, onNewOrder }) {
  const handleDownloadCSV = () => {
    if (!reports || reports.length === 0) return

    // Prepare CSV content
    const headers = ['Order ID', 'Cl. Order ID', 'Instrument', 'Side', 'Exec Status', 'Quantity', 'Price', 'Transaction Time']
    const rows = reports.map(report => [
      report.orderId || '',
      report.clientOrderId || '',
      report.instrument || '',
      report.side || '',
      report.execStatus || '',
      report.quantity || '',
      report.price || '',
      report.transactionTime || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'execution_report.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-primary">
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                Cl. Order ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                Instrument
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                Side
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                Exec Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                Price
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                Transaction Time
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{report.orderId || '-'}</td>
                <td className="px-4 py-3 text-sm">{report.clientOrderId || '-'}</td>
                <td className="px-4 py-3 text-sm">{report.instrument || '-'}</td>
                <td className="px-4 py-3 text-sm">{report.side || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${STATUS_COLORS[report.execStatus] || 'text-gray-500'} ${STATUS_BG_COLORS[report.execStatus] || 'bg-gray-100'}`}>
                    {report.execStatus || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{report.quantity || '-'}</td>
                <td className="px-4 py-3 text-sm">{report.price || '-'}</td>
                <td className="px-4 py-3 text-sm">{report.transactionTime || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleDownloadCSV}
          className="bg-accent text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition"
        >
          Download CSV
        </button>
        <button
          onClick={onNewOrder}
          className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition"
        >
          New Order
        </button>
      </div>
    </div>
  )
}
