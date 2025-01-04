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
                            Welcome, {username ? username: 'Anonymous'}!
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
                        <Typography>E-mail: {email}</Typography>
                        <Typography>Blockchain ID: {blockchain}</Typography>
                        <Typography>Public Key: {publicKey}</Typography>
                        <Typography>Private Key: {privateKey}</Typography>
                    </Stack>
                </Stack>
            </Container>
        </ColorPalette>
    );
}
