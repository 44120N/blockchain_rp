import React from "react";
import { TextField } from "@mui/material";

export default function CustomInput(props) {
    const handleChange = (event) => {
        props.setVar(event.target.value);
    };
    return (
        <TextField 
            type={props.type}
            required={props.required}
            className="input"
            name={props.name}
            label={props.label}
            variant="standard"
            value={props.var} 
            onChange={handleChange} 
            multiline={props.multiline}
            maxRows={props.rows}
            helperText={props.helperText}
            fullWidth={props.fullWidth}
            color={props.color}
        />
    );
}
