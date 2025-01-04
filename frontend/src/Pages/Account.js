// TODO: CHECK AXIOS POST API LINKS.
import React from "react";
import axios from "axios";
import { Container, Stack, Typography, TextField, Select, MenuItem, InputLabel, FormControl, Button } from "@mui/material";
import { useState } from "react";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';


export default function Account() {
    const [id, setId] = useState("")
    const [name, setName] = useState("")
    const [type, setType] = useState("undefined")

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
        formData.append('name', name);
        formData.append('name', name);
        formData.append('type', type);

        const response = axios.post(
            "/api/account/",
            formData,
            {
                headers: {
                    "X-CSRFToken": csrftoken,
                },
            }
        )
            .then(function (response) {
                if (response.data) {
                    saveData('account_data', JSON.stringify(response.data), 60);
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
            <Container fixed sx={{ my: "3%" }}>
                <Stack gap={3}>
                    <Stack direction={"row"} gap={2} sx={{ display: "flex", alignItems: "center" }}>
                        <Stack >
                            <PeopleAltIcon sx={{ fontSize: "3rem" }} />
                        </Stack>
                        <Stack>
                            <Typography variant="h3">Account</Typography>
                        </Stack>
                    </Stack>
                    <Stack gap={2}>
                        <Stack>
                            <Typography></Typography>
                            <TextField label="Reff" value={id}
                                onChange={(e) => setId(e.target.value)} type="number" required />
                        </Stack>
                        <Stack>
                            <TextField label="Name" value={name}
                                onChange={(e) => setName(e.target.value)} type="text" required />
                        </Stack>
                        <Stack>
                            <FormControl>
                                <InputLabel required>Type</InputLabel>
                                <Select
                                    value={(type == "undefined") ? "undefined" : type}
                                    label="Type"
                                    onChange={(e) => setType(e.target.value)}
                                    required
                                >
                                    <MenuItem value={"undefined"}>
                                        <em>Undefined</em>
                                    </MenuItem>
                                    <MenuItem value={"asset"}>Asset</MenuItem>
                                    <MenuItem value={"liability"}>Liability</MenuItem>
                                    <MenuItem value={"equity"}>Equity</MenuItem>
                                    <MenuItem value={"revenue"}>Revenue</MenuItem>
                                    <MenuItem value={"expense"}>Expense</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                        <Stack>
                            <Stack sx={{ display: "block", alignSelf: "end" }}>
                                <Button variant={"contained"} type="submit" align="end" onClick={handleSubmit}>
                                    ABCs
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </Container>
        </>
    )
}