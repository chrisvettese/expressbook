import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogTitle, TextField, Typography} from "@material-ui/core";
import {openAlert, REACT_APP_SERVER_URL} from "../../index";

export const EditEmployeeProfileDialog = ({
                                              dialogOpen, setDialogOpen,
                                              classes,
                                              employeeSIN, hotelID,
                                              setAlertMessage,
                                              setAlertStatus,
                                              setAlertOpen,
                                              employeeName, setEmployeeName,
                                              employeeAddress, setEmployeeAddress,
                                              employeeEmail, setEmployeeEmail
                                          }: any) => {

    const [nameError, setNameError]: [boolean, any] = useState(false);
    const [emailError, setEmailError]: [boolean, any] = useState(false);
    const [addressError, setAddressError]: [boolean, any] = useState(false);

    const [name, setName]: [string, any] = useState(employeeName);
    const [email, setEmail]: [string, any] = useState(employeeEmail);
    const [address, setAddress]: [string, any] = useState(employeeAddress);

    const [emailHelper, setEmailHelper]: [string, any] = useState('');
    const [disableSave, setDisableSave]: [boolean, any] = useState(false);

    function keyPressed(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter') {
            updateEmployee();
        }
    }

    async function updateEmployee() {
        setDisableSave(true);

        const isNameError: boolean = name.length === 0;
        let isEmailError: boolean = email.includes(' ') || email.indexOf('@') < 1
        if (!isEmailError) {
            const index: number = email.indexOf('.', email.indexOf('@'))
            if (index < 3 || index === email.length - 1) {
                isEmailError = true;
            }
        }
        const isAddressError: boolean = address.length === 0;

        setNameError(isNameError);
        setEmailError(isEmailError);
        setAddressError(isAddressError);

        if (isEmailError) {
            setEmailHelper('Must provide valid email');
        } else {
            setEmailHelper('');
        }

        if (isNameError || isAddressError || isEmailError) {
            setDisableSave(false);
            return;
        }

        try {
            let response = await fetch(REACT_APP_SERVER_URL + "/hotels/" + hotelID + "/employees/" + employeeSIN, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    employee_name: name,
                    employee_email: email,
                    employee_address: address,
                })
            })
            if (response.status === 204) {
                setEmployeeAddress(address);
                setEmployeeEmail(email);
                setEmployeeName(name);
                openAlert('Profile updated', 'success', setAlertMessage, setAlertStatus, setAlertOpen);
                setDialogOpen(false);
            } else if (response.status === 409) {
                setEmailHelper('An account with this email address already exists');
                setEmailError(true);
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
        setEmail(employeeEmail);
        setNameError(false);
        setAddressError(false);
        setEmailHelper('');
    }

    return (
        <Dialog onClose={() => closeDialog()} aria-labelledby="simple-dialog-title" open={dialogOpen}>
            <DialogTitle id="dialog-title" className={classes.dialogTitle}>
                <Typography className={classes.dialogTitle}>Edit Profile</Typography>
            </DialogTitle>
            <div className={classes.dialogAddress}>
                <Typography align="center" className={classes.dialogGap}>Employee SIN: {employeeSIN}</Typography>
                <TextField label="Name" variant="outlined" value={name} error={nameError}
                           onKeyPress={e => keyPressed(e)}
                           helperText={nameError ? "Must provide name" : ""} className={classes.dialogGap}
                           onChange={event => setName(event.currentTarget.value)}/>
                <TextField label="Email" variant="outlined" value={email} error={emailError}
                           onKeyPress={e => keyPressed(e)}
                           helperText={emailHelper} className={classes.dialogGap}
                           onChange={event => setEmail(event.currentTarget.value)}/>
                <TextField label="Address" variant="outlined" value={address} error={addressError}
                           onKeyPress={e => keyPressed(e)}
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