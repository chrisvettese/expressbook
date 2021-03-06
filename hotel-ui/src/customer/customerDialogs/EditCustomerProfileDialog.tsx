import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogTitle, TextField, Typography} from "@material-ui/core";
import {openAlert, phoneRegex, REACT_APP_SERVER_URL} from "../../index";

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

    const [name, setName]: [string, any] = useState(customerName);
    const [address, setAddress]: [string, any] = useState(customerAddress);
    const [phone, setPhone]: [string, any] = useState(customerPhone);
    const [email, setEmail]: [string, any] = useState(customerEmail);

    const [emailHelper, setEmailHelper]: [string, any] = useState('');

    const [disableSave, setDisableSave]: [boolean, any] = useState(false);

    async function updateCustomer() {
        setDisableSave(true);

        const isNameError: boolean = name.length === 0;
        const isAddressError: boolean = address.length === 0;
        let isEmailError: boolean = email.includes(' ') || email.indexOf('@') < 1
        if (!isEmailError) {
            const index: number = email.indexOf('.', email.indexOf('@'))
            if (index < 3 || index === email.length - 1) {
                isEmailError = true;
            }
        }
        const isPhoneError: boolean = !(phoneRegex).test(phone);

        setNameError(isNameError);
        setAddressError(isAddressError);
        setEmailError(isEmailError);
        setPhoneError(isPhoneError);

        if (isEmailError) {
            setEmailHelper('Must provide valid email');
        } else {
            setEmailHelper('');
        }

        if (isNameError || isAddressError || isEmailError || isPhoneError) {
            setDisableSave(false);
            return;
        }

        try {
            let response = await fetch(REACT_APP_SERVER_URL + "/customers/" + customerSIN, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customer_name: name,
                    customer_address: address,
                    customer_email: email,
                    customer_phone: phone
                })
            })
            if (response.status === 204) {
                setCustomerPhone(phone);
                setCustomerEmail(email);
                setCustomerAddress(address);
                setCustomerName(name);
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
        setName(customerName);
        setEmail(customerEmail);
        setAddress(customerAddress);
        setPhone(customerPhone);
        setNameError(false);
        setPhoneError(false);
        setAddressError(false);
        setEmailError(false);
    }

    function keyPressed(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter') {
            updateCustomer().then(_ => {
            });
        }
    }

    return (
        <Dialog onClose={() => closeDialog()} aria-labelledby="simple-dialog-title" open={dialogOpen}>
            <DialogTitle id="dialog-title" className={classes.dialogTitle}>
                <Typography className={classes.dialogTitle}>Edit Profile</Typography>
            </DialogTitle>
            <div className={classes.dialogAddress}>
                <Typography align="center" className={classes.dialogGap}>Customer SIN: {customerSIN}</Typography>
                <TextField label="Name" variant="outlined" value={name} error={nameError}
                           helperText={nameError ? "Must provide name" : ""} className={classes.dialogGap}
                           onKeyPress={e => keyPressed(e)}
                           onChange={event => setName(event.currentTarget.value)}/>
                <TextField label="Address" variant="outlined" value={address} error={addressError}
                           helperText={addressError ? "Must provide address" : ""} className={classes.dialogGap}
                           onKeyPress={e => keyPressed(e)}
                           onChange={event => setAddress(event.currentTarget.value)}/>
                <TextField label="Email" variant="outlined" value={email} error={emailError}
                           helperText={emailHelper} className={classes.dialogGap}
                           onKeyPress={e => keyPressed(e)}
                           onChange={event => setEmail(event.currentTarget.value)}/>
                <TextField label="Phone Number" variant="outlined" value={phone} error={phoneError}
                           helperText={phoneError ? "Must provide valid phone number" : ""}
                           className={classes.dialogGap}
                           onKeyPress={e => keyPressed(e)}
                           onChange={event => setPhone(event.currentTarget.value)}/>
            </div>
            <DialogActions>
                <Button disabled={disableSave}
                        onClick={() => updateCustomer()}
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