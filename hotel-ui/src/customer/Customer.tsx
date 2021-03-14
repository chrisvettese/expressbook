import {Button, makeStyles, TextField, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {TitleBar} from "../index";
import {useHistory} from 'react-router-dom';


const useStyles = makeStyles(() => ({
    sinCentre: {
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

export default function Customer() {
    const classes = useStyles();
    const history = useHistory();

    const [SIN, setSIN] = useState("");
    const sin_re: RegExp = /^[0-9]{3}-[0-9]{3}-[0-9]{3}$/;

    function validateSIN(): boolean {
        return !sin_re.test(SIN) && SIN.length !== 0;
    }

    function keyPressed(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter' && sin_re.test(SIN)) {
            checkCustomer();
        }
    }

    function checkCustomer() {
        fetch(process.env.REACT_APP_SERVER_URL + "/customers/" + SIN)
            .then(response => {
                if (response.status === 404) {
                    history.push('/ui/customer/name', {customer_sin: SIN})
                } else {
                    response.json().then(response => {
                        history.push('/ui/customer/welcome', response)
                    })
                }
            })
    }

    return (
        <>
            <TitleBar/>
            <div className={classes.sinCentre}>
                <Typography>To begin searching destinations, enter your social insurance number:</Typography>
            </div>
            <div className={classes.sinCentre}>
                <TextField error={validateSIN()} helperText={validateSIN() ? "SIN must have format XXX-XXX-XXX" : ""}
                           onChange={event => setSIN(event.currentTarget.value)}
                           onKeyPress={e => keyPressed(e)}
                           id="outlined-basic" label="Social Insurance Number" variant="outlined" value={SIN}/>
            </div>
            <div className={classes.buttonCentre}>
                <Button variant="contained" onClick={() => checkCustomer()} disabled={!sin_re.test(SIN)}>Sign
                    In</Button>
            </div>
        </>
    )
}