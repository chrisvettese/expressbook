import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogTitle, TextField, Typography} from "@material-ui/core";

export const EditCustomerProfileDialog = ({
                                              dialogOpen, setDialogOpen,
                                              classes,
                                              customerSIN,
                                              setAlertMessage,
                                              setAlertStatus,
                                              setAlertOpen,
                                              customerName, setCustomerName,
                                              customerAddress, setCustomerAddress,
                                              customerPhone, setCustomerPhone,
                                              customerEmail, setCustomerEmail
                                          }: any) => {

    const [nameError, setNameError]: [boolean, any] = useState(false);
    const [addressError, setAddressError]: [boolean, any] = useState(false);
    const [emailError, setEmailError]: [boolean, any] = useState(false);
    const [phoneError, setPhoneError]: [boolean, any] = useState(false);

    const [disableSave, setDisableSave]: [boolean, any] = useState(false);

    function updateCustomer() {
        setDisableSave(true);
        setDisableSave(false);
    }

    return (
        <Dialog onClose={() => setDialogOpen(false)} aria-labelledby="simple-dialog-title" open={dialogOpen}>
            <DialogTitle id="dialog-title" className={classes.dialogTitle}>
                <Typography className={classes.dialogTitle}>Edit Profile</Typography>
            </DialogTitle>
            <div className={classes.dialogAddress}>
                <Typography align="center">Customer SIN: {customerSIN}</Typography>
                <br/>
                <TextField label="Name" variant="outlined" value={customerName} error={nameError}
                           helperText={nameError ? "Must provide name" : ""}
                           onChange={event => setCustomerName(event.currentTarget.value)}/>
                <br/>
                <TextField label="Address" variant="outlined" value={customerAddress} error={addressError}
                           helperText={addressError ? "Must provide address" : ""}
                           onChange={event => setCustomerAddress(event.currentTarget.value)}/>
                <br/>
                <TextField label="Email" variant="outlined" value={customerEmail} error={emailError}
                           helperText={emailError ? "Must provide valid email" : ""}
                           onChange={event => setCustomerEmail(event.currentTarget.value)}/>
                <br/>
                <TextField label="Phone Number" variant="outlined" value={customerPhone} error={phoneError}
                           helperText={phoneError ? "Must provide valid phone number" : ""}
                           onChange={event => setCustomerPhone(event.currentTarget.value)}/>
                <br/>
            </div>
            <DialogActions>
                <Button disabled={disableSave}
                        onClick={() => updateCustomer()}
                        variant="contained"
                        color="primary">
                    Save Changes
                </Button>
                <Button onClick={() => {
                    setDialogOpen(false);
                }} variant="contained" color="secondary">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
};