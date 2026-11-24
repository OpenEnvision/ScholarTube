import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import resources from '../data/scholar_tube_resources.json'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App resources={resources} />
  </React.StrictMode>,
)
