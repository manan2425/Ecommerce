// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store/store'
import { Toaster } from './components/ui/toaster'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Provider store={store}>
      {/* API client is configured in src/lib/api.js; keep main free of side-effects */}
      <App />
      <Toaster />
    </Provider>
  </BrowserRouter>
  // </StrictMode>,
)
