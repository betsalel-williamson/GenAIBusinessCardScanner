import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ValidatePage from "./pages/ValidatePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* record_index is now optional for initial load, will be added by ValidatePage */}
      <Route path="/validate/:json_filename/:record_index?" element={<ValidatePage />} />
    </Routes>
  );
}

export default App;
