import React from "react";
import { TextField, InputAdornment, OutlinedInput } from "@mui/material";

const addThousandSeparator = (value) => {
    const parts = value.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
};

export default function CustomInputNumber(props) {
    const handleChange = (event) => {
        let input_val = event.target.value;
        if (props.decimal) {
            input_val = input_val.replace(/[^\d.,]/g, '');
            input_val = input_val.replace(/[,]/g, '');
            input_val = input_val.replace(/\.(?=.*\.)/g, '');
            input_val = addThousandSeparator(input_val);
            props.setVar(input_val);
        } else {
            input_val = input_val.replace(/[^\d]/g, '');
            input_val = addThousandSeparator(input_val);
            props.setVar(input_val);
        }
    };
    return (
        props.prefix ?
        (<TextField 
            required={props.required}
            type={props.type}
            className="input"
            name={props.name}
            label={props.label}
            variant="standard"
            value={props.var} 
            onChange={handleChange} 
            multiline={props.multiline}
            maxRows={props.rows}
            helperText={props.helperText}
            color={props.color}
            InputProps={{
                startAdornment: (<InputAdornment position="start">{props.prefix}</InputAdornment>),
                endAdornment: (<InputAdornment position="end">{props.unit}</InputAdornment>)
            }}
            fullWidth={props.fullWidth}
        />) :
        (<TextField 
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
            color={props.color}
            slotProps={{
                input: {
                    endAdornment: (<InputAdornment position="end">{props.unit}</InputAdornment>)
                }
            }}
            fullWidth={props.fullWidth}
        />)
    );
}
