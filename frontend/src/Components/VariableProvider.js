import React from "react";
import { useState } from "react";
import { VariableContext } from "./VariableContext";

export function VariableProvider({ children }) {
    const [isAccount, setIsAccount] = useState(false);
    const [isTransactionLine, setIsTransactionLine] = useState(false);
    function toggleIsAccount() {
        setIsAccount((prev) => !prev);
    }
    function toggleIsTransactionLine() {
        setIsTransactionLine((prev) => !prev);
    }
    return (
        <VariableContext.Provider
            value={{ isAccount, toggleIsAccount, isTransactionLine, toggleIsTransactionLine }}
        >
            {children}
        </VariableContext.Provider>
    );
}
