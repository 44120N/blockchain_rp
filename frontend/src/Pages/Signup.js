import React from "react";
import { Container, Stack, TextField, Typography, Button } from "@mui/material";
import { useState } from "react";

export default function SignUp() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [retypePassword, setRetypePassword] = useState("")

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
            if (password == retypePassword) {
                const response = await axios.post(
                    "/api/login/",
                    { username, email, password },
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
            }
            else {
                alert("The password is not matching")
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
                        <Typography variant="h3">Sign Up</Typography>
                    </Stack>
                    <Stack>
                        <Stack gap={1}>
                            <Stack>
                                <TextField label="Username" onChange={(e) => setUsername(e.target.value)} required />
                            </Stack>
                            <Stack>
                                <TextField label="Email" onChange={(e) => setEmail(e.target.value)} required />
                            </Stack>
                            <Stack>
                                <TextField label="Password" onChange={(e) => setPassword(e.target.value)} required />
                            </Stack>
                            <Stack>
                                <TextField label="Confirm Password" onChange={(e) => setRetypePassword(e.target.value)} required />
                            </Stack>
                            <Stack>
                                <Stack sx={{ display: "block", alignSelf: "end" }}>
                                    <Button variant="contained" type="submit" align="end" onClick={handleSubmit}>Sign Up</Button>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>

            </Container>
        </>
    );
}