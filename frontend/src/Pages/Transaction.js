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
import { Link } from "react-router-dom";
import ColorPalette from "../Components/ColorPalette";
import Popup from "../Components/Popup";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import { useParams } from "react-router-dom";

export default function Transaction() {
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [popup, setPopup] = useState(false);

    const { journal_id } = useParams();
    const [transaction_id, setTransaction_id] = useState("");

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

    function fetchTransactionData() {
        const csrftoken = getCookie('csrftoken');
        axios.get(`/api/transaction/?journal_id=${journal_id}`, {
            headers: {
                'X-CSRFTOKEN': csrftoken,
                "Content-Type": "multipart/form-data",
            },
        })
            .then(response => {
                setTransaction_id(response.data.id)
            })
            .catch(error => {
                console.error("Error fetching data:", error.response?.data || error.message);
            })
    }

    // useEffect(() => {
    //     fetchJournalData();
    //     fetchTransactionData();
    // }, [])

    function handleDelete(e) {
        e.preventDefault();
    }

    function handleEdit() { }

    useEffect(() => {
        setRows({ date: "12-12-2022", account: "India", ref: "101", dr: "10", cr: "100000" })
        console.log(rows)
    }, [])

    return (
        <>
            <ColorPalette>
                <Container fixed sx={{ marginY: "3%" }}>
                    <Stack gap={5}>
                        <Stack alignItems={'center'} direction={'column'}>
                            {/* TODO: Capitaize */}
                            <Typography variant="h3"></Typography>
                            <Typography variant="h3">Transaction</Typography>
                            <Typography variant="h3"></Typography>
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
                                <Popup trigger={popup} setTrigger={setPopup} title="A">
                                    <Stack>
                                        <Typography>Hey</Typography>
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
                                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                                                {columns.map((column) => {
                                                                    const value = row[column.id];
                                                                    return (
                                                                        <TableCell key={column.id} align={column.align}>
                                                                            {(value == row.id) ?
                                                                                <Link to={`../transaction/${row.id}`}>
                                                                                    {column.format && typeof value === 'number'
                                                                                        ? column.format(value)
                                                                                        : value}
                                                                                </Link>
                                                                                :
                                                                                <>
                                                                                    {column.format && typeof value === 'number'
                                                                                        ? column.format(value)
                                                                                        : value}
                                                                                </>
                                                                            }
                                                                        </TableCell>
                                                                    );
                                                                })}
                                                                <TableCell sx={{ minWidth: 100 }} align="right">
                                                                    <Stack sx={{ display: "block" }}>
                                                                        <Button onClick={handleEdit}><EditIcon /></Button>
                                                                        <Button onClick={() => { setPopup(true) }}><DeleteForeverIcon /></Button>
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
                                <Typography>There is no Transaction in this journal</Typography>
                            )}
                        </Stack>
                    </Stack>
                </Container>
            </ColorPalette>
        </>
    )
}