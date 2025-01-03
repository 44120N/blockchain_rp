import React from "react";
import { Container, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";

export default function SignUp() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [retypePassword, setRetypePassword] = useState("")

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
                                <TextField label="Password" onChange={(e) => setPassword(e.target.value)} required />
                            </Stack>
                            <Stack>
                                <TextField label="Confirm Password" onChange={(e) => setRetypePassword(e.target.value)} required />
                            </Stack>
                            <Stack>
                                <Stack sx={{ display: "block", alignSelf: "end" }}>
                                    <Button variant="contained" type="submit" align="end" onClick={handleSubmit}>Submit</Button>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>

            </Container>
        </>
    );
}