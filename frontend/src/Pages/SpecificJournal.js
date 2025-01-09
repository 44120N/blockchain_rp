import React, { useEffect, useState } from "react";
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
import { Link, useParams, useNavigate } from "react-router-dom";
import ColorPalette from "../Components/ColorPalette";
import Popup from "../Components/Popup";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import axios from "axios";
import dayjs from "dayjs";

export default function SpecificJournal() {
    const redirect = useNavigate();
    const [journalId, setJournalId] = useState('');
    const [popupId, setPopupId] = useState('')
    const [company, setCompany] = useState('');
    const [period, setPeriod] = useState('');
    
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [popup, setPopup] = useState(false);
    const { journal_id } = useParams();

    const columns = [
        { id: 'date', label: 'Date', minWidth: 100 },
        { id: 'account', label: 'Account', minWidth: 200 },
        { id: 'ref', label: 'Ref', minWidth: 100 },
        { id: 'dr', label: 'Debit', minWidth: 100 },
        { id: 'cr', label: 'Credit', minWidth: 100 },
    ];

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
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

    function fetchJournalData() {
        const csrftoken = getCookie('csrftoken');
        axios.get(`/api/journal?id=${journal_id}`, {
            headers:{
                'X-CSRFTOKEN': csrftoken,
                "Content-Type": "multipart/form-data",
            },
        })
        .then(response => {
            setJournalId(response.data.id);
            setCompany(response.data.company);
            setPeriod(response.data.period);
            setRows(response.data.transactions);
        })
        .catch(error => {
            console.error("Error fetching data:", error.response?.data || error.message);
        })
    }

    useEffect(()=>{
        fetchJournalData();
    }, [])

    function handleDelete(transaction_id) {
        const csrftoken = getCookie('csrftoken');
        axios.delete(
            `/api/transaction/?transaction_id=${transaction_id}`, {
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
    
    function handleEdit(transaction_id) {
        redirect(`/transaction/${transaction_id}/update`)
    }

    return (
        <>
            <ColorPalette>
                <Container fixed sx={{ marginY: "3%" }}>
                    <Stack gap={5}>
                        <Stack alignItems={'center'} direction={'column'}>
                            {/* TODO: Capitalize */}
                            <Typography variant="h3">{company}</Typography>
                            <Typography variant="h3">General Journal</Typography>
                            <Typography variant="h3">{period}</Typography>
                            <Divider
                                sx={{
                                    borderWidth: ".3vh",
                                    width: "100%",
                                }}
                            />
                        </Stack>
                        <Stack>
                            <Stack sx={{ display: "block", alignSelf: "end" }}>
                                <Link to={`../transaction/${journal_id}/create`}>
                                    <Button>
                                        Add Transaction
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
                                <Button variant={"outlined"} sx={{ display: "block", alignSelf: "end" }} onClick={()=>{handleDelete(popupId)}}>Delete</Button>
                            </Stack>
                        </Popup>
                        <Stack>
                            {rows.length?(
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
                                                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                                    return (
                                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                            {columns.map((column) => {
                                                                if (column.id === 'account') {
                                                                    return (
                                                                        <TableCell key={`${row.id}-${column.id}`} align={column.align}>
                                                                            {row.lines.map((line, index) => (
                                                                                <Typography
                                                                                    key={`${row.id}-${column.id}-${index}`}
                                                                                    sx={{
                                                                                        marginLeft: line.is_debit ? 0 : "1em",
                                                                                    }}
                                                                                >
                                                                                    {line.account.name}
                                                                                </Typography>
                                                                            ))}
                                                                            ({row.description})
                                                                        </TableCell>
                                                                    );
                                                                } else if (column.id === 'dr') {
                                                                    const totalDebit = row.lines
                                                                        .filter((line) => line.is_debit)
                                                                        .reduce((sum, line) => sum + line.value, 0);
                                                                    return (
                                                                        totalDebit?
                                                                            <TableCell key={`${row.id}-${column.id}`} align={column.align}>
                                                                                {totalDebit.toFixed(2)}
                                                                            </TableCell>
                                                                        :
                                                                            <TableCell key={`${row.id}-${column.id}`} align={column.align}>
                                                                            </TableCell>
                                                                    );
                                                                } else if (column.id === 'cr') {
                                                                    const totalCredit = row.lines
                                                                        .filter((line) => !line.is_debit)
                                                                        .reduce((sum, line) => sum + line.value, 0);
                                                                    return (
                                                                        totalCredit?
                                                                            <TableCell key={`${row.id}-${column.id}`} align={column.align}>
                                                                                {totalCredit.toFixed(2)}
                                                                            </TableCell>
                                                                        :
                                                                            <TableCell key={`${row.id}-${column.id}`} align={column.align}>
                                                                            </TableCell>
                                                                    );
                                                                } else if (column.id === 'date') {
                                                                    return (
                                                                        <TableCell key={`${row.id}-${column.id}`} align={column.align}>
                                                                            <Link to={`/transaction/${row.id}`}>
                                                                                {dayjs(row[column.id]).format("DD/MM/YYYY")}
                                                                                <br />
                                                                                {dayjs(row[column.id]).format("HH:mm")}
                                                                            </Link>
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
                                                            <TableCell sx={{ minWidth: 100 }} align="right" key={`api-${row.id}`}>
                                                                <Stack sx={{ display: "block" }}>
                                                                    <Button onClick={()=>{handleEdit(row.id)}}>
                                                                        <EditIcon />
                                                                    </Button>
                                                                    <Button onClick={()=>{handleDeleteClick(row.id)}}>
                                                                        <DeleteForeverIcon />
                                                                    </Button>
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
                            ):(
                                <Typography>There is no Transaction in this journal</Typography>
                            )}
                        </Stack>
                    </Stack>
                </Container>
            </ColorPalette>
        </>
    )
}