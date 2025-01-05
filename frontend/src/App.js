import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import Footer from "./Components/Footer";
import Login from "./Pages/Login";
import SignUp from "./Pages/Signup";
import GeneralJournal from "./Pages/GeneralJournal";
import Account from "./Pages/Account";
import Transaction from "./Pages/Transaction";
import { AddJournal, UpdateJournal } from "./Pages/ChangeJournal";
import SpecificJournal from "./Pages/SpecificJournal";

import { VariableProvider } from "./Components/VariableProvider";

export default function App() {
    return (
        <VariableProvider>
            <Router>
                <Routes>
                    <Route exact path="/" Component={Home} />
                    <Route path="/login" Component={Login} />
                    <Route path="/signup" Component={SignUp} />
                    <Route path="/journal" Component={GeneralJournal} />
                    <Route path="/journal/:address" Component={SpecificJournal} />
                    <Route path="/journal/create" Component={AddJournal} />
                    <Route path="/journal/:address/update" Component={UpdateJournal} />

                    <Route path="/account" Component={Account} />
                    <Route path="/transaction" Component={Transaction} />
                    <Route path="/transaction/:address" Component={Transaction} />
                </Routes>
            </Router>
        </VariableProvider>
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
