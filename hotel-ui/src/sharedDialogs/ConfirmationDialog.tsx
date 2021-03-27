import {Button, Dialog, DialogActions, DialogTitle, Divider, Typography} from "@material-ui/core";
import React from "react";

export const ConfirmationDialog = ({
                                dialogOpen,
                                setDialogOpen,
                                roomToBook,
                                classes,
                                location,
                                checkInDateToBook,
                                checkOutDateToBook,
                                disableBookRoomButton,
                                bookRoom
                            }: any) => {

    function EmployeeInfo() {
        if (location.state.employeeName !== undefined) {
            return (
                <>
                    <Divider/>
                    <Typography align="center" className={classes.dialogHeader}>Employee Info</Typography>
                    <Divider/>
                    <div className={classes.dialogDiv}>
                        <Typography>{location.state.employeeName}</Typography>
                        <Typography>{location.state.jobTitle}</Typography>
                    </div>
                    <br/>
                </>
            )
        }
        return <></>
    }

    return <Dialog onClose={() => setDialogOpen(false)} aria-labelledby="simple-dialog-title" open={dialogOpen}>
        <DialogTitle id="dialog-title" className={classes.dialogTitle}>
            <Typography className={classes.dialogTitle}>Confirm Room Booking</Typography>
        </DialogTitle>
        <div className={classes.dialogAddress}>
            <Typography align="center">{location.state.address}</Typography>
        </div>
        <br/>
        <EmployeeInfo/>
        <Divider/>
        <Typography align="center" className={classes.dialogHeader}>Customer Info</Typography>
        <Divider/>
        <div className={classes.dialogDiv}>
            <Typography>{location.state.customerName}</Typography>
            <Typography>{location.state.customerAddress}</Typography>
            <Typography>{location.state.customerEmail}</Typography>
            <Typography>{location.state.customerPhone}</Typography>
        </div>
        <br/>
        <Divider/>
        <Typography align="center" className={classes.dialogHeader}>Room Details</Typography>
        <Divider/>
        <div className={classes.dialogDiv}>
            <Typography>Room type: {roomToBook.title}</Typography>
            <Typography>{checkInDateToBook} to {checkOutDateToBook}</Typography>
            <Typography>Amenities: {roomToBook.amenities.join(', ')}</Typography>
            <Typography>View: {roomToBook.view}</Typography>
            <Typography>
                Extendable: {roomToBook.is_extendable ? "Yes" : "No"}
            </Typography>
        </div>
        <br/>
        <DialogActions>
            <Button disabled={disableBookRoomButton} onClick={() => bookRoom(roomToBook.type_id)} variant="contained"
                    color="primary">
                Book Room
            </Button>
            <Button onClick={() => setDialogOpen(false)} variant="contained" color="secondary">
                Cancel
            </Button>
        </DialogActions>
    </Dialog>
};