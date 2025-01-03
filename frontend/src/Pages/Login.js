import React from "react";
import { Container, Stack, Typography, TextField, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, Button } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import { useState } from "react";
import axios from "axios"

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }

        return cookieValue;
    }


    async function handleSubmit(e) {
        e.preventDefault();
        const csrftoken = getCookie('csrftoken');

        try {
            const response = await axios.post(
                "/api/login/",
                { username, password },
                {
                    headers: {
                        "X-CSRFToken": csrftoken,
                    },
                }
            );
            if (response.data.success) {
                alert("Form Submitted");
            }
            else {
                alert("Invalid credentials.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Error submitting form. Please try again later.");
        }
    }

    return (
        <>
            <Container fixed sx={{ my: 3 }}>
                <Stack gap={2}>
                    <Stack>
                        <Typography variant="h3">Login</Typography>
                    </Stack>
                    <Stack>
                        <Stack gap={1}>
                            <Stack>
                                <TextField label="Username" value={username}
                                    onChange={(e) => setUsername(e.target.value)} required />
                            </Stack>
                            <Stack>
                                <TextField
                                    required
                                    id="outlined-adornment-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={
                                                    showPassword ? 'hide the password' : 'display the password'
                                                }
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                onMouseUp={handleMouseUpPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    label="Password"
                                />
                            </Stack>
                            <Stack>
                                <Stack sx={{ display: "block", alignSelf: "end" }}>
                                    <Button variant="contained" type="submit" align="end" onClick={handleSubmit}>Login</Button>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </Container>
        </>
    )
}