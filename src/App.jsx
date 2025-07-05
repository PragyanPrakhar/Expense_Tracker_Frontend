import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import LandingPage from "./components/LandingPage"
import TransactionDetails from "./components/TransactionDetails"
import "./index.css"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/transaction/:id" element={<TransactionDetails />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App
