import {Box, Button, makeStyles, Paper, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {HotelAlert, Severity, TitleBarEmployee} from "../index";
import {useHistory, useLocation} from "react-router-dom";
import {EditEmployeeProfileDialog} from "./employeeDialogs/EditEmployeeProfileDialog";

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
    },
    dialogTitle: {
        fontSize: "1.8em",
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    dialogAddress: {
        marginLeft: "0.5em",
        marginRight: "0.5em",
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    dialogGap: {
        marginBottom: '2em'
    }
}));

interface Employee {
    employeeSIN: string;
    employeeEmail: string;
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

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus]: [Severity, any] = useState("success");
    const [dialogOpen, setDialogOpen]: [boolean, any] = useState(false);

    const [employeeName, setEmployeeName]: [string, any] = useState(location.state.employeeName);
    const [employeeEmail, setEmployeeEmail]: [string, any] = useState(location.state.employeeEmail);
    const [employeeAddress, setEmployeeAddress]: [string, any] = useState(location.state.employeeAddress);

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
            history.push('/ui/employee/checkin', {
                response: response,
                checkIn: true,
                employeeSIN: location.state.employeeSIN
            });
        } catch (error) {
            console.error('Error:', error);
            setCheckInDisabled(false);
        }
    }

    function manageCustomer() {
        history.push('/ui/employee/managecustomer', {
            employeeSIN: location.state.employeeSIN,
            employeeName: employeeName,
            jobTitle: location.state.jobTitle,
            hotelID: location.state.hotelID,
            brandName: location.state.brandName,
            address: location.state.hotelAddress
        });
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
            history.push('/ui/employee/checkout', {
                response: response,
                checkOut: false,
                employeeSIN: location.state.employeeSIN
            });
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
                        <Button variant="contained" color='primary' disabled={manageEmployeeDisabled}
                                onClick={manageEmployee}>
                            Manage Employees
                        </Button>
                    </div>
                </>
            )
        }
        return <></>
    }

    async function manageEmployee() {
        setManageEmployeeDisabled(true);
        try {
            let response: Response = await fetch(process.env.REACT_APP_SERVER_URL + "/hotels/" + location.state.hotelID + "/employees");
            if (response.status !== 200) {
                setManageEmployeeDisabled(false);
                return;
            }
            response = await response.json();
            history.push('/ui/employee/manageemployee', {
                response: response,
                checkIn: true,
                managerSIN: location.state.employeeSIN,
                brandName: location.state.brandName,
                hotelAddress: location.state.hotelAddress,
                hotelID: location.state.hotelID
            });
        } catch (error) {
            console.error('Error:', error);
            setManageEmployeeDisabled(false);
        }
    }

    return (
        <>
            <TitleBarEmployee/>
            <Typography className={classes.centreTitle}>{welcomeMessage}</Typography>
            <Typography className={classes.centre}>Your profile:</Typography>
            <div className={classes.paperContainer}>
                <Paper elevation={3} className={classes.paper}>
                    <Typography className={classes.inPaper}>Name: {employeeName}</Typography>
                    <Typography className={classes.inPaper}>Email: {employeeEmail}</Typography>
                    <Typography className={classes.inPaper}>Address: {employeeAddress}</Typography>
                    <Typography className={classes.inPaper}>Job title: {location.state.jobTitle}</Typography>
                    <Typography className={classes.inPaper}>Salary: ${location.state.salary}</Typography>
                </Paper>
            </div>
            <br/><br/>
            <div className={classes.paperContainer}>
                <Button variant="contained" onClick={() => setDialogOpen(true)}>
                    Edit Profile
                </Button>
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
            <EditEmployeeProfileDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} classes={classes}
                                       employeeSIN={location.state.employeeSIN} setAlertMessage={setAlertMessage}
                                       setAlertStatus={setAlertStatus} setAlertOpen={setAlertOpen}
                                       hotelID={location.state.hotelID}
                                       employeeName={employeeName} employeeAddress={employeeAddress}
                                       employeeEmail={employeeEmail} setEmployeeEmail={setEmployeeEmail}
                                       setEmployeeName={setEmployeeName} setEmployeeAddress={setEmployeeAddress}/>
            <HotelAlert alertOpen={alertOpen} closeAlert={() => setAlertOpen(false)} alertStatus={alertStatus}
                        alertMessage={alertMessage}/>
        </>
    )
}