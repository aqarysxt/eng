import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vocabulary from './pages/Vocabulary';
import Listening from './pages/Listening';
import Speaking from './pages/Speaking';
import Writing from './pages/Writing';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vocabulary" element={<Vocabulary />} />
          <Route path="listening" element={<Listening />} />
          <Route path="speaking" element={<Speaking />} />
          <Route path="writing" element={<Writing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
