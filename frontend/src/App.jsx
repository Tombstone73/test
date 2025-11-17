import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import Folders from './pages/Folders';
import ManualPreflight from './pages/ManualPreflight';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/folders" element={<Folders />} />
          <Route path="/manual" element={<ManualPreflight />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
