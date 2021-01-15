import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { Router } from "little-react-router"
import { routes } from './routes'

ReactDOM.render(
  <React.StrictMode>
    <Router routes={routes}>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)
