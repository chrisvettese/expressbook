import React, {useState} from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle, FormControl, FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import {openAlert, REACT_APP_SERVER_URL} from "../../index";
import {provinces} from "../Provinces";
import {KeyboardDatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import {ReservationAndButton} from "../CheckCustomer";

interface GetPayment {
    dialogOpen: boolean;
    setDialogOpen: any;
    classes: any;
    setAlertMessage: any;
    setAlertStatus: any;
    setAlertOpen: any;
    reservations: ReservationAndButton[]
    setReservations: any;
    index: number;
    employeeSIN: string;
}

export const GetPaymentDialog = ({
                                     dialogOpen, setDialogOpen,
                                     classes,
                                     setAlertMessage, setAlertStatus, setAlertOpen,
                                     reservations, setReservations,
                                     index,
                                     employeeSIN
                                 }: GetPayment) => {

    const [creditCard, setCreditCard]: [string, any] = useState('');
    const [cvv, setCVV]: [string, any] = useState('');
    const [expiry, setExpiry]: [string, any] = useState(new Date().toDateString() + ' ' + new Date().toTimeString());
    const [name, setName]: [string, any] = useState('');
    const [address, setAddress]: [string, any] = useState('');
    const [city, setCity]: [string, any] = useState('');
    const [postalCode, setPostalCode]: [string, any] = useState('');
    const [province, setProvince]: [string, any] = useState('None');

    const [creditCardError, setCreditCardError]: [boolean, any] = useState(false);
    const [cvvError, setCVVError]: [boolean, any] = useState(false);
    const [expiryError, setExpiryError]: [boolean, any] = useState(false);
    const [nameError, setNameError]: [boolean, any] = useState(false);
    const [addressError, setAddressError]: [boolean, any] = useState(false);
    const [cityError, setCityError]: [boolean, any] = useState(false);
    const [postalCodeError, setPostalCodeError]: [boolean, any] = useState(false);
    const [provinceError, setProvinceError]: [boolean, any] = useState(false);

    const [triedSubmit, setTriedSubmit]: [boolean, any] = useState(false);

    if (index === -1 || index >= reservations.length) {
        return <></>
    }

    //Create min date based on current month and year
    let minDate: Date = new Date();
    const minMonth: number = minDate.getMonth();
    const minYear: number = minDate.getFullYear();
    minDate = new Date(minYear, minMonth)

    const provinceList: string[] = provinces.split('\n');

    async function completeCheckIn() {
        setTriedSubmit(true);

        const isCreditCardError = !/^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/
            .test(creditCard.replace('-', '').replace(' ', ''));
        const isCvvError = !/\d{3}/.test(cvv);
        let isExpiryError = true;

        if (expiry !== undefined && expiry !== null && expiry.toString().length > 0 && expiry !== 'Invalid Date') {
            const expiryDate: Date = new Date(expiry);
            const month: number = expiryDate.getMonth();
            const year: number = expiryDate.getFullYear();
            const currentDate: Date = new Date();
            const currentMonth: number = currentDate.getMonth();
            const currentYear: number = currentDate.getFullYear();
            if (year > currentYear || (year === currentYear && month >= currentMonth)) {
                isExpiryError = false;
            }
        }
        const isNameError = name.length === 0;
        const isAddressError = address.length === 0;
        const isCityError = city.length === 0;
        //Test postal code and zip code
        const isPostalCodeError = !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postalCode) && !/^\d{5}(?:[-\s]\d{4})?$/.test(postalCode);
        const isProvinceError = province === 'None';

        setCreditCardError(isCreditCardError);
        setCVVError(isCvvError);
        setExpiryError(isExpiryError);
        setNameError(isNameError);
        setAddressError(isAddressError);
        setCityError(isCityError);
        setPostalCodeError(isPostalCodeError);
        setProvinceError(isProvinceError);

        if (isCreditCardError || isNameError || isAddressError || isCityError || isPostalCodeError || isProvinceError) {
            setTriedSubmit(false);
            return;
        }

        const reservation = reservations[index].reservation;
        try {
            let response = await fetch(REACT_APP_SERVER_URL + "/customers/" + reservation.customer_sin + "/reservations/" + reservation.booking_id, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'Renting',
                    employee_sin: employeeSIN
                })
            })
            if (response.status === 204) {
                openAlert('Successfully checked in customer', 'success', setAlertMessage, setAlertStatus, setAlertOpen);
                const newReservations: ReservationAndButton[] = [...reservations];
                newReservations.splice(index, 1);
                setReservations(newReservations);
                closeDialog();
                return;
            } else {
                openAlert('Error: Unable to check in customer', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
            }
        } catch (error) {
            console.error('Error:', error);
            openAlert('Error: Unable to check in customer', 'error', setAlertMessage, setAlertStatus, setAlertOpen)
        }
        setTriedSubmit(false);
    }

    function closeDialog() {
        setDialogOpen(false);
        setTriedSubmit(false);

        setCreditCardError(false);
        setCVVError(false);
        setExpiryError(false);
        setNameError(false);
        setAddressError(false);
        setCityError(false);
        setPostalCodeError(false);
        setProvinceError(false);
        setCreditCard('');
        setCVV('');
        setExpiry(new Date().toDateString() + ' ' + new Date().toTimeString());
        setName('');
        setAddress('');
        setCity('');
        setPostalCode('');
        setProvince('None');
    }

    return <Dialog onClose={() => closeDialog()} aria-labelledby="simple-dialog-title" open={dialogOpen}>
        <DialogTitle id="dialog-title" className={classes.dialogTitle}>
            <Typography className={classes.dialogTitle}>Customer Payment Info</Typography>
        </DialogTitle>
        <div className={classes.dialogAddress}>
            <Typography style={{
                fontSize: '1.2em',
                marginBottom: '1em'
            }}>For {reservations[index].reservation.customer_name}</Typography>
            <div>
                <TextField label="Credit Card Number" variant="outlined" value={creditCard} error={creditCardError}
                           helperText={creditCardError ? "Must provide valid credit card number" : ""}
                           className={classes.dialogGap}
                           onChange={event => setCreditCard(event.currentTarget.value)}/>
                <TextField label="CVV" variant="outlined" value={cvv} error={cvvError}
                           helperText={cvvError ? "Must provide CVV" : ""} className={classes.dialogGap}
                           onChange={event => setCVV(event.currentTarget.value)}/>
            </div>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                    inputVariant="outlined"
                    margin="normal"
                    views={["year", "month"]}
                    className={classes.dialogGap}
                    id="expiry-dialog"
                    label="Card Expiry"
                    format="MM/yy"
                    minDate={minDate}
                    value={expiry}
                    error={expiryError}
                    onError={(error, value) => {
                        const noValue: boolean = typeof value === 'string' && value.length === 0
                        const noError: boolean = error === undefined || (typeof error === 'string' && error.length === 0)
                        setExpiryError(!noError || (triedSubmit && noValue))
                    }}
                    onChange={(date: MaterialUiPickersDate) => setExpiry(date)}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                />
            </MuiPickersUtilsProvider>
            <div>
                <TextField label="Cardholder Name" variant="outlined" value={name} error={nameError}
                           helperText={nameError ? "Must provide cardholder name" : ""}
                           className={classes.dialogGap}
                           onChange={event => setName(event.currentTarget.value)}/>
                <TextField label="Billing Address" variant="outlined" value={address} error={addressError}
                           helperText={addressError ? "Must provide address" : ""}
                           className={classes.dialogGap}
                           onChange={event => setAddress(event.currentTarget.value)}/>
            </div>
            <div>
                <TextField label="City" variant="outlined" value={city} error={cityError}
                           helperText={cityError ? "Must provide city" : ""}
                           className={classes.dialogGap}
                           onChange={event => setCity(event.currentTarget.value)}/>
                <TextField label="Postal / Zip code" variant="outlined" value={postalCode} error={postalCodeError}
                           helperText={postalCodeError ? "Must provide postal or zip code" : ""}
                           className={classes.dialogGap}
                           onChange={event => setPostalCode(event.currentTarget.value)}/>
            </div>
            <FormControl variant="outlined" className={classes.formControl} error={provinceError}>
                <InputLabel id="province-label">Province/State</InputLabel>
                <Select
                    labelId="province-label"
                    id="province-outlined"
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    label="Province/State"
                >
                    <MenuItem value="None" key="empty">
                        <em>None</em>
                    </MenuItem>
                    {
                        provinceList.map((province, index) => {
                            return <MenuItem key={index} value={province}>{province}</MenuItem>
                        })
                    }
                </Select>
                <FormHelperText
                    style={{color: 'red'}}>{provinceError ? "Must select province/state" : ""}</FormHelperText>
            </FormControl>
        </div>
        <DialogActions>
            <Button
                onClick={() => completeCheckIn()}
                disabled={triedSubmit}
                variant="contained"
                color="primary">
                Complete Check In
            </Button>
            <Button onClick={() => closeDialog()} variant="contained" color="secondary">
                Cancel
            </Button>
        </DialogActions>
    </Dialog>
};