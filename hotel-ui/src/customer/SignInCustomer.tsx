import {Button, makeStyles, TextField, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {TitleBarCustomer} from "../index";
import {useHistory} from 'react-router-dom';


const useStyles = makeStyles(() => ({
    sinCentre: {
        paddingTop: '3em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonCentre: {
        paddingTop: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centreTitle: {
        paddingTop: '2em',
        fontWeight: 'bold',
        fontSize: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    }
}));

interface CustomerResponse {
    customer_sin: string,
    customer_name: string,
    customer_address: string,
    customer_email: string,
    customer_phone: string
}

export default function SignInCustomer() {
    const classes = useStyles();
    const history = useHistory();

    const [SIN, setSIN] = useState("");
    const [disableSignIn, setDisableSignIn] = useState(false);
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
        setDisableSignIn(true);
        fetch(process.env.REACT_APP_SERVER_URL + "/customers/" + SIN)
            .then(response => {
                if (response.status === 404) {
                    history.push('/ui/customer/name', {customerSIN: SIN})
                } else {
                    response.json().then((response: CustomerResponse) => {
                        history.push('/ui/customer/welcome', {
                            customerSIN: response.customer_sin,
                            customerName: response.customer_name,
                            customerAddress: response.customer_address,
                            customerEmail: response.customer_email,
                            customerPhone: response.customer_phone
                        })
                    })
                }
            }).catch(error => {
                console.log('Error:', error);
                setDisableSignIn(false);
            }
        )
    }

    return (
        <>
            <TitleBarCustomer/>
            <Typography className={classes.centreTitle}>Sign In</Typography>
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
                <Button variant="contained" onClick={() => checkCustomer()}
                        disabled={!sin_re.test(SIN) || disableSignIn}>Sign In</Button>
            </div>
        </>
    )
}