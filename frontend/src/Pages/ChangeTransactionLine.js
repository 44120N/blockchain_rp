import React from "react";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Container, Stack, Typography, TextField, Button } from "@mui/material";
import axios from "axios";
import SelectField from "../Components/SelectField";
import CustomInputNumber from "../Components/CustomInputNumber";

export function AddTransactionLine() {
    const addThousandSeparator = (value) => {
        const parts = value.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    const redirect = useNavigate();
    const [accountChoices, setAccountChoices] = useState([]);
    const typeChoices = [[true, "Debit"], [false, "Credit"]];
    const [account, setAccount] = useState("");
    const [type, setType] = useState(true);
    const [value, setValue] = useState(addThousandSeparator(0.00));
    const { transaction_id } = useParams();

    function fetchAccount() {
        const csrftoken = getCookie('csrftoken');
        axios.get('/api/account', {
            headers: {
                "X-CSRFToken": csrftoken,
                "Content-Type": "multipart/form-data",
            }
        })
        .then(response => {
            const accounts = response.data.map((v) => ([
                v.id,
                v.name,
            ]));
            console.log(accounts);
            setAccountChoices(accounts);
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
        formData.append('account', account);
        formData.append('is_debit', type);
        formData.append('value', parseFloat(String(value).replaceAll(',', '')).toFixed(2));
        console.log(type);
        
        axios.post(
            `/api/transaction-line/?transaction_id=${transaction_id}`,
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
                redirect(`/transaction/${transaction_id}`);
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

    useEffect(()=>{
        fetchAccount();
    }, []);

    return (
        <>
            <Container fixed sx={{ my: "3%" }}>
                <Stack sx={{ backgroundColor: "aliceblue", p: 5, borderRadius: "32px" }} gap={3}>
                    <Typography variant="h3">
                        <Stack direction={"row"} sx={{ justifyContent: "space-between" }}>
                            Add Transaction Line
                            <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="h6" sx={{ backgroundColor: "#0074D9", color: "white", px: 2, borderRadius: "16px" }}>
                                    Transaction ID: {transaction_id}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Typography>
                    <Stack>
                        <SelectField var={account} setVar={setAccount} choices={accountChoices} label={"Account"} />
                    </Stack>
                    <Stack>
                        <CustomInputNumber name="donation" label="Amount" prefix={"IDR"} var={value} setVar={setValue} fullWidth color={"primary"} decimal/>
                    </Stack>
                    <Stack>
                        <SelectField var={type} setVar={setType} choices={typeChoices} label={"Type"} />
                    </Stack>
                    <Stack direction={"row"} justifyContent={"end"} gap={1}>
                        <Link to={`/journal`}>
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