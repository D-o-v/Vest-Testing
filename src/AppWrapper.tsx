import { ThemeProvider } from '@components/theme-provider'
import App from './App'

export default function AppWrapper() {
  return (
    <ThemeProvider defaultTheme="system">
      <App />
    </ThemeProvider>
  )
}