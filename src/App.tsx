import { Routes, Route } from 'react-router-dom'
import Layout from './Layouts/Layout'
import CharactersPage from './pages/CharactersPage'
import CharacterDetailPage from './pages/CharacterDetailPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CharactersPage />} />
        <Route path="/character/:id" element={<CharacterDetailPage />} />
      </Routes>
    </Layout>
  )
}

export default App
