import React from "react";
import { Container, Stack, Typography, TextField, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, Button } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import { useState } from "react";


export default function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })
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
    const csrftoken = getCookie('csrftoken');

    async function handleSubmit() {
        // e.preventDefault();



        // try {
        //     await axios.post(
        //         "http://localhost:8000/api/submit_contact_form/",
        //         formData
        //     );
        //     alert("Form Submitted");
        //     setFormData({ username: "", password: "" });
        // } catch (error) {
        //     console.error("Error submitting form:", error);
        //     alert("Error submitting form. Please try again later.");
        // }
    }

    function handleChange() {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    return (
        <>

            <Container fixed>
                <Stack gap={2}>
                    <Stack>

                        <Typography variant="h3">Login</Typography>
                    </Stack>
                    <Stack>

                        <form onSubmit={handleSubmit}>
                            <Stack gap={1}>
                                <Stack>
                                    <TextField label="Username" name="username" required />
                                </Stack>
                                <Stack>
                                    <FormControl sx={{ width: '100%' }} variant="outlined" required>
                                        <InputLabel htmlFor="outlined-adornment-password" >Password</InputLabel>
                                        <OutlinedInput
                                            id="outlined-adornment-password"
                                            type={showPassword ? 'text' : 'password'}
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
                                            name="password"
                                        />
                                    </FormControl>
                                </Stack>
                                <Stack>
                                    <Stack sx={{ display: "block", alignSelf: "end" }}>
                                        <Button variant="contained" type="submit" align="end">Submit</Button>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </form>
                    </Stack>
                </Stack>
            </Container>
        </>
    )
}