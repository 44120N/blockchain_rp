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
} from "@mui/material";
import axios from "axios";
import { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { VariableContext } from "../Components/VariableContext";

import { Link } from "react-router-dom";

const columns = [
    { id: 'company', label: 'Company', minWidth: 170 },
    { id: 'period', label: 'Period', minWidth: 100 },
    {
        id: 'balance',
        label: 'Balance',
        minWidth: 170,
        align: 'right',
        format: (value) => value.toLocaleString('en-US'),
    },
];

function createData(company, period, balance, link) {
    return { company, period, balance, link };
}

const rows = [
    createData('India', 'IN', 1324171354, "/india"),
    createData('China', 'CN', 1403500365, "/home"),
    createData('Italy', 'IT', 60483973, "/home"),
    createData('United States', 'US', 327167434, "/home"),
    createData('Canada', 'CA', 37602103, "/home"),
    createData('Australia', 'AU', 25475400, "/home"),
    createData('Germany', 'DE', 83019200, "/home"),
    createData('Ireland', 'IE', 485700, "/home"),
    createData('Mexico', 'MX', 126577691, "/home"),
    createData('Japan', 'JP', 126317000, "/home"),
    createData('France', 'FR', 67022000, "/home"),
    createData('United Kingdom', 'GB', 67545757, "/home"),
    createData('Russia', 'RU', 146793744, "/home"),
    createData('Nigeria', 'NG', 200962417, "/home"),
    createData('Brazil', 'BR', 210147125, "/home"),
];



export default function Transaction() {
    // const [id, setId] = useParams()
    // const [name, setName] = useState("")
    // const [type, setType] = useState("undefined")

    // Table
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    // Handle address
    const { address, method } = useParams();
    const { isAccount, toggleIsAccount } = useContext(VariableContext);
    const { isTransactionLine, toggleIsTransactionLine } = useContext(VariableContext);

    const [status, setStatus] = useState(null);
    const [render, setRender] = useState(null);


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
        formData.append('status', status);
        formData.append('type', type);

        const response = axios.post(
            "/api/transaction/",
            formData,
            {
                headers: {
                    "X-CSRFToken": csrftoken,
                },
            }
        )
            .then(function (response) {
                if (response.data) {
                    saveData('account_data', JSON.stringify(response.data), 60);
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
    }


    useEffect(() => {
        if (address == undefined) {
            setRender(
                <Stack gap={3} sx={{ bgcolor: "aliceblue", p: 5, borderRadius: "32px" }}>
                    <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                        <Typography variant="h3">
                            Transactions
                        </Typography>
                    </Stack>
                    <Stack gap={2}>
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
                                                                    <Link to={row.link}>
                                                                        {column.format && typeof value === 'number'
                                                                            ? column.format(value)
                                                                            : value}
                                                                    </Link>
                                                                </TableCell>
                                                            );
                                                        })}
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
                    </Stack>
                </Stack>
            )
        }
    }, [])

    return (<>
        <Container fixed sx={{ my: "3%" }}>
            {render}
        </Container >
    </>)
}