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
    TextField,
    getTableRowUtilityClass
} from "@mui/material";
import { Link, useParams, useNavigate } from "react-router-dom";
import ColorPalette from "../Components/ColorPalette";
import Popup from "../Components/Popup";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import axios from "axios";
import dayjs from "dayjs";

export default function SpecificJournal() {
    const addThousandSeparator = (value) => {
        const parts = value.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    const redirect = useNavigate();
    const [popupId, setPopupId] = useState('');
    const [company, setCompany] = useState('');
    const [period, setPeriod] = useState('');
    
    const [rows, setRows] = useState([]);
    const [popup, setPopup] = useState(false);
    const { journal_id } = useParams();

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

    function fetchJournalData() {
        const csrftoken = getCookie('csrftoken');
        axios.get(`/api/journal?id=${journal_id}`, {
            headers:{
                'X-CSRFTOKEN': csrftoken,
                "Content-Type": "multipart/form-data",
            },
        })
        .then(response => {
            setCompany(response.data.company);
            setPeriod(response.data.period);
            console.log(JSON.stringify(response.data.transactions));
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
                                                {/* {rows.map((row) => {
                                                    return (
                                                        <>
                                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                                <TableCell align={"center"}>
                                                                    <Link to={`/transaction/${row.id}`}>
                                                                        {dayjs(row.date).format("DD/MM/YYYY")}
                                                                        <br />
                                                                        {dayjs(row.date).format("HH:mm")}
                                                                    </Link>
                                                                </TableCell>
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
                                                                            </TableCell>
                                                                        );
                                                                    } else if (column.id === 'ref') {
                                                                        return (
                                                                            <TableCell key={`${row.id}-${column.id}`} align={'center'}>
                                                                                {row.lines.map((line, index) => (
                                                                                    <Typography
                                                                                        key={`${row.id}-${column.id}-${index}`}
                                                                                    >
                                                                                        {line.account.ref}
                                                                                    </Typography>
                                                                                ))}
                                                                            </TableCell>
                                                                        );
                                                                    } else if (column.id === 'dr') {
                                                                        return (
                                                                            <>
                                                                                {row.lines.map((line, index)=>(
                                                                                    line.is_debit ?
                                                                                    <TableCell key={`${row.id}-${column.id}-${index}`} align={column.align}>
                                                                                        {addThousandSeparator(line.value)}
                                                                                    </TableCell>
                                                                                    :
                                                                                    <TableCell key={`${row.id}-${column.id}-${index}`} align={column.align}>
                                                                                    </TableCell>
                                                                                ))}
                                                                            </>
                                                                        );
                                                                    } else if (column.id === 'cr') {
                                                                        return (
                                                                            <>
                                                                                {row.lines.map((line, index)=>(
                                                                                    !line.is_debit ?
                                                                                    <TableCell key={`${row.id}-${column.id}-${index}`} align={column.align}>
                                                                                        {addThousandSeparator(line.value)}
                                                                                    </TableCell>
                                                                                    :
                                                                                    <TableCell key={`${row.id}-${column.id}-${index}`} align={column.align}>
                                                                                    </TableCell>
                                                                                ))}
                                                                            </>
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
                                                                        <Button onClick={()=>{handleEdit(row.id)}} sx={{p:0, minWidth:0}}>
                                                                            <EditIcon />
                                                                        </Button>
                                                                        <Button onClick={()=>{handleDeleteClick(row.id)}} sx={{p:0, minWidth:0}}>
                                                                            <DeleteForeverIcon />
                                                                        </Button>
                                                                    </Stack>
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                {columns.map((column) => {
                                                                    if (column.id === 'account') {
                                                                        return (
                                                                            <TableCell key={`${row.id}-${column.id}-extra`} align={column.align}>
                                                                                {row.lines.map((line, index) => (
                                                                                    <Typography
                                                                                        key={`${row.id}-${column.id}-${index}-extra`}
                                                                                        sx={{
                                                                                            marginLeft: line.is_debit ? 0 : "1em",
                                                                                        }}
                                                                                    >
                                                                                        {row.description}
                                                                                    </Typography>
                                                                                ))}
                                                                            </TableCell>
                                                                        );
                                                                    } else if (column.id === 'dr' || column.id === 'cr') {
                                                                        return (
                                                                            <TableCell key={`${row.id}-${column.id}-extra`} align={column.align}>
                                                                            </TableCell>
                                                                        );
                                                                    } else {
                                                                        return (
                                                                            <TableCell key={`${row.id}-${column.id}-extra`} align={column.align}>
                                                                                {column.format && typeof row[column.id] === "number"
                                                                                    ? column.format(row[column.id])
                                                                                    : row[column.id]}
                                                                            </TableCell>
                                                                        );
                                                                    }
                                                                })}
                                                            </TableRow>
                                                        </>
                                                    );
                                                })} */}
{(() => {
    // Sort transactions by date
    const sortedTransactions = rows
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((transaction) => {
            // Sort lines within each transaction by debit/credit and account reference
            return {
                ...transaction,
                lines: transaction.lines.sort((lineA, lineB) => {
                    if (lineA.is_debit !== lineB.is_debit) {
                        return lineB.is_debit - lineA.is_debit; // Debit first
                    }
                    return lineA.account.ref.localeCompare(lineB.account.ref); // Then by account ref
                }),
            };
        });

        return sortedTransactions.reduce((acc, transaction) => {
            const transactionLines = transaction.lines;
        
            if (transactionLines.length === 0) {
                // Handle transactions without lines
                acc.push(
                    <TableRow hover role="checkbox" tabIndex={-1} key={`empty-${transaction.id}`}>
                        <TableCell align="center">
                            <Link to={`/transaction/${transaction.id}`}>
                                {dayjs(transaction.date).format("DD/MM/YYYY")}
                                <br />
                                {dayjs(transaction.date).format("HH:mm")}
                            </Link>
                        </TableCell>
                        <TableCell colSpan={4} align="left">
                            <Typography
                                sx={{
                                    fontWeight: "bold",
                                }}
                            >
                                ({transaction.description})
                            </Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Stack direction="row" justifyContent="center" gap={2}>
                                <Button onClick={() => handleEdit(transaction.id)} sx={{ p: 0, minWidth: 0 }}>
                                    <EditIcon />
                                </Button>
                                <Button onClick={() => handleDeleteClick(transaction.id)} sx={{ p: 0, minWidth: 0 }}>
                                    <DeleteForeverIcon />
                                </Button>
                            </Stack>
                        </TableCell>
                    </TableRow>
                );
                return acc;
            }
        
            // Existing logic for transactions with lines
            transactionLines.forEach((line, index) => {
                acc.push(
                    <TableRow hover role="checkbox" tabIndex={-1} key={`${transaction.id}-${line.id}`}>
                        {index === 0 && (
                            <TableCell align="center" rowSpan={transactionLines.length + 1}>
                                <Link to={`/transaction/${line.transaction}`}>
                                    {dayjs(transaction.date).format("DD/MM/YYYY")}
                                    <br />
                                    {dayjs(transaction.date).format("HH:mm")}
                                </Link>
                            </TableCell>
                        )}
                        <TableCell align="left">
                            <Typography
                                sx={{
                                    marginLeft: line.is_debit ? 0 : "1.5em",
                                }}
                            >
                                {line.account.name}
                            </Typography>
                        </TableCell>
                        <TableCell align="center">{line.account.ref}</TableCell>
                        <TableCell align="right">
                            {line.is_debit ? addThousandSeparator(line.value) : ""}
                        </TableCell>
                        <TableCell align="right">
                            {!line.is_debit ? addThousandSeparator(line.value) : ""}
                        </TableCell>
                        {index === 0 && (
                            <TableCell rowSpan={transactionLines.length + 1} align="center">
                                <Stack direction="row" justifyContent="center" gap={2}>
                                    <Button onClick={() => handleEdit(transaction.id)} sx={{ p: 0, minWidth: 0 }}>
                                        <EditIcon />
                                    </Button>
                                    <Button onClick={() => handleDeleteClick(transaction.id)} sx={{ p: 0, minWidth: 0 }}>
                                        <DeleteForeverIcon />
                                    </Button>
                                </Stack>
                            </TableCell>
                        )}
                    </TableRow>
                );
            });
        
            acc.push(
                <TableRow hover role="checkbox" tabIndex={-1} key={`desc-${transaction.id}`}>
                    <TableCell colSpan={4} align="left">
                        <Typography
                            sx={{
                                fontWeight: "bold",
                            }}
                        >
                            ({transaction.description})
                        </Typography>
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                </TableRow>
            );
        
            return acc;
        }, []);        
})()}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
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