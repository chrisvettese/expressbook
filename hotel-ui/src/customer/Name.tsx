import {Button, makeStyles, TextField, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {BackButton, phoneRegex, REACT_APP_SERVER_URL, sinRegex, TitleBar} from "../index";
import {useHistory, useLocation} from 'react-router-dom';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        backgroundColor: theme.palette.background.paper,
    },
    centre: {
        paddingTop: '5em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textField: {
        paddingTop: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    buttonCentre: {
        paddingTop: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
}));

export default function Name() {
    const classes = useStyles();
    const location = useLocation<{ customerEmail: string }>();
    const history = useHistory();
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [SIN, setSIN] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [nameError, setNameError]: [boolean, any] = useState(false);
    const [addressError, setAddressError]: [boolean, any] = useState(false);
    const [phoneError, setPhoneError]: [boolean, any] = useState(false);
    const [disableUseButton, setDisableUseButton]: [boolean, any] = useState(false);

    const [sinUsed, setSINUsed]: [boolean, any] = useState(false);

    const [trySubmit, setTrySubmit]: [boolean, any] = useState(false);

    function validateSIN(): boolean {
        return !sinRegex.test(SIN) && (SIN.length !== 0 || (trySubmit && SIN.length === 0));
    }

    function getSINMessage() {
        if (sinUsed) {
            return "Profile with SIN already exists";
        }
        return validateSIN() ? "SIN must have format XXX-XXX-XXX" : "";
    }

    async function submitInfo() {
        const nameError: boolean = name.length === 0;
        const addressError: boolean = address.length === 0;
        const phoneError: boolean = !(phoneRegex).test(phoneNumber);
        const sinError: boolean = !sinRegex.test(SIN);

        setNameError(nameError);
        setAddressError(addressError);
        setPhoneError(phoneError);

        setSINUsed(false);

        setTrySubmit(true);

        if (nameError || addressError || sinError || phoneError) {
            return;
        }

        if (name.length === 0 && address.length === 0) {
            setNameError(true);
            setAddressError(true)
        } else if (name.length !== 0 && address.length === 0) {
            setNameError(false);
            setAddressError(true)
        } else if (name.length === 0 && address.length !== 0) {
            setNameError(true);
            setAddressError(false)
        } else {
            setDisableUseButton(true);
            try {
                let response = await fetch(REACT_APP_SERVER_URL + "/customers", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        customer_sin: SIN,
                        customer_name: name,
                        customer_address: address,
                        customer_email: location.state.customerEmail,
                        customer_phone: phoneNumber
                    })
                })
                if (response.status === 201) {
                    history.push('/ui/customer/welcome', {
                        customerSIN: SIN,
                        customerName: name,
                        customerAddress: address,
                        customerEmail: location.state.customerEmail,
                        customerPhone: phoneNumber
                    })
                } else if (response.status === 409) {
                    const jsonResponse = await response.json();
                    if (jsonResponse.message === 'Customer already exists') {
                        setSINUsed(true);
                    }
                    setDisableUseButton(false);
                }
            } catch (error) {
                console.error('Error:', error);
                setDisableUseButton(false);
            }
        }
    }

    function keyPressed(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter') {
            submitInfo().then(_ => {
            });
        }
    }

    return (
        <div className={classes.root}>
            <TitleBar history={history} userType='customer'/>
            <div className={classes.centre}>
                <Typography>Welcome to ExpressBook. Please provide some information about yourself:</Typography>
            </div>
            <div className={classes.textField}>
                <TextField label="Full Name" variant="outlined" value={name} error={nameError}
                           helperText={nameError ? "Must provide name" : ""}
                           onChange={event => setName(event.currentTarget.value)}/>
            </div>
            <div className={classes.textField}>
                <TextField error={validateSIN() || sinUsed} helperText={getSINMessage()}
                           onChange={event => setSIN(event.currentTarget.value)}
                           id="outlined-basic" label="Social Insurance Number" variant="outlined" value={SIN}/>
            </div>
            <div className={classes.textField}>
                <TextField label="Address" variant="outlined" value={address} error={addressError}
                           helperText={addressError ? "Must provide address" : ""}
                           onChange={event => setAddress(event.currentTarget.value)}/>
            </div>
            <div className={classes.textField}>
                <TextField label="Phone Number" variant="outlined" value={phoneNumber} error={phoneError}
                           helperText={phoneError ? "Must provide valid phone number" : ""}
                           onKeyPress={e => keyPressed(e)}
                           onChange={event => setPhoneNumber(event.currentTarget.value)}/>
            </div>
            <div className={classes.buttonCentre}>
                <Button variant="contained" onClick={() => submitInfo()} disabled={disableUseButton}>Sign In</Button>
            </div>
            <div style={{height: '18em', width: '100%'}}/>
            <BackButton message={'Back'} history={history} url={'/ui/customer'} state={{}}/>
        </div>
    )
}