import {Button, makeStyles, TextField, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {TitleBar} from "../index";
import {useHistory, useLocation} from 'react-router-dom';
import {Location} from 'history';

type LocationState = {
    from: Location;
};

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
    const location = useLocation<{ customer_sin: string }>();
    const history = useHistory();
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [nameError, setNameError] = useState(false)
    const [addressError, setAddressError] = useState(false)
    const [useButton, setUseButton] = useState(true)

    function submitInfo() {
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
            setUseButton(false);
            fetch(process.env.REACT_APP_SERVER_URL + "/customers", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customer_sin: location.state.customer_sin,
                    customer_name: name,
                    customer_address: address
                })
            }).then(response => {
                if (response.status === 201) {
                    history.push('/ui/customer/welcome')
                }
            })
        }
    }

    return (
        <>
            <TitleBar/>
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
                <Button variant="contained" onClick={() => submitInfo()} disabled={!useButton}>Sign In</Button>
            </div>
        </>
    )
}