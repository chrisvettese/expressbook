import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogTitle, TextField, Typography} from "@material-ui/core";
import {openAlert} from "../../index";

export const EditEmployeeProfileDialog = ({
                                              dialogOpen, setDialogOpen,
                                              classes,
                                              employeeSIN, hotelID,
                                              setAlertMessage,
                                              setAlertStatus,
                                              setAlertOpen,
                                              employeeName, setEmployeeName,
                                              employeeAddress, setEmployeeAddress,
                                          }: any) => {

    const [nameError, setNameError]: [boolean, any] = useState(false);
    const [addressError, setAddressError]: [boolean, any] = useState(false);

    const [name, setName]: [string, any] = useState(employeeName);
    const [address, setAddress]: [string, any] = useState(employeeAddress);

    const [disableSave, setDisableSave]: [boolean, any] = useState(false);

    async function updateEmployee() {
        setDisableSave(true);

        const isNameError: boolean = name.length === 0;
        const isAddressError: boolean = address.length === 0;

        setNameError(isNameError);
        setAddressError(isAddressError);

        if (isNameError || isAddressError) {
            setDisableSave(false);
            return;
        }

        try {
            let response = await fetch(process.env.REACT_APP_SERVER_URL + "/hotels/" + hotelID + "/employees/" + employeeSIN, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    employee_name: name,
                    employee_address: address,
                })
            })
            if (response.status === 204) {
                setEmployeeAddress(address);
                setEmployeeName(name);
                openAlert('Profile updated', 'success', setAlertMessage, setAlertStatus, setAlertOpen);
                setDialogOpen(false);
            } else {
                openAlert('Error: Unable to update profile', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
            }
        } catch (error) {
            console.error('Error:', error);
            openAlert('Error: Unable to update profile', 'error', setAlertMessage, setAlertStatus, setAlertOpen)
        }
        setDisableSave(false);
    }

    function closeDialog() {
        setDialogOpen(false);
        setName(employeeName);
        setAddress(employeeAddress);
        setNameError(false);
        setAddressError(false);
    }

    return (
        <Dialog onClose={() => closeDialog()} aria-labelledby="simple-dialog-title" open={dialogOpen}>
            <DialogTitle id="dialog-title" className={classes.dialogTitle}>
                <Typography className={classes.dialogTitle}>Edit Profile</Typography>
            </DialogTitle>
            <div className={classes.dialogAddress}>
                <Typography align="center" className={classes.dialogGap}>Employee SIN: {employeeSIN}</Typography>
                <TextField label="Name" variant="outlined" value={name} error={nameError}
                           helperText={nameError ? "Must provide name" : ""} className={classes.dialogGap}
                           onChange={event => setName(event.currentTarget.value)}/>
                <TextField label="Address" variant="outlined" value={address} error={addressError}
                           helperText={addressError ? "Must provide address" : ""} className={classes.dialogGap}
                           onChange={event => setAddress(event.currentTarget.value)}/>
            </div>
            <DialogActions>
                <Button disabled={disableSave}
                        onClick={() => updateEmployee()}
                        variant="contained"
                        color="primary">
                    Save Changes
                </Button>
                <Button onClick={() => closeDialog()} variant="contained" color="secondary">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
};