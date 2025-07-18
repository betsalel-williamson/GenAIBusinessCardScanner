import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ValidatePage from "./pages/ValidatePage";
import { StatusProvider } from "./context/StatusContext";

function App() {
  return (
    <StatusProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Each filename now represents a single record, so record_index is removed from route */}
        <Route path="/validate/:json_filename" element={<ValidatePage />} />
      </Routes>
    </StatusProvider>
  );
}

export default App;
