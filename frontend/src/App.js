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
import { AddTransaction, UpdateTransaction } from "./Pages/ChangeTransaction";
import { AddTransactionLine, UpdateTransactionLine } from "./Pages/ChangeTransactionLine";


export default function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/" Component={Home} />
                <Route path="/login" Component={Login} />
                <Route path="/signup" Component={SignUp} />
                <Route path="/journal" Component={GeneralJournal} />
                <Route path="/journal/:journal_id" Component={SpecificJournal} />
                <Route path="/journal/create" Component={AddJournal} />
                <Route path="/journal/:journal_id/update" Component={UpdateJournal} />

                <Route path="/account" Component={Account} />
                <Route path="/transaction/:journal_id" Component={Transaction} />
                <Route path="/transaction/:journal_id/create" Component={AddTransaction} />
                <Route path="/transaction/:journal_id/update" Component={UpdateTransaction} />
                <Route path="/transaction-line/:transaction_id/create" Component={AddTransactionLine} />
                <Route path="/transaction-line/:transaction_id/update" Component={UpdateTransactionLine} />

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
