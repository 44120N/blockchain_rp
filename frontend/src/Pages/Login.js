import React from "react";
import { Container, Stack, Typography, TextField, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, Button } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import { useState } from "react";
import axios from "axios"
import { Link, useNavigate } from "react-router-dom";
import { saveData } from "../DataEncrypt";

export default function Login() {
    const redirect = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

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


    function handleSubmit(e) {
        e.preventDefault();
        const csrftoken = getCookie('csrftoken');

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = axios.post(
            "/api/login/",
            formData,
            {
                headers: {
                    "X-CSRFToken": csrftoken,
                },
            }
        )
            .then(function (response) {
                if (response.data) {
                    saveData('login_data', JSON.stringify(response.data), 60);
                    redirect('/');
                }
            })
            .catch(function (error) {
                if (error.response && error.response.data) {
                    const errors = error.response.data;
                    alert("Form validation failed:\n" + JSON.stringify(errors));
                } else {
                    console.error("Error submitting form:", error);
                    alert("Error submitting form. Please try again later.");
                }
            });
    }

    return (
        <>
            <Container fixed sx={{ my: 3 }}>
                <Stack gap={2} sx={{ bgcolor: "aliceblue", p: 5, borderRadius: "32px" }}>
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
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label={
                                                            showPassword ? 'hide the password' : 'display the password'
                                                        }
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                    label="Password"
                                />
                            </Stack>
                            <Stack>
                                <Stack sx={{ display: "block", alignSelf: "end" }}>
                                    <Button variant="contained" type="submit" align="end" onClick={handleSubmit}>Login</Button>
                                </Stack>
                                <Stack direction={'row'}>
                                    <Typography>Don't have an account? <Link to={'/signup'}>Create Account</Link></Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </Container>
        </>
    )
}