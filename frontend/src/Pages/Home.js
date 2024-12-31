import React from "react";
import { Container, Typography } from "@mui/material";
import ColorPalette from "../Components/ColorPalette";

export default function Home() {
    return (
        <ColorPalette>
            <Container fixed sx={{marginTop: '3%'}}>
                <Typography variant="h1" color="primary">Hello, World!</Typography>
                <Typography variant="h2" color="navy">Lorem Ipsum</Typography>
            </Container>
        </ColorPalette>
    );
};