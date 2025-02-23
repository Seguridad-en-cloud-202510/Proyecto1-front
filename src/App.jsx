import { Route, Routes } from 'react-router-dom'
import LandingPage from './LandingPage.jsx'
import NavBar from './NavBar.jsx'
import Login from './Login.jsx'
import BlogList from './BlogList.jsx'
import BlogDetail from './BlogDetail.jsx'
import NewBlog from './NewBlog.jsx'

function App() {

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

    </div>
  )
}

export default App
