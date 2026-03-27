import { useState, useEffect } from 'react'
import OrderTable from '../components/OrderTable'
import CSVUpload from '../components/CSVUpload'
import ExecutionReportTable from '../components/ExecutionReportTable'
import { postOrders, postCSVFile, getLatestReport } from '../api/axiosClient'

export default function Order() {
  const [activeTab, setActiveTab] = useState('fill') // 'fill' or 'csv'
  const [isLoading, setIsLoading] = useState(false)
  const [reports, setReports] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleFillOrderPublish = async (orders) => {
    setIsLoading(true)
    setError(null)
    setShowSuccess(true)

    try {
      // Post orders
      await postOrders(orders)

      // Wait 2 seconds before fetching report
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Fetch the latest report
      const response = await getLatestReport()
      setReports(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish orders. Please try again.')
      setShowSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCSVPublish = async (file) => {
    setIsLoading(true)
    setError(null)
    setShowSuccess(true)

    try {
      // Post CSV file
      await postCSVFile(file)

      // Wait 2 seconds before fetching report
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Fetch the latest report
      const response = await getLatestReport()
      setReports(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload CSV. Please try again.')
      setShowSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewOrder = () => {
    setShowSuccess(false)
    setReports(null)
    setError(null)
    setActiveTab('fill')
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-light">
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">❌</span>
              <h2 className="text-2xl font-bold text-danger">Error</h2>
            </div>
            <p className="text-text-dark mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showSuccess && reports) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-light">
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="bg-card p-8 rounded-lg shadow-lg max-w-6xl w-full mx-4">
            <div className="flex items-center gap-3 mb-8 text-center justify-center">
              <span className="text-3xl">✓</span>
              <h2 className="text-2xl font-bold text-success">Order Published Successfully</h2>
            </div>

            <h3 className="text-xl font-bold text-primary mb-6">Execution Report</h3>
            <ExecutionReportTable reports={reports} onNewOrder={handleNewOrder} />
          </div>
        </div>
      </div>
    )
  }

  if (showSuccess && isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-light">
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <span className="text-3xl">✓</span>
              <h2 className="text-2xl font-bold text-success">Order Published Successfully</h2>
            </div>

            {/* Loading Spinner */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-accent rounded-full animate-spin"></div>
              <p className="text-lg text-text-dark">Execution Report is Generating...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="bg-card p-8 rounded-lg shadow-lg max-w-4xl w-full mx-4">
          {/* Tab Buttons */}
          <div className="flex gap-4 mb-8 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('fill')}
              className={`px-6 py-3 font-semibold border-b-4 transition ${
                activeTab === 'fill'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Fill an Order
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`px-6 py-3 font-semibold border-b-4 transition ${
                activeTab === 'csv'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload CSV
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'fill' && (
            <OrderTable onPublish={handleFillOrderPublish} />
          )}

          {activeTab === 'csv' && (
            <CSVUpload onPublish={handleCSVPublish} />
          )}
        </div>
      </div>
    </div>
  )
}
