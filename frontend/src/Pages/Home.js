import React from "react";
import ColorPalette from "../Components/ColorPalette";
import { useState, useEffect } from "react";
import { getData } from "../DataEncrypt";
import { Link } from "react-router-dom";
import {
    Container,
    Typography,
    Divider,
    Stack,
    Button,
} from "@mui/material";

import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LinkIcon from '@mui/icons-material/Link';
import KeyIcon from '@mui/icons-material/Key';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

export default function Home() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [blockchain, setBlockchain] = useState('');

    useEffect(() => {
        const loginData = getData('login_data');
        if (loginData) {
            setUsername(loginData.username);
            setEmail(loginData.email);
            setPrivateKey(loginData.private_key);
            setPublicKey(loginData.public_key);
            setBlockchain(loginData.blockchain)
        }
    }, []);
    return (
        <ColorPalette>
            <Container fixed sx={{ marginY: "3%" }}>
                <Stack gap={5}>
                    <Stack>
                        <Typography variant="h2" color="primary">
                            Welcome, {username ? username : 'Anonymous'}!
                        </Typography>
                        <Typography variant="h3" color="navy">
                            Dashboard
                        </Typography>
                        <Divider
                            sx={{
                                borderWidth: ".3vh",
                                width: "100%",
                            }}
                        />
                    </Stack>
                    {username ? (
                        <Stack gap={1}>
                            <Stack sx={{ alignContent: "center", p: 2, my: 1, bgcolor: "aliceblue", borderRadius: "8px" }}>
                                <Typography fontSize={20}>
                                    <Stack direction={"row"} gap={1} alignItems={"center"}>
                                        <AlternateEmailIcon />
                                        <b>E-mail:</b>
                                    </Stack>
                                </Typography>
                                <Stack>
                                    <Typography sx={{ mx: 4 }}>{email}</Typography>
                                </Stack>
                            </Stack>
                            <Stack sx={{ alignContent: "center", p: 2, my: 1, bgcolor: "aliceblue", borderRadius: "8px" }}>
                                <Typography fontSize={20}>
                                    <Stack direction={"row"} gap={1} alignItems={"center"}>
                                        <LinkIcon />
                                        <b>Blockchain ID:</b>
                                    </Stack>
                                </Typography>
                                <Stack>
                                    <Typography sx={{ mx: 4 }}>{blockchain}</Typography>
                                </Stack>
                            </Stack>
                            <Stack sx={{ alignContent: "center", p: 2, my: 1, bgcolor: "aliceblue", borderRadius: "8px" }}>
                                <Typography fontSize={20}>
                                    <Stack direction={"row"} gap={1} alignItems={"center"}>
                                        <KeyIcon />
                                        <b>Public Key:</b>
                                    </Stack>
                                </Typography>
                                <Stack>
                                    <Typography sx={{ mx: 4 }}>{publicKey}</Typography>
                                </Stack>
                            </Stack>
                            <Stack sx={{ alignContent: "center", p: 2, my: 1, bgcolor: "aliceblue", borderRadius: "8px" }}>
                                <Typography fontSize={20}>
                                    <Stack direction={"row"} gap={1} alignItems={"center"}>
                                        <VpnKeyIcon />
                                        <b>Private Key:</b>
                                    </Stack>
                                </Typography>
                                <Stack>
                                    <Typography sx={{ mx: 4 }}>{privateKey}</Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    ) : (
                        <Button href="/login" variant="contained">Login</Button>
                    )}
                </Stack>
            </Container>
        </ColorPalette >
    );
}
