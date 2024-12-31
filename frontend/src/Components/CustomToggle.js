import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Typography } from '@mui/material';

export default function CustomToggle(props) {
    const handleChange = (event, newAlignment) => {
        props.setVar(newAlignment);
    };

    const generateButton = (values, labels) => {
        let res=[]
        for (let i=0; i<values.length; i++) {
            res.push(
                <ToggleButton key={i} value={values[i]}><Typography fontSize={{xs: "0.5rem", sm:"0.875rem"}}>{labels[i]}</Typography></ToggleButton>
            )
        }
        return res
    }

    return (
        <ToggleButtonGroup
            color={props.color}
            value={props.var}
            exclusive={props.exclusive}
            onChange={handleChange}
        >
            {generateButton(props.values, props.labels)}
        </ToggleButtonGroup>
    );
}
