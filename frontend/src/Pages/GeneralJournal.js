import React from "react";
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

const columns = [
    { id: 'id', label: 'ID', minWidth: 170 },
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

function createData(id, company, period, balance) {
    return { id, company, period, balance };
}

const rows = [
    createData("India-IN", 'India', 'IN', 1324171354),
    createData("India-IN", 'China', 'CN', 1403500365),
    createData("India-IN", 'Italy', 'IT', 60483973),
    createData("India-IN", 'United States', 'US', 327167434),
    createData("India-IN", 'Canada', 'CA', 37602103),
    createData("India-IN", 'Australia', 'AU', 25475400),
    createData("India-IN", 'Germany', 'DE', 83019200),
    createData("India-IN", 'Ireland', 'IE', 485700),
    createData("India-IN", 'Mexico', 'MX', 126577691),
    createData("India-IN", 'Japan', 'JP', 126317000),
    createData("India-IN", 'France', 'FR', 67022000),
    createData("India-IN", 'United Kingdom', 'GB', 67545757),
    createData("India-IN", 'Russia', 'RU', 146793744),
    createData("India-IN", 'Nigeria', 'NG', 200962417),
    createData("India-IN", 'Brazil', 'BR', 210147125),
];

export default function GeneralJournal() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [popup, setPopup] = useState(false);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    function handleDelete(e) {
        // TODO: Make delete function.
    }
    function handleEdit() {

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
                                <Popup trigger={popup} setTrigger={setPopup} title="Are you sure you want to delete this journal?">
                                    <Stack>
                                        <Typography>This action cannot be undone.</Typography>
                                    </Stack>
                                    <Stack>
                                        <Button variant={"outlined"} sx={{ display: "block", alignSelf: "end" }} onClick={handleDelete}>Delete</Button>
                                    </Stack>
                                </Popup>
                            </Stack>
                        </Stack>
                        <Stack>
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
                        </Stack>
                    </Stack>
                </Container>
            </ColorPalette>
        </>
    )
}