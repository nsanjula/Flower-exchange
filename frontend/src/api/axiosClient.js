import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const postOrders = (orders) => {
  return axiosClient.post('/api/orders', orders)
}

export const postCSVFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axiosClient.post('/api/orders/csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getLatestReport = () => {
  return axiosClient.get('/api/reports/latest')
}

export default axiosClient
