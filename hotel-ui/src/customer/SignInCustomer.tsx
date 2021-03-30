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
    customer_sin: string;
    customer_name: string;
    customer_address: string;
    customer_email: string;
    customer_phone: string;
}

export default function SignInCustomer() {
    const classes = useStyles();
    const history = useHistory();

    const [email, setEmail]: [string, any] = useState("");
    const [emailError, setEmailError]: [boolean, any] = useState(false);
    const [disableSignIn, setDisableSignIn]: [boolean, any] = useState(false);

    function keyPressed(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter') {
            checkCustomer();
        }
    }

    function checkCustomer() {
        setDisableSignIn(true);
        let emailError: boolean = email.includes(' ') || email.indexOf('@') < 1
        if (!emailError) {
            const index: number = email.indexOf('.', email.indexOf('@'))
            if (index < 3 || index === email.length - 1) {
                emailError = true;
            }
        }
        setEmailError(emailError);
        if (emailError) {
            setDisableSignIn(false);
            return;
        }
        fetch(process.env.REACT_APP_SERVER_URL + "/customers?email=" + email)
            .then(response => {
                if (response.status === 200) {
                    response.json().then((response: CustomerResponse[]) => {
                        if (response.length === 0) {
                            history.push('/ui/customer/name', {customerEmail: email});
                        } else {
                            history.push('/ui/customer/welcome', {
                                customerSIN: response[0].customer_sin,
                                customerName: response[0].customer_name,
                                customerAddress: response[0].customer_address,
                                customerEmail: response[0].customer_email,
                                customerPhone: response[0].customer_phone
                            });
                        }
                    })
                } else {
                    setDisableSignIn(false);
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
                <Typography>To begin searching destinations, enter your email address:</Typography>
            </div>
            <div className={classes.sinCentre}>
                <TextField label="Email Address" variant="outlined" value={email} error={emailError}
                           helperText={emailError ? "Must provide valid email" : ""} onKeyPress={e => keyPressed(e)}
                           onChange={event => setEmail(event.currentTarget.value)}/>
            </div>
            <div className={classes.buttonCentre}>
                <Button variant="contained" onClick={() => checkCustomer()} disabled={disableSignIn}>Sign In</Button>
            </div>
        </>
    )
}