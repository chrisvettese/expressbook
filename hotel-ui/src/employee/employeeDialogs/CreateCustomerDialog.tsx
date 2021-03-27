import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogTitle, TextField, Typography} from "@material-ui/core";

export const CreateCustomerDialog = ({
                                  dialogOpen, setDialogOpen,
                                  classes,
                                  customerSIN,
                                  setAlertMessage,
                                  setAlertStatus,
                                  setAlertOpen,
                                  setCustomerData,
                                  customerName, setCustomerName,
                                  customerAddress, setCustomerAddress,
                                  customerPhone, setCustomerPhone,
                                  customerEmail, setCustomerEmail
                              }: any) => {

    const [nameError, setNameError]: [boolean, any] = useState(false);
    const [addressError, setAddressError]: [boolean, any] = useState(false);
    const [emailError, setEmailError]: [boolean, any] = useState(false);
    const [phoneError, setPhoneError]: [boolean, any] = useState(false);

    const [disableCreateCustomer, setDisableCreateCustomer]: [boolean, any] = useState(false);

    async function createCustomer(customerSIN: string, name: string, address: string, email: string,
                                  phoneNumber: string, setDisableCreateCustomer: any, setNameError: any,
                                  setAddressError: any, setEmailError: any, setPhoneError: any,
                                  setAlertMessage: any, setAlertStatus: any, setAlertOpen: any,
                                  setCustomerData: any, setDialogOpen: any) {
        const isNameError: boolean = name.length === 0;
        const isAddressError: boolean = address.length === 0;
        let isEmailError: boolean = email.includes(' ') || email.indexOf('@') < 1
        if (!isEmailError) {
            const index: number = email.indexOf('.', email.indexOf('@'))
            if (index < 3 || index === email.length - 1) {
                isEmailError = true;
            }
        }
        const isPhoneError: boolean = !(/^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/).test(phoneNumber);

        setNameError(isNameError);
        setAddressError(isAddressError);
        setEmailError(isEmailError);
        setPhoneError(isPhoneError);

        if (isNameError || isAddressError || isEmailError || isPhoneError) {
            return;
        }

        setDisableCreateCustomer(true);

        try {
            let response = await fetch(process.env.REACT_APP_SERVER_URL + "/customers", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customer_sin: customerSIN,
                    customer_name: name,
                    customer_address: address,
                    customer_email: email,
                    customer_phone: phoneNumber
                })
            })
            if (response.status === 201) {
                setCustomerData({
                    customer_sin: customerSIN,
                    customer_name: name,
                    customer_address: address,
                    customer_email: email,
                    customer_phone: phoneNumber
                });
                openAlert('Successfully created customer profile', 'success', setAlertMessage, setAlertStatus, setAlertOpen);
                setDialogOpen(false);
            } else {
                openAlert('Error: Unable to created customer profile', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
            }
        } catch (error) {
            console.error('Error:', error);
            openAlert('Error: Unable to created customer profile', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
        }
        setDisableCreateCustomer(false);
    }

    function openAlert(message: string, status: string, setAlertMessage: any, setAlertStatus: any, setAlertOpen: any) {
        setAlertMessage(message);
        setAlertStatus(status);
        setAlertOpen(true);
    }

    return <Dialog onClose={() => setDialogOpen(false)} aria-labelledby="simple-dialog-title" open={dialogOpen}>
        <DialogTitle id="dialog-title" className={classes.dialogTitle}>
            <Typography className={classes.dialogTitle}>Create Customer Profile</Typography>
        </DialogTitle>
        <div className={classes.dialogAddress}>
            <Typography align="center">Customer SIN: {customerSIN}</Typography>
            <br/>
            <TextField label="Customer Name" variant="outlined" value={customerName} error={nameError}
                       helperText={nameError ? "Must provide name" : ""}
                       onChange={event => setCustomerName(event.currentTarget.value)}/>
            <br/>
            <TextField label="Customer Address" variant="outlined" value={customerAddress} error={addressError}
                       helperText={addressError ? "Must provide address" : ""}
                       onChange={event => setCustomerAddress(event.currentTarget.value)}/>
            <br/>
            <TextField label="Customer Email" variant="outlined" value={customerEmail} error={emailError}
                       helperText={emailError ? "Must provide valid email" : ""}
                       onChange={event => setCustomerEmail(event.currentTarget.value)}/>
            <br/>
            <TextField label="Customer Phone Number" variant="outlined" value={customerPhone} error={phoneError}
                       helperText={phoneError ? "Must provide valid phone number" : ""}
                       onChange={event => setCustomerPhone(event.currentTarget.value)}/>
            <br/>
        </div>
        <DialogActions>
            <Button disabled={disableCreateCustomer}
                    onClick={() => createCustomer(customerSIN, customerName, customerAddress, customerEmail, customerPhone,
                        setDisableCreateCustomer, setNameError, setAddressError, setEmailError, setPhoneError,
                        setAlertMessage, setAlertStatus, setAlertOpen, setCustomerData, setDialogOpen)}
                    variant="contained"
                    color="primary">
                Create Profile
            </Button>
            <Button onClick={() => {
                setDialogOpen(false);
            }} variant="contained" color="secondary">
                Cancel
            </Button>
        </DialogActions>
    </Dialog>
};