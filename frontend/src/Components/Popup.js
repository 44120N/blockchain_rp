import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function Popup(props) {
    return (
        <BootstrapDialog open={props.trigger} fullWidth maxWidth={"sm"}>
            <DialogTitle sx={{ m: 0, p: 2 }}>
                {props.title}
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={() => props.setTrigger(false)}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent dividers>
                {props.children}
            </DialogContent>
        </BootstrapDialog>
    )
}