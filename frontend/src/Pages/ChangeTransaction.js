import React from "react";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Container, Stack, Typography, TextField, Button } from "@mui/material";
import axios from "axios";

import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

export function AddTransaction() {
    const redirect = useNavigate();
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(null);
    const { journal_id } = useParams()

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
        formData.append('description', description);
        formData.append('date', dayjs(date).format("YYYY-MM-DDTHH:mm:ssZ"));

        axios.post(
            `/api/transaction/?journal_id=${journal_id}`,
            formData,
            {
                headers: {
                    "X-CSRFToken": csrftoken,
                    "Content-Type": "multipart/form-data",
                },
            }
        )
        .then(response => {
            if (response.data) {
                redirect(`/journal/${journal_id}`)
            }
        })
        .catch(error => {
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Container fixed sx={{ my: "3%" }}>
                    <Stack sx={{ backgroundColor: "aliceblue", p: 5, borderRadius: "32px" }} gap={3}>
                        <Typography variant="h3">
                            <Stack direction={"row"} sx={{ justifyContent: "space-between" }}>
                                Create Transaction
                                <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography variant="h6" sx={{ backgroundColor: "#0074D9", color: "white", px: 2, borderRadius: "16px" }}>
                                        {journal_id}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Typography>
                        <Stack>
                            <TextField label="Description" value={description}
                                onChange={(e) => setDescription(e.target.value)} required />
                        </Stack>
                        <Stack>
                            <DateTimePicker
                                label="Period *"
                                value={date}
                                onChange={(e) => setDate(e)}
                                required
                            />
                        </Stack>
                        <Stack direction={"row"} justifyContent={"end"} gap={1}>
                            <Link to={`/journal/${journal_id}`}>
                                <Button variant="contained">
                                    Cancel
                                </Button>
                            </Link>
                            <Button variant="contained" onClick={handleSubmit}>
                                Create
                            </Button>
                        </Stack>
                    </Stack >
                </Container >
            </LocalizationProvider>
        </>
    )
}

export function UpdateTransaction() {
    const redirect = useNavigate();
    const [date, setDate] = useState(null);
    const [description, setDescription]  = useState("");
    const [journal_id, setJournal_id] = useState("");
    const { transaction_id } = useParams();

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

    function fetchData() {
        const csrftoken = getCookie('csrftoken');
        axios.get(`/api/transaction/?transaction_id=${transaction_id}`, 
            {
                headers:{
                    'X-CSRFTOKEN': csrftoken,
                    "Content-Type": "multipart/form-data",
                }
            }
        )
        .then(response => {
            setDate(dayjs(response.data.date));
            setDescription(response.data.description);
            setJournal_id(response.data.journal);
        })
        .catch(error => {
            console.error("Error fetching data:", error.response?.data || error.message);
        })
    }

    useEffect(()=>{
        fetchData();
    }, [])


    function handleSubmit(e) {
        e.preventDefault();
        const csrftoken = getCookie('csrftoken');

        const formData = new FormData();
        formData.append('description', description);
        formData.append('date', dayjs(date).format("YYYY-MM-DDTHH:mm:ssZ"));
        formData.append('journal', journal_id);

        axios.patch(
            `/api/transaction/?transaction_id=${transaction_id}`,
            formData,
            {
                headers: {
                    "X-CSRFToken": csrftoken,
                    "Content-Type": "multipart/form-data",
                },
            }
        )
        .then((response) => {
            if (response.data) {
                redirect(`/journal/${journal_id}`);
            }
        })
        .catch((error) => {
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Container fixed sx={{ my: "3%" }}>
                    <Stack sx={{ backgroundColor: "aliceblue", p: 5, borderRadius: "32px" }} gap={3}>
                        <Typography variant="h3">
                            <Stack direction={"row"} sx={{ justifyContent: "space-between" }}>
                                Edit Transaction
                                <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography variant="h6" sx={{ backgroundColor: "#0074D9", color: "white", px: 2, borderRadius: "16px" }}>
                                        {transaction_id}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Typography>
                        <Stack>
                            <TextField label="Description" value={description}
                                onChange={(e) => setDescription(e.target.value)} required />
                        </Stack>
                        <Stack>
                            <DateTimePicker
                                label="Date"
                                value={date}
                                onChange={(e) => setDate(e)}
                                required
                            />
                        </Stack>
                        <Stack direction={"row"} justifyContent={"end"} gap={1}>
                            <Link to={`/journal/${journal_id}`}>
                                <Button variant="contained">
                                    Cancel
                                </Button>
                            </Link>
                            <Button variant="contained" onClick={handleSubmit}>
                                Apply Changes
                            </Button>
                        </Stack>
                    </Stack >
                </Container >
            </LocalizationProvider>
        </>
    )
}