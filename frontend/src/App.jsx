import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackgroundOrbs from './components/BackgroundOrbs';
import HomePage from './pages/HomePage';
import ModelPage from './pages/ModelPage';
import ReportPage from './pages/ReportPage';
import ContactPage from './pages/ContactPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <BackgroundOrbs />
        <Navbar />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/model" element={<ModelPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;