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

                    <Stack>
                        <Stack direction={"row"} sx={{ alignContent: "center", p: 2, my: 1, bgcolor: "aliceblue", borderRadius: "8px" }} gap={2}>
                            <AlternateEmailIcon />
                            <Typography>E-mail: <b>{email}</b></Typography>
                        </Stack>
                        <Stack direction={"row"} sx={{ alignContent: "center", p: 2, my: 1, bgcolor: "aliceblue", borderRadius: "8px" }} gap={2}>
                            <LinkIcon />
                            <Typography>Blockchain ID: <b>{blockchain}</b></Typography>
                        </Stack>
                        <Stack direction={"row"} sx={{ alignContent: "center", p: 2, my: 1, bgcolor: "aliceblue", borderRadius: "8px" }} gap={2}>
                            <KeyIcon />
                            <Typography>Public Key: <b>{publicKey}</b></Typography>
                        </Stack>
                        <Stack direction={"row"} sx={{ alignContent: "center", p: 2, my: 1, bgcolor: "aliceblue", borderRadius: "8px" }} gap={2}>
                            <VpnKeyIcon />
                            <Typography>Private Key: <b>{privateKey}</b></Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </Container>
        </ColorPalette>
    );
}
