import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import AppWrapper from './AppWrapper'
import { store, persistor } from '../lib/redux/store'
import '../styles/globals.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root container not found')

createRoot(container).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppWrapper />
      </PersistGate>
    </Provider>
  </React.StrictMode>
)
