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
    const [nameError, setNameError] = useState(false)
    const [addressError, setAddressError] = useState(false)
    const [disableUseButton, setDisableUseButton] = useState(false)

    async function submitInfo() {
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
                        customer_address: address
                    })
                })
                if (response.status === 201) {
                    history.push('/ui/customer/welcome', {
                        customerSIN: location.state.customerSIN,
                        customerName: name,
                        customerAddress: address
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
            <div className={classes.centre}>
                <TextField label="Full Name" variant="outlined" value={name} error={nameError}
                           helperText={nameError ? "Must provide name" : ""}
                           onChange={event => setName(event.currentTarget.value)}/>
            </div>
            <div className={classes.centre}>
                <TextField label="Address" variant="outlined" value={address} error={addressError}
                           helperText={addressError ? "Must provide address" : ""}
                           onChange={event => setAddress(event.currentTarget.value)}/>
            </div>
            <div className={classes.buttonCentre}>
                <Button variant="contained" onClick={() => submitInfo()} disabled={disableUseButton}>Sign In</Button>
            </div>
        </>
    )
}