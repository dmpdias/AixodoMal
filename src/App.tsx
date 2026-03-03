import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { Backoffice } from './components/Backoffice';
import { ArticlePage } from './components/ArticlePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/backoffice/*" element={<Backoffice />} />
      <Route path="/article/:id" element={<ArticlePage />} />
    </Routes>
  );
}
