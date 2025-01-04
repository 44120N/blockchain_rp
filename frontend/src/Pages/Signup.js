import React from "react";
import axios from "axios";
import { Container, Stack, TextField, Typography, Button, InputAdornment, IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
    const redirect = useNavigate();
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [retypePassword, setRetypePassword] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);
    
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowRetypePassword = () => setShowRetypePassword((show) => !show);

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
        formData.append('email', email);
    
        if (password === retypePassword) {
            axios.post(
                "/api/signup/",
                formData,
                {
                    headers: {
                        "X-CSRFToken": csrftoken,
                    },
                }
            )
            .then(function(response) {
                redirect('/');
            })
            .catch(function(error) {
                if (error.response && error.response.data) {
                    const errors = error.response.data;
                    alert("Form validation failed:\n" + JSON.stringify(errors));
                } else {
                    console.error("Error submitting form:", error);
                    alert("Error submitting form. Please try again later.");
                }
            });
        } else {
            alert("The password does not match.");
        }
    }

    return (
        <>
            <Container fixed sx={{ my: 3 }}>
                <Stack gap={2}>
                    <Stack>
                        <Typography variant="h3">Sign Up</Typography>
                    </Stack>
                    <Stack>
                        <Stack gap={1}>
                            <Stack>
                                <TextField 
                                    label="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)} 
                                    required 
                                />
                            </Stack>
                            <Stack>
                                <TextField 
                                    label="Email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                />
                            </Stack>
                            <Stack>
                                <TextField 
                                    label="Password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    type={showPassword ? 'text' : 'password'}
                                    slotProps={{
                                        input: {
                                            endAdornment:(
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
                                />
                            </Stack>
                            <Stack>
                                <TextField 
                                    label="Confirm Password" 
                                    value={retypePassword}
                                    onChange={(e) => setRetypePassword(e.target.value)} 
                                    required
                                    type={showRetypePassword ? 'text' : 'password'}
                                    slotProps={{
                                        input: {
                                            endAdornment:(
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label={
                                                            showRetypePassword ? 'hide the retype password' : 'display the retype password'
                                                        }
                                                        onClick={handleClickShowRetypePassword}
                                                        edge="end"
                                                    >
                                                        {showRetypePassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                />
                            </Stack>
                            <Stack>
                                <Stack sx={{ display: "block", alignSelf: "end" }}>
                                    <Button variant="contained" type="submit" align="end" onClick={handleSubmit}>Sign Up</Button>
                                </Stack>
                            </Stack>
                            <Stack direction={'row'}>
                                <Typography>Already have an account? <Link to={'/login'}>Login here</Link></Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>

            </Container>
        </>
    );
}