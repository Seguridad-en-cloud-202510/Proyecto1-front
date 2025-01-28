// import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from 'react'
import Hero from './Hero.jsx'

import { Route, Routes } from 'react-router-dom'
import LandingPage from './LandingPage.jsx'
import NavBar from './NavBar.jsx'
import Login from './Login.jsx'
import BlogList from './BlogList.jsx'
import BlogDetail from './BlogDetail.jsx'
import NewBlog from './NewBlog.jsx'

function App() {

    const isLoggued = false

    console.log("Estoy mostrando App")

  return (
    <div>
      <NavBar />

      <div className="Aplicacion">
        <Routes>
          <Route path="/" element={ <LandingPage /> } />
          <Route path="Login" element={ <Login /> } />
          <Route path="bloglist" element={ <BlogList /> } />
          <Route path="bloglist/:id" element={ <BlogDetail /> } />
          <Route path="new_blog" element={ <NewBlog /> } />
        </Routes>
      </div>

      {/* {isLoggued ? <LandingPage /> : <h1>Debes iniciar sesión para ver esta página</h1>} */}
    </div>
  )
}

export default App
