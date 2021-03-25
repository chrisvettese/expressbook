import {Button, makeStyles, TextField, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {GetEmployeeResponse, sinRegex, TitleBarEmployee} from "../index";
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

    const [SIN, setSIN] = useState("");
    const [disableSignIn, setDisableSignIn] = useState(false);
    const [error, setError] = useState("");

    function validateSIN(): boolean {
        return !sinRegex.test(SIN) && SIN.length !== 0;
    }

    function keyPressed(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter' && sinRegex.test(SIN)) {
            checkEmployee();
        }
    }

    function checkEmployee() {
        setDisableSignIn(true);
        fetch(process.env.REACT_APP_SERVER_URL + "/employees/" + SIN)
            .then(response => {
                if (response.status === 200) {
                    response.json().then((response: GetEmployeeResponse) => {
                        if (response.status === 'hired') {
                            history.push('/ui/employee/welcome', {
                                employeeSIN: response.employee_sin,
                                employeeName: response.employee_name,
                                employeeAddress: response.employee_address,
                                salary: response.salary,
                                jobTitle: response.job_title,
                                brandName: response.brand_name,
                                brandID: response.brand_id,
                                hotelID: response.hotel_id,
                                hotelAddress: response.hotel_address
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
            <TitleBarEmployee/>
            <Typography className={classes.centreTitle}>Sign In</Typography>
            <div className={classes.sinCentre}>
                <Typography>Please sign in to access the hotel management system:</Typography>
            </div>
            <div className={classes.sinCentre}>
                <TextField error={validateSIN()} helperText={validateSIN() ? "SIN must have format XXX-XXX-XXX" : ""}
                           onChange={event => setSIN(event.currentTarget.value)}
                           onKeyPress={e => keyPressed(e)}
                           id="outlined-basic" label="Social Insurance Number" variant="outlined" value={SIN}/>
            </div>
            <div className={classes.buttonCentre}>
                <Button variant="contained" onClick={() => checkEmployee()}
                        disabled={!sinRegex.test(SIN) || disableSignIn}>Sign In</Button>
            </div>
            <div className={classes.sinCentre}>
                <Typography style={{color: "red"}}>{error}</Typography>
            </div>
        </>
    )
}