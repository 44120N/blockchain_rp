import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import InstagramIcon from '@mui/icons-material/Instagram';
import ColorPalette from "../Components/ColorPalette";
import Wave from 'react-wavify';

export default function Footer() {
    return (
        <ColorPalette>
            <Stack sx={{ width: '100%', height: '10vh', bgcolor: '#fff', marginBottom: "-1vh" }}>
                <Wave
                    fill={'#0074D9'}
                    paused={false}
                    options={{
                        amplitude: 20,
                        speed: 0.32,
                        points: 4
                    }}
                    style={{ width: '100%', height: '100%' }}
                />
            </Stack>
            <Stack width={'100%'} className="form" bgcolor={"primary.main"} borderRadius={0}>
                <Stack direction={"column"} gap={1}>
                    <Stack className="col">
                        <Typography id={'social'} variant="h4" color={"secondary"} textAlign={"center"}>OUR SOCIAL MEDIA</Typography>
                    </Stack>
                    <Stack className="col" direction={"row"} justifyContent={"center"} alignItems={"center"}>
                        <Button 
                            sx={{
                                borderRadius: '50%', 
                                height: '7vh',
                                minWidth: 0,
                                aspectRatio: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }} 
                            variant="contained" color={"secondary"}
                        >
                            <a to={"https://www.instagram.com/canisiuscanvas"} target="_blank" style={{ color: 'white' }}>
                                <InstagramIcon/>
                            </a>
                        </Button>
                    </Stack>
                    <Stack className="col">
                        <Typography variant="body2" textAlign={"center"} color={"secondary"}>
                            Copyright © 2024, Canisius College. All rights reserved.
                        </Typography>
                    </Stack>
                </Stack>
            </Stack>
        </ColorPalette>
    );
}