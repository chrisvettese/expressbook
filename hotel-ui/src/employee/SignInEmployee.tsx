import {Button, makeStyles, TextField, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {GetEmployeeResponse, TitleBar} from "../index";
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

export default function SignInEmployee() {
    const classes = useStyles();
    const history = useHistory();

    const [email, setEmail]: [string, any] = useState("");
    const [emailError, setEmailError]: [boolean, any] = useState(false);
    const [disableSignIn, setDisableSignIn]: [boolean, any] = useState(false);

    const [error, setError]: [string, any] = useState('');

    function keyPressed(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter') {
            checkEmployee();
        }
    }

    function checkEmployee() {
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

        fetch(process.env.REACT_APP_SERVER_URL + "/employees?email=" + email)
            .then(response => {
                if (response.status === 200) {
                    response.json().then((response: GetEmployeeResponse[]) => {
                        if (response.length === 1 && response[0].status === 'hired') {
                            history.push('/ui/employee/welcome', {
                                employeeSIN: response[0].employee_sin,
                                employeeName: response[0].employee_name,
                                employeeAddress: response[0].employee_address,
                                employeeEmail: response[0].employee_email,
                                salary: response[0].salary,
                                jobTitle: response[0].job_title,
                                brandName: response[0].brand_name,
                                brandID: response[0].brand_id,
                                hotelID: response[0].hotel_id,
                                hotelAddress: response[0].hotel_address
                            })
                        } else {
                            setError("Unable to sign in. Please contact the hotel manager or database admin if you think this is a problem.")
                            setDisableSignIn(false);
                        }
                    })
                } else {
                    setError("Unable to sign in. Please contact the hotel manager or database admin if you think this is a problem.")
                    setDisableSignIn(false);
                }
            }).catch(error => {
                console.log('Error:', error);
                setError("Unable to sign in. Please contact the hotel manager or database admin if you think this is a problem.")
                setDisableSignIn(false);
            }
        )
    }

    return (
        <>
            <TitleBar history={history} userType='employee'/>
            <Typography className={classes.centreTitle}>Sign In</Typography>
            <div className={classes.sinCentre}>
                <Typography>Please sign in to access the hotel management system:</Typography>
            </div>
            <div className={classes.sinCentre}>
                <TextField label="Email Address" variant="outlined" value={email} error={emailError}
                           helperText={emailError ? "Must provide valid email" : ""} onKeyPress={e => keyPressed(e)}
                           onChange={event => setEmail(event.currentTarget.value)}/>
            </div>
            <div className={classes.buttonCentre}>
                <Button variant="contained" onClick={() => checkEmployee()} disabled={disableSignIn}>Sign In</Button>
            </div>
            <div className={classes.sinCentre}>
                <Typography style={{color: "red"}}>{error}</Typography>
            </div>
        </>
    )
}