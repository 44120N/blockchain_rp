//TODO: CHECK AXIOS API LINK
import * as React from 'react';
import { useState } from 'react';
import { TextField, DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog, Button, Stack, DatePicker } from '@mui/material';

export default function AlertDialog() {
    const [open, setOpen] = useState(false);

    const [company, setCompany] = useState("");
    const [date, setDate] = useState("");

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
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
            <Button variant="contained" onClick={handleClickOpen}>
                New Journal
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"New Journal"}
                </DialogTitle>
                <DialogContent>
                    <Stack gap={1}>
                        <Stack>
                            <TextField label="Company" value={company}
                                onChange={(e) => setCompany(e.target.value)} required />
                        </Stack>
                        <Stack>
                            {/* ERROR Here */}
                            {/* <DatePicker
                                label="Controlled picker"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            /> */}
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} autoFocus>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}