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
} from "@mui/material";
import { Link } from "react-router-dom";
import ColorPalette from "../Components/ColorPalette";
import Popup from "../Components/Popup";

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

export default function GeneralJournal() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
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
                            <Typography variant="h4">Add Journal</Typography>
                            <Stack sx={{ display: "block", alignSelf: "end" }}>
                                <Popup />

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
                </Container>
            </ColorPalette>
        </>
    )
}