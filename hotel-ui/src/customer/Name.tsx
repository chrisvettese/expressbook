import {Button, makeStyles, TextField, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {TitleBarCustomer} from "../index";
import {useHistory, useLocation} from 'react-router-dom';

const useStyles = makeStyles(() => ({
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
    const location = useLocation<{ customerSIN: string }>();
    const history = useHistory();
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [nameError, setNameError]: [boolean, any] = useState(false);
    const [addressError, setAddressError]: [boolean, any] = useState(false);
    const [emailError, setEmailError]: [boolean, any] = useState(false);
    const [phoneError, setPhoneError]: [boolean, any] = useState(false);
    const [disableUseButton, setDisableUseButton]: [boolean, any] = useState(false);

    async function submitInfo() {
        const nameError: boolean = name.length === 0;
        const addressError: boolean = address.length === 0;
        let emailError: boolean = email.includes(' ') || email.indexOf('@') < 1
        if (!emailError) {
            const index: number = email.indexOf('.', email.indexOf('@'))
            if (index < 3 || index === email.length - 1) {
                emailError = true;
            }
        }
        const phoneError: boolean = !(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im).test(phoneNumber);

        setNameError(nameError);
        setAddressError(addressError);
        setEmailError(emailError);
        setPhoneError(phoneError);

        if (nameError || addressError || emailError || phoneError) {
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
                let response = await fetch(process.env.REACT_APP_SERVER_URL + "/customers", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        customer_sin: location.state.customerSIN,
                        customer_name: name,
                        customer_address: address,
                        customer_email: email,
                        customer_phone: phoneNumber
                    })
                })
                if (response.status === 201) {
                    history.push('/ui/customer/welcome', {
                        customerSIN: location.state.customerSIN,
                        customerName: name,
                        customerAddress: address,
                        customerEmail: email,
                        customerPhone: phoneNumber
                    })
                }
            } catch(error) {
                console.error('Error:', error);
                setDisableUseButton(false);
            }
        }
    }

    return (
        <>
            <TitleBarCustomer/>
            <div className={classes.centre}>
                <Typography>Welcome to ExpressBook. Please provide some information about yourself:</Typography>
            </div>
            <div className={classes.textField}>
                <TextField label="Full Name" variant="outlined" value={name} error={nameError}
                           helperText={nameError ? "Must provide name" : ""}
                           onChange={event => setName(event.currentTarget.value)}/>
            </div>
            <div className={classes.textField}>
                <TextField label="Address" variant="outlined" value={address} error={addressError}
                           helperText={addressError ? "Must provide address" : ""}
                           onChange={event => setAddress(event.currentTarget.value)}/>
            </div>
            <div className={classes.textField}>
                <TextField label="Email" variant="outlined" value={email} error={emailError}
                           helperText={emailError ? "Must provide valid email" : ""}
                           onChange={event => setEmail(event.currentTarget.value)}/>
            </div>
            <div className={classes.textField}>
                <TextField label="Phone Number" variant="outlined" value={phoneNumber} error={phoneError}
                           helperText={phoneError ? "Must provide valid phone number" : ""}
                           onChange={event => setPhoneNumber(event.currentTarget.value)}/>
            </div>
            <div className={classes.buttonCentre}>
                <Button variant="contained" onClick={() => submitInfo()} disabled={disableUseButton}>Sign In</Button>
            </div>
        </>
    )
}