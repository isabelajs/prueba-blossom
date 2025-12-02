import { Routes, Route } from 'react-router-dom'
import Layout from './Layouts/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />} />
      <Route path="/character/:id" element={<Layout />} />
    </Routes>
  )
}

export default App
