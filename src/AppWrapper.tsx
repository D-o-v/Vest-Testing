import { ThemeProvider } from '@components/theme-provider'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import App from './App'
import { store, persistor } from '../lib/redux/store'

export default function AppWrapper() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <ThemeProvider defaultTheme="system">
            <App />
          </ThemeProvider>
        </Router>
      </PersistGate>
    </Provider>
  )
}