import React from "react";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { Container, Stack, Typography, TextField, Button } from "@mui/material";
import dayjs from "dayjs";
import axios from "axios";

export function AddTransactionLine() {
    const redirect = useNavigate();
    const [company, setCompany] = useState("");
    const [date, setDate] = useState(null);
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

    function handleSubmit(e) {
        e.preventDefault();
        const csrftoken = getCookie('csrftoken');

        const formData = new FormData();
        formData.append('company', company);
        formData.append('period', dayjs(date).format("YYYY-MM-DD"));

        axios.post(
            "/api/journal/",
            formData,
            {
                headers: {
                    "X-CSRFToken": csrftoken,
                    "Content-Type": "multipart/form-data",
                },
            }
        )
            .then(function (response) {
                if (response.data) {
                    redirect('/journal');
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Container fixed sx={{ my: "3%" }}>
                    <Stack sx={{ backgroundColor: "aliceblue", p: 5, borderRadius: "32px" }} gap={3}>
                        <Typography variant="h3">
                            <Stack direction={"row"} sx={{ justifyContent: "space-between" }}>
                                Add Transaction Line
                                <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography variant="h6" sx={{ backgroundColor: "#0074D9", color: "white", px: 2, borderRadius: "16px" }}>
                                        {transaction_id}
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
                                format="YYYY-MM-DD"
                                required
                            />
                        </Stack>
                        <Stack direction={"row"} justifyContent={"end"} gap={1}>
                            <Link to={`../journal`}>
                                <Button variant="contained">
                                    Cancel
                                </Button>
                            </Link>
                            <Button variant="contained" onClick={handleSubmit}>
                                Add
                            </Button>
                        </Stack>
                    </Stack >
                </Container >
            </LocalizationProvider>
        </>
    )
}

export function UpdateTransactionLine() {
    const redirect = useNavigate();
    const [company, setCompany] = useState("");
    const [date, setDate] = useState(null);
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

    // function fetchData() {
    //     const csrftoken = getCookie('csrftoken');
    //     axios.get(`/api/journal/?id=${transaction_id}`, { headers: { 'X-CSRFTOKEN': csrftoken } })
    //         .then(response => {
    //             setCompany(response.data.company);
    //             setDate(dayjs(response.data.period));
    //         })
    //         .catch(error => {
    //             console.error("Error fetching data:", error.response?.data || error.message);
    //         })
    // }

    // useEffect(() => {
    //     fetchData();
    // }, [])

    function handleSubmit(e) {
        e.preventDefault();
        const csrftoken = getCookie('csrftoken');

        const formData = new FormData();
        formData.append('company', company);
        formData.append('period', dayjs(date).format("YYYY-MM-DD"));

        axios.patch(
            `/api/journal/?id=${journal_id}`,
            formData,
            {
                headers: {
                    "X-CSRFToken": csrftoken,
                    "Content-Type": "multipart/form-data",
                },
            }
        )
            .then(function (response) {
                if (response.data) {
                    redirect(`/journal`);
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Container fixed sx={{ my: "3%" }}>
                    <Stack sx={{ backgroundColor: "aliceblue", p: 5, borderRadius: "32px" }} gap={3}>
                        <Typography variant="h3">
                            <Stack direction={"row"} sx={{ justifyContent: "space-between" }}>
                                Edit Transaction Line
                                <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography variant="h6" sx={{ backgroundColor: "#0074D9", color: "white", px: 2, borderRadius: "16px" }}>
                                        {transaction_id}
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
                            <Link to={`/journal`}>
                                <Button variant="contained">
                                    Cancel
                                </Button>
                            </Link>
                            <Button variant="contained" onClick={handleSubmit}>
                                Save Changes
                            </Button>
                        </Stack>
                    </Stack >
                </Container >
            </LocalizationProvider>
        </>
    )
}