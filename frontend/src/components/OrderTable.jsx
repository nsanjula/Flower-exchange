import { useState } from 'react'

const INSTRUMENTS = ['Rose', 'Lavender', 'Lotus', 'Tulip', 'Orchid']
const SIDES = [
  { value: 1, label: '1 - Buy' },
  { value: 2, label: '2 - Sell' },
]

export default function OrderTable({ onPublish }) {
  const [rows, setRows] = useState([
    {
      id: 1,
      clientOrderId: '',
      instrument: '',
      side: '',
      quantity: '',
      price: '',
    }
  ])

  const handleAddRow = () => {
    const newId = Math.max(...rows.map(r => r.id), 0) + 1
    setRows([...rows, {
      id: newId,
      clientOrderId: '',
      instrument: '',
      side: '',
      quantity: '',
      price: '',
    }])
  }

  const handleDeleteRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id))
    }
  }

  const handleChange = (id, field, value) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        // Validation
        if (field === 'clientOrderId') {
          // Max 7 alphanumeric characters
          value = value.slice(0, 7).toUpperCase().replace(/[^A-Z0-9]/g, '')
        } else if (field === 'quantity') {
          // Must be multiple of 10, min 10 max 1000
          const num = parseInt(value) || ''
          if (num !== '' && (num < 10 || num > 1000 || num % 10 !== 0)) {
            return row
          }
          value = value === '' ? '' : parseInt(value)
        } else if (field === 'price') {
          // Must be > 0
          const num = parseFloat(value) || ''
          if (num !== '' && num <= 0) {
            return row
          }
          value = value === '' ? '' : parseFloat(value)
        } else if (field === 'side') {
          value = parseInt(value) || ''
        }
        return { ...row, [field]: value }
      }
      return row
    }))
  }

  const handlePublish = () => {
    // Validate all rows are filled
    const isValid = rows.every(row => 
      row.clientOrderId && row.instrument && row.side && row.quantity && row.price
    )

    if (!isValid) {
      alert('Please fill in all fields before publishing')
      return
    }

    // Convert to API format
    const orders = rows.map(row => ({
      clientOrderId: row.clientOrderId,
      instrument: row.instrument,
      side: parseInt(row.side),
      quantity: parseInt(row.quantity),
      price: parseFloat(row.price),
    }))

    onPublish(orders)
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-primary">
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
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                Price
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-primary">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    maxLength="7"
                    value={row.clientOrderId}
                    onChange={(e) => handleChange(row.id, 'clientOrderId', e.target.value)}
                    placeholder="e.g., ORD001"
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={row.instrument}
                    onChange={(e) => handleChange(row.id, 'instrument', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select...</option>
                    {INSTRUMENTS.map(inst => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={row.side}
                    onChange={(e) => handleChange(row.id, 'side', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select...</option>
                    {SIDES.map(side => (
                      <option key={side.value} value={side.value}>{side.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={row.quantity}
                    onChange={(e) => handleChange(row.id, 'quantity', e.target.value)}
                    placeholder="e.g., 100"
                    min="10"
                    max="1000"
                    step="10"
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={row.price}
                    onChange={(e) => handleChange(row.id, 'price', e.target.value)}
                    placeholder="e.g., 50.00"
                    step="0.01"
                    min="0"
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDeleteRow(row.id)}
                    disabled={rows.length === 1}
                    className="bg-danger text-white px-3 py-1 rounded hover:bg-opacity-90 transition disabled:opacity-50"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center gap-6 mt-6">
        <button
          onClick={handleAddRow}
          className="bg-accent text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition"
        >
          ＋ Add Row
        </button>

        <button
          onClick={handlePublish}
          className="bg-primary text-white font-bold py-3 px-12 rounded-lg hover:bg-opacity-90 transition text-lg"
        >
          Publish
        </button>
      </div>
    </div>
  )
}
