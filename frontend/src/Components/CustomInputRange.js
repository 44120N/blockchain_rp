import React from "react";
import {Stack, Typography, TextField} from "@mui/material"

const numberWithCommas = (numberString) => {
    console.log(numberString);
    return numberString.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function CustomRange (props) {
    const handleInputChange = (index) => (event) => {
        const newValue = [...props.var];
        const value_format = numberWithCommas(event.target.value);
        newValue[index] = value_format;
        props.setVar(newValue);
    };
    return (
        <Stack>
            <Typography>
                {props.title}
            </Typography>
            <Stack direction={"row"} className="col" spacing={2} width={"100%"}>
                <Stack className="col-half">
                    <TextField 
                        className="input"
                        name={props.name + '_min'}
                        label={"Min." + props.label}
                        variant="standard"
                        value={props.var[0]} 
                        onChange={handleInputChange(0)} 
                        fullWidth
                    ></TextField>
                </Stack>
                <Stack className="col-half">
                    <TextField 
                        className="input"
                        name={props.name + '_max'}
                        label={"Max." + props.label}
                        variant="standard"
                        value={props.var[1]} 
                        onChange={handleInputChange(1)} 
                        fullWidth
                    ></TextField>
                </Stack>
            </Stack>
        </Stack>
    )
}