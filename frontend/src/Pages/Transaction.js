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
import { Link, useParams, useNavigate } from "react-router-dom";
import ColorPalette from "../Components/ColorPalette";
import Popup from "../Components/Popup";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import axios from "axios";
import dayjs from "dayjs";

export default function Transaction() {
    const addThousandSeparator = (value) => {
        const parts = value.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    const redirect = useNavigate();
    const [journal, setJournal] = useState('')
    const [date, setDate] = useState('');
    const [desc, setDesc] = useState('');
    const [rows, setRows] = useState([]);
    const [popupId, setPopupId] = useState('');
    const [popup, setPopup] = useState(false);
    const { transaction_id } = useParams();

    const columns = [
        { id: 'account', label: 'Account', minWidth: 200 },
        { id: 'ref', label: 'Ref', minWidth: 100, align: 'center' },
        { id: 'dr', label: 'Debit', minWidth: 100, align: 'center' },
        { id: 'cr', label: 'Credit', minWidth: 100, align: 'center' },
    ];

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

    function fetchTransactionData() {
        const csrftoken = getCookie('csrftoken');
        axios.get(`/api/transaction/?transaction_id=${transaction_id}`, {
            headers: {
                'X-CSRFTOKEN': csrftoken,
                "Content-Type": "multipart/form-data",
            },
        })
        .then(response => {
            console.log(response.data.lines);
            setJournal(response.data.journal);
            setDesc(response.data.description);
            setRows(response.data.lines);
            setDate(response.data.date);
        })
        .catch(error => {
            console.error("Error fetching data:", error.response?.data || error.message);
        })
    }

    useEffect(() => {
        fetchTransactionData();
    }, [])
    
    function handleDelete(line_id) {
        const csrftoken = getCookie('csrftoken');
        axios.delete(
            `/api/transaction-line/?transaction-line_id=${line_id}`, {
            headers:{
                'X-CSRFTOKEN': csrftoken,
                "Content-Type": "multipart/form-data",
            },
        })
        .then(response => {
            return response.data
        })
        .then(()=>{
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
    
    function handleEdit() {}

    return (
        <>
            <ColorPalette>
                <Container fixed sx={{ marginY: "3%" }}>
                    <Stack gap={5}>
                        <Stack alignItems={'center'} direction={'column'}>
                            <Stack direction={'row'} justifyContent={'space-between'} width={'100%'}>
                                <Typography variant="h3">Transaction</Typography>
                                <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography variant="h6" color="#fff" sx={{ backgroundColor: "#0074D9", px: 2, borderRadius: "16px" }}>
                                        {transaction_id}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Divider
                                sx={{
                                    borderWidth: ".3vh",
                                    width: "100%",
                                }}
                            />
                        </Stack>
                        <Stack>
                            <Stack sx={{ display: "block", alignSelf: "end" }}>
                                <Link to={`../transaction-line/${transaction_id}/create`}>
                                    <Button>
                                        Add Transaction Line
                                    </Button>
                                </Link>
                                <Popup trigger={popup} setTrigger={setPopup} title="Are you sure you want to delete this journal?">
                                    <Stack>
                                        <Typography>Do you want to delete this journal?</Typography>
                                        <Typography>This action cannot be undone.</Typography>
                                    </Stack>
                                    <Stack>
                                        <Button variant={"outlined"} sx={{ display: "block", alignSelf: "end" }} onClick={()=>{handleDelete(popupId)}}>Delete</Button>
                                    </Stack>
                                </Popup>
                            </Stack>
                        </Stack>
                        <Stack>
                            {rows.length ? (
                                <Paper sx={{ width: "100%" }}>
                                    <TableContainer sx={{ maxHeight: 440 }}>
                                        <Table stickyHeader aria-label="sticky table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">
                                                        Date
                                                    </TableCell>
                                                    {columns.map((column) => (
                                                        <TableCell
                                                            key={column.id}
                                                            align={column.align}
                                                            style={{ minWidth: column.minWidth }}
                                                        >
                                                            {column.label}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell align="center">
                                                        Action
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {(() => {
                                                    let lastTransactionId = null;
                                                    return rows
                                                    .sort((a, b) => {
                                                        if (a.is_debit !== b.is_debit) {
                                                            return b.is_debit - a.is_debit;
                                                        }
                                                        return a.account.ref.localeCompare(b.account.ref);
                                                    })
                                                    .reduce((acc, row, index, array) => {
                                                        const showDate = lastTransactionId !== row.transaction;
                                                        lastTransactionId = row.transaction;
                                                        acc.push(
                                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                                {showDate ? (
                                                                    <TableCell 
                                                                        rowSpan={array.filter((r) => r.transaction === row.transaction).length + 1} 
                                                                        align="center"
                                                                    >
                                                                        {dayjs(date).format("DD/MM/YYYY")}
                                                                        <br />
                                                                        {dayjs(date).format("HH:mm")}
                                                                    </TableCell>
                                                                ) : null}
                                                                {columns.map((column) => {
                                                                    if (column.id === 'account') {
                                                                        return (
                                                                            <TableCell key={`${row.id}-${column.id}`} align={column.align}>
                                                                                <Typography
                                                                                    sx={{
                                                                                        marginLeft: row.is_debit ? 0 : "1.5em",
                                                                                    }}
                                                                                >
                                                                                    {row.account.name}
                                                                                </Typography>
                                                                            </TableCell>
                                                                        );
                                                                    } else if (column.id === 'ref') {
                                                                        return (
                                                                            <TableCell key={`${row.id}-${column.id}`} align={'center'}>
                                                                                {row.account.ref}
                                                                            </TableCell>
                                                                        );
                                                                    } else if (column.id === 'dr') {
                                                                        return (
                                                                            <TableCell align={column.align} key={`${row.id}-${column.id}`}>
                                                                                {row.is_debit ? addThousandSeparator(row.value) : ""}
                                                                            </TableCell>
                                                                        );
                                                                    } else if (column.id === 'cr') {
                                                                        return (
                                                                            <TableCell align={column.align} key={`${row.id}-${column.id}`}>
                                                                                {!row.is_debit ? addThousandSeparator(row.value) : ""}
                                                                            </TableCell>
                                                                        );
                                                                    } else {
                                                                        return (
                                                                            <TableCell key={`${row.id}-${column.id}`} align={column.align}>
                                                                                {column.format && typeof row[column.id] === "number"
                                                                                    ? column.format(row[column.id])
                                                                                    : row[column.id]}
                                                                            </TableCell>
                                                                        );
                                                                    }
                                                                })}
                                                                <TableCell align="center" key={`api-${row.id}`}>
                                                                    <Stack direction={'row'} justifyContent={'center'} gap={2}>
                                                                        <Button onClick={() => { handleEdit(row.id); }} sx={{ p: 0, minWidth: 0 }}>
                                                                            <EditIcon />
                                                                        </Button>
                                                                        <Button onClick={() => { handleDeleteClick(row.id); }} sx={{ p: 0, minWidth: 0 }}>
                                                                            <DeleteForeverIcon />
                                                                        </Button>
                                                                    </Stack>
                                                                </TableCell>
                                                            </TableRow>
                                                        );

                                                        const nextRow = array[index + 1];
                                                        if (!nextRow || nextRow.transaction !== row.transaction) {
                                                            acc.push(
                                                                <TableRow hover role="checkbox" tabIndex={-1} key={`desc-${row.transaction}`}>
                                                                    {columns.map((column) => {
                                                                        if (column.id === 'account') {
                                                                            return (
                                                                                <TableCell key={`${row.transaction}-${column.id}`} align={column.align} colSpan={4}>
                                                                                    <Typography
                                                                                        sx={{
                                                                                            fontWeight: "bold",
                                                                                        }}
                                                                                    >
                                                                                        ({desc})
                                                                                    </Typography>
                                                                                </TableCell>
                                                                            );
                                                                        }
                                                                    })}
                                                                    <TableCell align="center" key={`api-${row.transaction}`}>
                                                                        <Stack direction={'row'} justifyContent={'center'} gap={2}>
                                                                            <Button onClick={() => { handleEdit(row.transaction); }} sx={{ p: 0, minWidth: 0 }}>
                                                                                <EditIcon />
                                                                            </Button>
                                                                            <Button onClick={() => { handleDeleteClick(row.transaction); }} sx={{ p: 0, minWidth: 0 }}>
                                                                                <DeleteForeverIcon />
                                                                            </Button>
                                                                        </Stack>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        }
                                                        return acc;
                                                    }, []);
                                                })()}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            ) : (
                                <Typography>There is no Transaction in this journal</Typography>
                            )}
                        </Stack>
                        <Stack>
                            <Link to={`/journal/${journal}`}>
                                <Button>
                                    Back to Journal
                                </Button>
                            </Link>
                        </Stack>
                    </Stack>
                </Container>
            </ColorPalette>
        </>
    )
}