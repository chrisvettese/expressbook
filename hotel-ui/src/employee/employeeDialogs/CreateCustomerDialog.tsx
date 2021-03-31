import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogTitle, TextField, Typography} from "@material-ui/core";
import {openAlert, phoneRegex, sinRegex} from "../../index";

export const CreateCustomerDialog = ({
                                  dialogOpen, setDialogOpen,
                                  classes,
                                  customerSIN, setCustomerSIN,
                                  setAlertMessage,
                                  setAlertStatus,
                                  setAlertOpen,
                                  setCustomerData,
                                  customerName, setCustomerName,
                                  customerAddress, setCustomerAddress,
                                  customerPhone, setCustomerPhone,
                                  customerEmail
                              }: any) => {

    const [nameError, setNameError]: [boolean, any] = useState(false);
    const [addressError, setAddressError]: [boolean, any] = useState(false);
    const [sinError, setSINError]: [boolean, any] = useState(false);
    const [phoneError, setPhoneError]: [boolean, any] = useState(false);

    const [disableCreateCustomer, setDisableCreateCustomer]: [boolean, any] = useState(false);

    async function createCustomer(sin: string, name: string, address: string, email: string,
                                  phoneNumber: string, setDisableCreateCustomer: any, setNameError: any,
                                  setAddressError: any, setSINError: any, setPhoneError: any,
                                  setAlertMessage: any, setAlertStatus: any, setAlertOpen: any,
                                  setCustomerData: any, setDialogOpen: any) {
        const isNameError: boolean = name.length === 0;
        const isAddressError: boolean = address.length === 0;
        const isSINError: boolean = !sinRegex.test(sin);
        const isPhoneError: boolean = !phoneRegex.test(phoneNumber);

        setNameError(isNameError);
        setAddressError(isAddressError);
        setSINError(isSINError);
        setPhoneError(isPhoneError);

        if (isNameError || isAddressError || isSINError || isPhoneError) {
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
                    customer_sin: sin,
                    customer_name: name,
                    customer_address: address,
                    customer_email: customerEmail,
                    customer_phone: phoneNumber
                })
            })
            if (response.status === 201) {
                setCustomerData({
                    customer_sin: sin,
                    customer_name: name,
                    customer_address: address,
                    customer_email: customerEmail,
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

    return <Dialog onClose={() => setDialogOpen(false)} aria-labelledby="simple-dialog-title" open={dialogOpen}>
        <DialogTitle id="dialog-title" className={classes.dialogTitle}>
            <Typography className={classes.dialogTitle}>Create Customer Profile</Typography>
        </DialogTitle>
        <div className={classes.dialogAddress}>
            <Typography align="center" className={classes.dialogGap}>Customer Email: {customerEmail}</Typography>
            <TextField label="Customer Name" variant="outlined" value={customerName} error={nameError}
                       helperText={nameError ? "Must provide name" : ""} className={classes.dialogGap}
                       onChange={event => setCustomerName(event.currentTarget.value)}/>
            <TextField label="Customer Address" variant="outlined" value={customerAddress} error={addressError}
                       helperText={addressError ? "Must provide address" : ""} className={classes.dialogGap}
                       onChange={event => setCustomerAddress(event.currentTarget.value)}/>
            <TextField label="Customer SIN" variant="outlined" value={customerSIN} error={sinError}
                       helperText={sinError ? "Must provide valid SIN" : ""} className={classes.dialogGap}
                       onChange={event => setCustomerSIN(event.currentTarget.value)}/>
            <TextField label="Customer Phone Number" variant="outlined" value={customerPhone} error={phoneError}
                       helperText={phoneError ? "Must provide valid phone number" : ""} className={classes.dialogGap}
                       onChange={event => setCustomerPhone(event.currentTarget.value)}/>
        </div>
        <DialogActions>
            <Button disabled={disableCreateCustomer}
                    onClick={() => createCustomer(customerSIN, customerName, customerAddress, customerEmail, customerPhone,
                        setDisableCreateCustomer, setNameError, setAddressError, setSINError, setPhoneError,
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