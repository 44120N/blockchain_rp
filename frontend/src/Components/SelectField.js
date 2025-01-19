import React from "react";
import { useState, useEffect } from "react";
import { FormControl, MenuItem, Select, OutlinedInput, InputLabel } from "@mui/material";

export default function SelectField(props){
    const [open, setOpen] = useState(false);

    function handleOpen() {
        setOpen(true)
    }
    function handleClose() {
        setOpen(false)
    }
    function handleChange(event) {
        props.setVar(event.target.value)
    }

    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">{props.label}</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                defaultValue={""}
                label={props.label}
                onChange={handleChange}
                open={open}
                onOpen={handleOpen}
                onClose={handleClose}
                value={props.var}
            >
                {props.choices.map((v, i)=>{
                    return (
                        <MenuItem value={v[0]} key={i}>{v[1]}</MenuItem>
                    )
                })}
            </Select>
        </FormControl>
    )
}