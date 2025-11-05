import React from 'react'
import { createRoot } from 'react-dom/client'
import AppWrapper from './AppWrapper'
import '../styles/globals.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root container not found')

createRoot(container).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
)
