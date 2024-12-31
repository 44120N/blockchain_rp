import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import Footer from "./Components/Footer";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/" Component={Home} />
            </Routes>
        </Router>
    );
}

const rootElement = document.getElementById("app");
const root = createRoot(rootElement);

root.render(
    <StrictMode>
        <div className="flex-layout">
            <Navbar />
            <App />
        </div>
        <Footer />
    </StrictMode>
);
