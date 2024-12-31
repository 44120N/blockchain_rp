import React, {useState} from "react";
import { Checkbox, FormControlLabel } from "@mui/material";

export default function CustomCheck(props) {
    const handleChange = (event) => {
        props.setVar(event.target.checked);
    };
    return (
        <FormControlLabel 
            label={props.label}
            control={
                <Checkbox
                    required={props.required}
                    checked={props.var}
                    onChange={handleChange}
                />
            }
        />
    );
}