import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ValidatePage from "./pages/ValidatePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* Each filename now represents a single record, so record_index is removed from route */}
      <Route path="/validate/:json_filename" element={<ValidatePage />} />
    </Routes>
  );
}

export default App;
