import {Box, Button, makeStyles, Paper, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {TitleBarEmployee} from "../index";
import {useHistory, useLocation} from "react-router-dom";

const useStyles = makeStyles(() => ({
    centre: {
        paddingTop: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.4em'
    },
    inPaper: {
        display: 'flex'
    },
    centreTitle: {
        paddingTop: '2em',
        fontWeight: 'bold',
        fontSize: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonCentre: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '2em',
        flexGrow: 1
    },
    buttonSpacing: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1em',
        marginTop: '1em',
        marginLeft: '1em',
        marginRight: '1em'
    },
    gridSpacing: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    paperContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        display: 'inline-block',
        padding: '1em',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topGrid: {
        maxWidth: '45em'
    }
}));

interface Employee {
    employeeSIN: string;
    employeeName: string;
    employeeAddress: string;
    salary: string;
    jobTitle: string;
    brandName: string;
    brandID: number;
    hotelID: number;
    hotelAddress: string;
}

export default function WelcomeEmployee() {
    const classes = useStyles();
    const location = useLocation<Employee>();
    const history = useHistory();

    const [checkInDisabled, setCheckInDisabled]: [boolean, any] = useState(false);
    const [checkOutDisabled, setCheckOutDisabled]: [boolean, any] = useState(false);
    const [manageEmployeeDisabled, setManageEmployeeDisabled]: [boolean, any] = useState(false);

    const welcomeMessage = location.state.brandName + ", " + location.state.hotelAddress

    async function checkIn() {
        setCheckInDisabled(true);
        try {
            let response: Response = await fetch(process.env.REACT_APP_SERVER_URL + "/hotels/" + location.state.hotelID + "/reservations?action=check-in");
            if (response.status !== 200) {
                setCheckInDisabled(false);
                return;
            }
            response = await response.json();
            history.push('/ui/employee/checkin', {response: response, checkIn: true});
        } catch (error) {
            console.error('Error:', error);
            setCheckInDisabled(false);
        }
    }

    function manageCustomer() {
        history.push('/ui/employee/managecustomer');
    }

    async function checkOut() {
        setCheckOutDisabled(true);
        try {
            let response: Response = await fetch(process.env.REACT_APP_SERVER_URL + "/hotels/" + location.state.hotelID + "/reservations?action=check-out");
            if (response.status !== 200) {
                setCheckOutDisabled(false);
                return;
            }
            response = await response.json();
            history.push('/ui/employee/checkout', {response: response, checkOut: false});
        } catch (error) {
            console.error('Error:', error);
            setCheckOutDisabled(false);
        }
    }

    function ManagerActions() {
        if (location.state.jobTitle === 'Manager') {
            return (
                <>
                    <Typography className={classes.centre}>Manager Actions:</Typography>
                    <br/>
                    <div className={classes.paperContainer}>
                        <Button variant="contained" color='primary' disabled={manageEmployeeDisabled}>
                            Manage Employees
                        </Button>
                    </div>
                </>
            )
        }
        return <></>
    }

    return (
        <>
            <TitleBarEmployee/>
            <Typography className={classes.centreTitle}>{welcomeMessage}</Typography>
            <Typography className={classes.centre}>Your profile:</Typography>
            <div className={classes.paperContainer}>
                <Paper elevation={3} className={classes.paper}>
                    <Typography className={classes.inPaper}>Name: {location.state.employeeName}</Typography>
                    <Typography className={classes.inPaper}>Address: {location.state.employeeAddress}</Typography>
                    <Typography className={classes.inPaper}>Job title: {location.state.jobTitle}</Typography>
                    <Typography className={classes.inPaper}>Salary: ${location.state.salary}</Typography>
                </Paper>
            </div>
            <div className={classes.paperContainer}>
                <Box display="flex" flexDirection="row" p={1} m={1}>
                    <Box p={1}>
                        <Button variant="contained" className={classes.buttonSpacing} disabled={checkInDisabled}
                                onClick={() => checkIn()}>
                            Customer Check In
                        </Button>
                    </Box>
                    <Box p={1}>
                        <Button variant="contained" className={classes.buttonSpacing} disabled={checkOutDisabled}
                                onClick={() => checkOut()}>
                            Customer Check Out
                        </Button>
                    </Box>
                    <Box p={1}>
                        <Button variant="contained" className={classes.buttonSpacing}
                                onClick={() => manageCustomer()}>
                            Manage Customer
                        </Button>
                    </Box>
                </Box>
            </div>
            <br/>
            <ManagerActions/>
        </>
    )
}