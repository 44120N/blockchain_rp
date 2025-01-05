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
import SpecificTransaction from "./Pages/SpecificTransaction";
import { AddTransaction } from "./Pages/ChangeTransaction";


export default function App() {
    return (
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
                {/* See all transactions */}
                <Route path="/transaction" Component={Transaction} />
                {/* See transaction in detail */}
                <Route path="/transaction/:address" Component={SpecificTransaction} />
                {/* Create transaction using journal id as :address */}
                <Route path="/transaction/:address/create" Component={AddTransaction} />
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
