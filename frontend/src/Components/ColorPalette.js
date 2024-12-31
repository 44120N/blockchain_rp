import React from "react";
import { createTheme, ThemeProvider } from "@mui/material"; 

export default function ColorPalette(props) {
    let dark_navy = '#001f3f';
    let navy_blue = '#003366';
    let blue = '#0074D9';
    let light_blue = '#7FDBFF';
    let white = '#F6F8FA';

    let theme = createTheme({});
    theme = createTheme(theme, {
        palette: {
            dark_navy: theme.palette.augmentColor({
                color: {
                    main: dark_navy,
                },
                name: 'dark_navy',
            }),
            navy: theme.palette.augmentColor({
                color: {
                    main: navy_blue,
                },
                name: 'navy',
            }),
            primary: theme.palette.augmentColor({
                color: {
                    main: blue,
                },
                name: 'primary',
            }),
            secondary: theme.palette.augmentColor({
                color: {
                    main: light_blue,
                    contrastText: white,
                },
                name: 'secondary',
            }),
            white: theme.palette.augmentColor({
                color: {
                    main: white,
                },
                name: 'white',
            }),
        },
    });
    return (
        <ThemeProvider theme={theme}>
            {props.children}
        </ThemeProvider>
    );
};
