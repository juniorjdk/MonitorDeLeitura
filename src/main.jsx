import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import HomePage from './pages/HomePage'
import BooksApp from './features/books/BooksApp'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/biblia" element={<App />} />
        <Route path="/livros" element={<BooksApp />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
