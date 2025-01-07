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
import { Link, useParams } from "react-router-dom";
import ColorPalette from "../Components/ColorPalette";
import Popup from "../Components/Popup";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import axios from "axios";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export default function SpecificJournal() {
    const [journalId, setJournalId] = useState('');
    const [company, setCompany] = useState('');
    const [period, setPeriod] = useState('');
    
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [popup, setPopup] = useState(false);
    const { journal_id } = useParams();

    dayjs.extend(utc);
    dayjs.extend(timezone);
    
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

    function handleDelete(e) {
        e.preventDefault();
    }

    function handleEdit() { }


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
                                <Popup trigger={popup} setTrigger={setPopup} title="A">
                                    <Stack>
                                        <Typography>Hey</Typography>
                                    </Stack>
                                </Popup>
                            </Stack>
                        </Stack>
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
                                                {rows
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((row) => {
                                                        return (
                                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                                {columns.map((column) => {
                                                                    const value = row[column.id];
                                                                    return (
                                                                        <TableCell key={`${row.id}-${column.id}`} align={column.align}>
                                                                            {(column.id==='date') ?
                                                                                <Link to={`/transaction/${row.id}`}>
                                                                                    {dayjs(value).tz("Asia/Jakarta").format("DD/MM/YYYY")}
                                                                                    <br/>
                                                                                    {dayjs(value).tz("Asia/Jakarta").format("HH:mm")}
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