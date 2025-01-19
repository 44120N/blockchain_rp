import React, { useEffect } from "react";
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    IconButton,
    TableRow,
    Box,
    Collapse,
    TablePagination,
    Divider,
    Stack,
    Button,
    TextField
} from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ColorPalette from "../Components/ColorPalette";
import Popup from "../Components/Popup";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import axios from "axios";

export default function Account() {
    const redirect = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [popup, setPopup] = useState(false);
    const [popupId, setPopupId] = useState('');
    const [rows, setRows] = useState([]);

    const columns = [
        { id: 'ref', label: 'Ref', minWidth: 120 },
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'type', label: 'Type', minWidth: 120 },
    ];

    function capitalize(sentence) {
        const words = sentence.split(" ");
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substring(1); 
        }
        return words.join(" ");
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

    function fetchData() {
        const csrftoken = getCookie('csrftoken');
        axios.get('/api/account', {
            headers: {
                'X-CSRFTOKEN': csrftoken,
                "Content-Type": "multipart/form-data",
            },
        })
            .then(response => {
                setRows(response.data);
            })
            .catch(error => {
                console.error("Error fetching data:", error.response?.data || error.message);
            })
    }

    useEffect(() => {
        fetchData();
    }, [])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    function handleDelete(account_id) {
        const csrftoken = getCookie('csrftoken');
        axios.delete(
            `/api/account/?id=${account_id}`, {
            headers: {
                'X-CSRFTOKEN': csrftoken,
                "Content-Type": "multipart/form-data",
            },
        })
            .then(response => {
                return response.data
            })
            .then(() => {
                window.location.reload(false);
            })
            .catch(error => {
                console.error("Error deleting data:", error.response?.data || error.message);
            })
    }

    const handleDeleteClick = (id) => {
        setPopupId(id);
        setPopup(true);
    }

    function handleEdit(account_id) {
        redirect(`/account/${account_id}/update`)
    }

    return (
        <>
            <ColorPalette>
                <Container fixed sx={{ marginY: "3%" }}>
                    <Stack gap={5}>
                        <Stack>
                            <Typography variant="h3">Accounts</Typography>
                            <Divider
                                sx={{
                                    borderWidth: ".3vh",
                                    width: "100%",
                                }}
                            />
                        </Stack>
                        <Stack>
                            <Stack sx={{ display: "block", alignSelf: "end" }}>
                                <Link to="./create">
                                    <Button>
                                        Add Account
                                    </Button>
                                </Link>
                            </Stack>
                        </Stack>
                        <Popup trigger={popup} setTrigger={setPopup} title="Are you sure you want to delete this journal?">
                            <Stack>
                                <Typography>Do you want to delete this journal?</Typography>
                                <Typography>This action cannot be undone.</Typography>
                            </Stack>
                            <Stack>
                                <Button variant={"outlined"} sx={{ display: "block", alignSelf: "end" }} onClick={() => { handleDelete(popupId) }}>Delete</Button>
                            </Stack>
                        </Popup>
                        <Stack>
                            {rows.length ? (
                                <Paper sx={{ width: "100%" }}>
                                    <TableContainer sx={{ maxHeight: 440 }}>
                                        <Table stickyHeader aria-label="sticky table">
                                            <TableHead>
                                                <TableRow>
                                                    {columns.map((column) => (
                                                        <TableCell
                                                            key={column.id}
                                                            align={column.align}
                                                            style={{ minWidth: column.minWidth }}
                                                        >
                                                            {column.label}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell align="right">
                                                        Action
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((row) => {
                                                        return (
                                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                                {columns.map((column) => {
                                                                    const value = row[column.id];
                                                                    return (
                                                                        <TableCell key={`${row.id}-${column.id}`} align={column.align}>
                                                                            {(value == row.id) ?
                                                                                <Link to={row.id}>
                                                                                    {column.format && typeof value === 'number'
                                                                                        ? column.format(value)
                                                                                        : value}
                                                                                </Link>
                                                                                :
                                                                                <>
                                                                                    {column.format && typeof value === 'number'
                                                                                        ? column.format(value)
                                                                                        : capitalize(value)}
                                                                                </>
                                                                            }
                                                                        </TableCell>
                                                                    );
                                                                })}
                                                                <TableCell sx={{ minWidth: 100 }} align="right" key={`api-${row.id}`}>
                                                                    <Stack flexWrap={'wrap'} direction={'row'} gap={1} justifyContent={'flex-end'}>
                                                                        <Button sx={{ p: 0, width: 'auto', minWidth: 0 }} onClick={() => { handleEdit(row.id) }}><EditIcon /></Button>
                                                                        <Button sx={{ p: 0, width: 'auto', minWidth: 0 }} onClick={() => { handleDeleteClick(row.id) }}><DeleteForeverIcon /></Button>
                                                                    </Stack>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <TablePagination
                                        rowsPerPageOptions={[10, 25, 100]}
                                        component="div"
                                        count={rows.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                </Paper>
                            ) : (
                                <Typography>There is no Account yet</Typography>
                            )}
                        </Stack>
                    </Stack>
                </Container>
            </ColorPalette>
        </>
    )
}