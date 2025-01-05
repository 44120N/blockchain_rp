import React from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { Container, Stack, Typography, TextField, Button } from "@mui/material";

export function AddJournal() {
    const [open, setOpen] = useState(false);
    const [company, setCompany] = useState("");
    const [date, setDate] = useState(null);

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
        formData.append('company', company);
        formData.append('date', date);

        const response = axios.post(
            "/api/journal/",
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

        setOpen(false);
    }

    return (
        <>
            <Container fixed sx={{ my: "3%" }}>
                <Stack>
                    ABC
                </Stack>
            </Container>
        </>
    )
}

export function UpdateJournal() {
    const [open, setOpen] = useState(false);
    const [company, setCompany] = useState("");
    const [date, setDate] = useState(null);

    const { address } = useParams()

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
        formData.append('company', company);
        formData.append('date', date);

        const response = axios.post(
            "/api/journal/",
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

        setOpen(false);
    }

    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Container fixed sx={{ my: "3%" }}>
                    <Stack sx={{ backgroundColor: "aliceblue", p: 5, borderRadius: "32px" }} gap={3}>
                        <Typography variant="h3">
                            <Stack direction={"row"} sx={{ justifyContent: "space-between" }}>
                                Edit Journal
                                <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography variant="h6" sx={{ backgroundColor: "#0074D9", color: "white", px: 2, borderRadius: "16px" }}>
                                        # {address}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Typography>
                        <Stack>
                            <TextField label="Company" value={company}
                                onChange={(e) => setCompany(e.target.value)} required />
                        </Stack>
                        <Stack>
                            <DatePicker
                                label="Period"
                                value={date}
                                onChange={(e) => setDate(e)}
                                required
                            />
                        </Stack>
                        <Stack direction={"row"} justifyContent={"end"} gap={1}>
                            <Link to={`../journal/${address}`}>
                                <Button variant="contained">
                                    Cancel
                                </Button>
                            </Link>
                            <Button variant="contained">
                                Apply Changes
                            </Button>
                        </Stack>
                    </Stack >
                </Container >
            </LocalizationProvider>
        </>
    )
}