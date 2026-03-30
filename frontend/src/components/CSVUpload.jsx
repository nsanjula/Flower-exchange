import { useState, useRef } from 'react'

export default function CSVUpload({ onPublish }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file)
      } else {
        alert('Please select a valid CSV file')
      }
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file)
      } else {
        alert('Please select a valid CSV file')
      }
    }
  }

  const handlePublish = () => {
    if (!selectedFile) {
      alert('Please select a CSV file first')
      return
    }
    onPublish(selectedFile)
  }

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="w-full max-w-md border-4 border-dashed border-accent rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 transition"
      >
        <div className="text-4xl mb-4">＋</div>
        <p className="text-lg font-semibold text-primary mb-2">
          Drag and drop your CSV file
        </p>
        <p className="text-gray-500">
          or click to browse
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Selected File Display */}
      {selectedFile && (
        <div className="bg-success bg-opacity-10 border border-success rounded-lg p-4 max-w-md">
          <p className="text-sm text-gray-600 mb-1">Selected file:</p>
          <p className="font-semibold text-success">{selectedFile.name}</p>
          <p className="text-sm text-gray-500 mt-1">
            {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )}

      {/* Publish Button */}
      <button
        onClick={handlePublish}
        className="bg-primary text-white font-bold py-3 px-12 rounded-lg hover:bg-opacity-90 transition text-lg"
      >
        Publish
      </button>
    </div>
  )
}
