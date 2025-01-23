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

export default function GeneralJournal() {
    const redirect = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [popup, setPopup] = useState(false);
    const [popupId, setPopupId] = useState('');
    const [rows, setRows] = useState([]);

    const columns = [
        { id: 'id', label: 'ID', minWidth: 120 },
        { id: 'company', label: 'Company', minWidth: 170 },
        { id: 'period', label: 'Period', minWidth: 120 },
        {
            id: 'balance',
            label: 'Balance',
            minWidth: 170,
            align: 'right',
            format: (value) => value.toLocaleString('en-US'),
        },
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
    
    function fetchData() {
        const csrftoken = getCookie('csrftoken');
        axios.get('/api/journal', {
            headers:{
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
    
    useEffect(()=>{
        fetchData()
        console.log(rows)
    }, [])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    function handleDelete(journal_id) {
        const csrftoken = getCookie('csrftoken');
        axios.delete(
            `/api/journal/?id=${journal_id}`, {
            headers:{
                'X-CSRFTOKEN': csrftoken,
                "Content-Type": "multipart/form-data",
            },
        })
        .then(response => {
            return response.data
        })
        .then(()=>{
            window.location.reload();
        })
        .catch(error => {
            console.error("Error deleting data:", error.response?.data || error.message);
        })
    }

    const handleDeleteClick = (id) => {
        setPopupId(id);
        setPopup(true);
    }
    
    function handleEdit(journal_id) {
        redirect(`/journal/${journal_id}/update`)
    }

    return (
        <>
            <ColorPalette>
                <Container fixed sx={{ marginY: "3%" }}>
                    <Stack gap={5}>
                        <Stack>
                            <Typography variant="h3">General Journal</Typography>
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
                                        Add Journal
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
                                                                                        : value}
                                                                                </>
                                                                            }
                                                                        </TableCell>
                                                                    );
                                                                })}
                                                                <TableCell sx={{ minWidth: 100 }} align="right" key={`api-${row.id}`}>
                                                                    <Stack flexWrap={'wrap'} direction={'row'} gap={1} justifyContent={'flex-end'}>
                                                                        <Button sx={{p:0, width:'auto', minWidth:0}} onClick={()=>{handleEdit(row.id)}}><EditIcon /></Button>
                                                                        <Button sx={{p:0, width:'auto', minWidth:0}} onClick={()=>{handleDeleteClick(row.id)}}><DeleteForeverIcon /></Button>
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
                                <Typography>There is no Journal yet</Typography>
                            )}
                        </Stack>
                    </Stack>
                </Container>
            </ColorPalette>
        </>
    )
}