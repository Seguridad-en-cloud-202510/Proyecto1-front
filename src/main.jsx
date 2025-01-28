import 'bootstrap/dist/css/bootstrap.min.css';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom'
import { BrowserRouter} from 'react-router-dom'

// import './index.css'
import LandingPage from './LandingPage.jsx'
import NavBar from './NavBar.jsx'
import App from './App.jsx'

const isLoggued = false

ReactDOM.render(
  <BrowserRouter>
    
    <App />
    
  </BrowserRouter>,
  document.getElementById('root')
)
