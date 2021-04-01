import {Button, makeStyles, TextField, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {BackButton, phoneRegex, sinRegex, TitleBar} from "../index";
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

    const [trySubmit, setTrySubmit]: [boolean, any] = useState(false);

    function validateSIN(): boolean {
        return !sinRegex.test(SIN) && (SIN.length !== 0 || (trySubmit && SIN.length === 0));
    }

    async function submitInfo() {
        const nameError: boolean = name.length === 0;
        const addressError: boolean = address.length === 0;
        const phoneError: boolean = !(phoneRegex).test(phoneNumber);
        const sinError: boolean = !sinRegex.test(SIN);

        setNameError(nameError);
        setAddressError(addressError);
        setPhoneError(phoneError);

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
                let response = await fetch(process.env.REACT_APP_SERVER_URL + "/customers", {
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
                }
            } catch (error) {
                console.error('Error:', error);
                setDisableUseButton(false);
            }
        }
    }

    function keyPressed(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter') {
            submitInfo();
        }
    }

    return (
        <>
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
                <TextField error={validateSIN()} helperText={validateSIN() ? "SIN must have format XXX-XXX-XXX" : ""}
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
            <BackButton message={'Back'} history={history} url={'/ui/customer'} state={{}}/>
        </>
    )
}