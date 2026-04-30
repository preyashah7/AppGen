import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
axios.defaults.baseURL = apiBaseUrl

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

console.log('Frontend Env Variables:')
console.log('  API Base URL:', apiBaseUrl)
console.log('  Google Client ID:', googleClientId ? '✓ SET' : '✗ NOT SET')
console.log('  Full Client ID:', googleClientId)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId} onScriptProps={{ async: true, defer: true }}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)