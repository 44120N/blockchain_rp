import React from "react";
import PropTypes from "prop-types";
import ColorPalette from "../Components/ColorPalette";
import { Link } from "react-router-dom";
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
    Divider,
    Stack,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

function createData(company, period, balance, link, journal) {
    return {
        company,
        period,
        balance,
        link,
        // Max 3 items
        journal: journal,
    };
}

function Row(props) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? (
                            <KeyboardArrowUpIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.company}
                </TableCell>
                <TableCell>{row.period}</TableCell>
                <TableCell align="right">{row.balance}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={6}
                >
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                component="div"
                            >
                                Journal
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="center">
                                            No. Bukti
                                        </TableCell>
                                        <TableCell align="center">
                                            Account
                                        </TableCell>
                                        <TableCell align="center">
                                            Reff
                                        </TableCell>
                                        <TableCell align="center">
                                            Debit
                                        </TableCell>
                                        <TableCell align="center">
                                            Credit
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.journal.map((journalRow) => (
                                        <TableRow key={journalRow.date}>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {journalRow.date}
                                            </TableCell>
                                            <TableCell align="center">
                                                {journalRow.customerId}
                                            </TableCell>
                                            <TableCell align="center">
                                                {journalRow.account}
                                            </TableCell>
                                            <TableCell align="center">
                                                {journalRow.reff}
                                            </TableCell>
                                            <TableCell align="center">
                                                {journalRow.debit}
                                            </TableCell>
                                            <TableCell align="center">
                                                {journalRow.credit}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={7} align="right">
                                            <Link to={props.link}>More</Link>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

Row.propTypes = {
    row: PropTypes.shape({
        period: PropTypes.number.isRequired,
        balance: PropTypes.number.isRequired,
        link: PropTypes.string.isRequired,
        journal: PropTypes.arrayOf(
            PropTypes.shape({
                account: PropTypes.string.isRequired,
                date: PropTypes.string.isRequired,
                debit: PropTypes.number.isRequired,
                credit: PropTypes.number.isRequired,
            })
        ).isRequired,
        company: PropTypes.string.isRequired,
    }).isRequired,
};

const rows = [
    // FORMAT: createData(company, period, balance, link, journal) btw "link" is for the details... also journal = array of object
    createData("Frozen yoghurt", 159, 6.0, "/home", [
        {
            date: "2020-01-05",
            customerId: "11091700",
            account: "Aaron",
            reff: 101,
            debit: 0,
            credit: 0,
        },
        {
            date: "2020-01-02",
            customerId: "Anonymous",
            account: "Harun",
            reff: 202,
            debit: 0,
            credit: 0,
        },
        {
            date: "2020-01-09",
            customerId: "Anonymous",
            account: "Barun",
            reff: 999,
            debit: 0,
            credit: 0,
        },
    ]),
    createData("Ice cream sandwich", 237, 9.0, "/home", [
        {
            date: "2020-01-05",
            customerId: "11091700",
            account: "Aaron",
            reff: 101,
            debit: 0,
            credit: 0,
        },
        {
            date: "2020-01-02",
            customerId: "Anonymous",
            account: "Harun",
            reff: 202,
            debit: 0,
            credit: 0,
        },
        {
            date: "2020-01-09",
            customerId: "Anonymous",
            account: "Barun",
            reff: 999,
            debit: 0,
            credit: 0,
        },
    ]),
    createData("Eclair", 262, 16.0, "/home", [
        {
            date: "2020-01-05",
            customerId: "11091700",
            account: "Aaron",
            reff: 101,
            debit: 0,
            credit: 0,
        },
        {
            date: "2020-01-02",
            customerId: "Anonymous",
            account: "Harun",
            reff: 202,
            debit: 0,
            credit: 0,
        },
        {
            date: "2020-01-09",
            customerId: "Anonymous",
            account: "Barun",
            reff: 999,
            debit: 0,
            credit: 0,
        },
    ]),
    createData("Cupcake", 305, 3.7, "/home", [
        {
            date: "2020-01-05",
            customerId: "11091700",
            account: "Aaron",
            reff: 101,
            debit: 0,
            credit: 0,
        },
        {
            date: "2020-01-02",
            customerId: "Anonymous",
            account: "Harun",
            reff: 202,
            debit: 0,
            credit: 0,
        },
        {
            date: "2020-01-09",
            customerId: "Anonymous",
            account: "Barun",
            reff: 999,
            debit: 0,
            credit: 0,
        },
    ]),
    createData("Gingerbread", 356, 16.0, "/home", [
        {
            date: "2020-01-05",
            customerId: "11091700",
            account: "Aaron",
            reff: 101,
            debit: 0,
            credit: 0,
        },
        {
            date: "2020-01-02",
            customerId: "Anonymous",
            account: "Harun",
            reff: 202,
            debit: 0,
            credit: 0,
        },
        {
            date: "2020-01-09",
            customerId: "Anonymous",
            account: "Barun",
            reff: 999,
            debit: 0,
            credit: 0,
        },
    ]),
];

export default function Home() {
    return (
        <ColorPalette>
            <Container fixed sx={{ marginY: "3%" }}>
                <Stack gap={5}>
                    <Stack>
                        <Typography variant="h1" color="primary">
                            Hello, World!
                        </Typography>
                        <Typography variant="h2" color="navy">
                            Lorem Ipsum
                        </Typography>
                        <Divider
                            sx={{
                                borderWidth: ".3vh",
                                width: "100%",
                            }}
                        />
                    </Stack>

                    <Stack>
                        <Paper sx={{ width: "100%" }}>
                            <TableContainer
                                component={Paper}
                                sx={{
                                    "& th, td": {
                                        border: "1px solid black",
                                    },
                                }}
                            >
                                <Table aria-label="collapsible table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell>Company</TableCell>
                                            <TableCell>Period</TableCell>
                                            <TableCell align="right">
                                                Balance
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row) => (
                                            <Row
                                                key={row.company}
                                                row={row}
                                                link={row.link}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Stack>
                </Stack>
            </Container>
        </ColorPalette>
    );
}
