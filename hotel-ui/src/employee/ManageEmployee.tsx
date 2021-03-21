import {
    Button, Dialog, DialogActions, DialogTitle,
    Divider,
    Grid,
    GridList,
    GridListTile,
    makeStyles,
    Paper, Snackbar, TextField,
    Typography
} from "@material-ui/core";
import React, {useState} from "react";
import {GetEmployeeResponse, Severity, TitleBarCustomer} from "../index";
import {useHistory, useLocation} from "react-router-dom";
import {Alert} from "@material-ui/lab";

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        backgroundColor: theme.palette.background.paper,

    },
    centreTitle: {
        paddingTop: '2em',
        fontWeight: 'bold',
        fontSize: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1em',
        width: '100%'
    },
    subTitle: {
        fontSize: '1.4em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1em',
        width: '100%'
    },
    brandPaper: {
        marginTop: '2em',
        marginLeft: '6em',
        marginRight: '6em',
        padding: '1em',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    empName: {
        fontWeight: 'bold',
        fontSize: '1.5em',
        width: '100%'
    },
    grid: {
        boxShadow: '0 0 3pt 1pt gray',
        height: '38em',
        width: '85%',
        marginTop: '10em',
        marginLeft: '10em',
    },
    divider: {
        marginLeft: '1em',
        marginRight: '1em'
    },
    brandGrid: {
        width: '80%'
    },
    priceDiv: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center'
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
    }
}));

const CreateEmployee = ({
                            dialogOpen, setDialogOpen,
                            classes,
                            openAlert
                        }: any) => {

    const sinRegex: RegExp = /^[0-9]{3}-[0-9]{3}-[0-9]{3}$/;

    const [sinError, setSINError]: [boolean, any] = useState(false);
    const [sinHelper, setSINHelper]: [string, any] = useState('');

    const [disableCheck, setDisableCheck]: [boolean, any] = useState(false);
    const [disableCreateEmployee, setDisableCreateEmployee]: [boolean, any] = useState(false);

    const [showInfo, setShowInfo]: [boolean, any] = useState(false);

    const [employeeSIN, setEmployeeSIN]: [string, any] = useState("");
    const [employeeName, setEmployeeName]: [string, any] = useState("");
    const [employeeAddress, setEmployeeAddress]: [string, any] = useState("");
    const [employeeSalary, setEmployeeSalary]: [string, any] = useState("");
    const [employeeJobTitle, setEmployeeJobTitle]: [string, any] = useState("");

    function AdditionalInfo() {
        if (showInfo) {
            return (
                <>
                    <TextField label="Name" variant="outlined" value={employeeName} error={sinError}
                               helperText={sinHelper}
                               onChange={event => setEmployeeName(event.currentTarget.value)}/>
                    <br/>
                    <TextField label="Address" variant="outlined" value={employeeAddress} error={sinError}
                               helperText={sinHelper}
                               onChange={event => setEmployeeAddress(event.currentTarget.value)}/>
                    <br/>
                    <TextField label="Salary" variant="outlined" value={employeeSalary} error={sinError}
                               helperText={sinHelper}
                               onChange={event => setEmployeeSalary(event.currentTarget.value)}/>
                    <br/>
                    <TextField label="Job Title" variant="outlined" value={employeeJobTitle} error={sinError}
                               helperText={sinHelper}
                               onChange={event => setEmployeeJobTitle(event.currentTarget.value)}/>
                    <br/>
                </>
            )
        } else {
            return <></>
        }
    }

    async function validateEmployeeSIN() {
        setDisableCheck(true);
        if (!sinRegex.test(employeeSIN) || employeeSIN.length === 0) {
            setSINHelper("Must enter valid SIN");
            setSINError(true);
            setDisableCheck(false);
            setShowInfo(false);
            return;
        }

        try {
            let response = await fetch(process.env.REACT_APP_SERVER_URL + "/employees/" + employeeSIN);
            if (response.status === 404) {
                setShowInfo(true);
                setSINError(false);
                setDisableCheck(false);
                setShowInfo(true);
                setSINHelper("");
                setEmployeeName("");
                setEmployeeJobTitle("");
                setEmployeeSalary("");
                setEmployeeAddress("");
                openAlert("Employee SIN validated", "success")
            } else if (response.status === 200) {
                const employeeResponse: GetEmployeeResponse = await response.json();
                if (employeeResponse.status === 'hired') {
                    setSINHelper("Invalid SIN. Employee already exists!");
                    setSINError(true);
                } else {
                    setSINError(false);
                    setDisableCheck(false);
                    setSINHelper("");
                    openAlert('Existing profile found', 'success');
                    //Show additional info filled out
                    setEmployeeAddress(employeeResponse.employee_address);
                    setEmployeeName(employeeResponse.employee_name);
                    setEmployeeJobTitle(employeeResponse.job_title);
                    setEmployeeSalary(employeeResponse.salary);
                    setShowInfo(true);
                }
            } else {
                openAlert('Unable to verify SIN', 'error');
            }
        } catch (error) {
            console.log('Error:', error);
            openAlert('Unable to verify SIN', 'error');
        }
        setDisableCheck(false);
    }

    async function createEmployee() {
        setDisableCreateEmployee(true);
        //TODO: either PATCH or POST depending on whether employee SIN is new or not
        setDisableCreateEmployee(false);
    }

    function closeDialog() {
        setDialogOpen(false);
        setSINError(false);
        setDisableCheck(false);
        setEmployeeSIN("");
        setEmployeeAddress("");
        setEmployeeSalary("");
        setEmployeeJobTitle("");
        setEmployeeName("");
        setShowInfo(false);
    }


    return <Dialog onClose={() => closeDialog()} aria-labelledby="simple-dialog-title" open={dialogOpen}>
        <DialogTitle id="dialog-title" className={classes.dialogTitle}>
            <Typography className={classes.dialogTitle}>Add New Employee</Typography>
        </DialogTitle>
        <div className={classes.dialogAddress}>
            <TextField label="Employee SIN" variant="outlined" value={employeeSIN} error={sinError}
                       helperText={sinHelper}
                       onChange={event => {
                           setEmployeeSIN(event.currentTarget.value);
                           setShowInfo(false);
                       }}/>
            <br/>
            <Button variant='contained' disabled={disableCheck} onClick={validateEmployeeSIN}>Check SIN</Button>
            <br/>
            <AdditionalInfo/>
        </div>
        <DialogActions>
            <Button disabled={disableCreateEmployee}
                    onClick={() => createEmployee()}
                    variant="contained"
                    color="primary">
                Create Profile
            </Button>
            <Button onClick={() => {
                setDialogOpen(false);
            }} variant="contained" color="secondary">
                Cancel
            </Button>
        </DialogActions>
    </Dialog>
};

interface Employee {
    employee_sin: string;
    employee_name: string;
    employee_address: string;
    salary: string;
    job_title: string;
}

interface State {
    response: any;
    checkIn: boolean;
    managerSIN: string;
    brandName: string;
    hotelAddress: string;
    hotelID: number;
}


export default function ManageEmployee() {
    const classes = useStyles();
    const location = useLocation<State>();
    const history = useHistory();

    const buttonStateValues: boolean[] = []
    for (let i = 0; i < location.state.response.length; i++) {
        if (location.state.response[i].employee_sin === location.state.managerSIN) {
            buttonStateValues.push(true);
        } else {
            buttonStateValues.push(false)
        }
    }

    const [buttonStates, setButtonStates]: [boolean[], any] = useState(buttonStateValues);
    const [employees, setEmployees]: [Employee[], any] = useState([...location.state.response]);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus]: [Severity, any] = useState("success");
    const [dialogOpen, setDialogOpen]: [boolean, any] = useState(false);

    function openAlert(message: string, status: Severity) {
        setAlertMessage(message);
        setAlertStatus(status);
        setAlertOpen(true);
    }

    function closeAlert() {
        setAlertOpen(false);
    }

    async function deleteEmployee(emp: Employee, index: number) {
        let newStates = [...buttonStates]
        newStates[index] = true;
        setButtonStates(newStates);
        try {
            let response = await fetch(process.env.REACT_APP_SERVER_URL + "/hotels/" + location.state.hotelID + "/employees/" + emp.employee_sin, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    manager_sin: location.state.managerSIN
                })
            })
            if (response.status !== 204) {
                let newStates = [...buttonStates]
                newStates[index] = false;
                setButtonStates(newStates);
                openAlert('Error: Failed to remove employee', 'error');
                return;
            }
            const newButtonStates = [...buttonStates];
            const newEmployees = [...employees];
            newButtonStates.splice(index, 1);
            newEmployees.splice(index, 1);
            setButtonStates(newButtonStates);
            setEmployees(newEmployees);
            openAlert('Successfully removed employee', 'success')
        } catch (error) {
            console.error('Error:', error);
            let newStates = [...buttonStates]
            newStates[index] = false;
            setButtonStates(newStates);
            openAlert('Error: Failed to remove employee', 'error');
        }
    }

    return (
        <div className={classes.root}>
            <TitleBarCustomer/>
            <Typography className={classes.centreTitle}>Hotel Employees</Typography>
            <Typography
                className={classes.subTitle}>{location.state.brandName + ", " + location.state.hotelAddress}
            </Typography>
            <div className={classes.subTitle}>
                <Button variant='contained' onClick={() => setDialogOpen(true)}>New Employee</Button>
            </div>
            <GridList cols={1} cellHeight={200} className={classes.grid}>
                {
                    employees.map((emp: Employee, index: number) => {
                        return (
                            <GridListTile key={emp.employee_sin} cols={1}>
                                <Paper elevation={3} key={emp.employee_sin} className={classes.brandPaper}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid className={classes.brandGrid}>
                                            <Typography className={classes.empName}>{emp.employee_name}</Typography>
                                            <Typography>{emp.job_title}</Typography>
                                            <Typography>SIN: {emp.employee_sin}</Typography>
                                            <Typography>Address: {emp.employee_address}</Typography>
                                            <Typography>Salary: {emp.salary}</Typography>
                                        </Grid>
                                        <Divider orientation="vertical" flexItem className={classes.divider}/>
                                        <Grid item xs={2}>
                                            <Grid className={classes.priceDiv}>
                                                <Button variant='contained' color='secondary'
                                                        disabled={buttonStates[index]}
                                                        onClick={() => deleteEmployee(emp, index)}>
                                                    Delete
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </GridListTile>
                        );
                    })
                }
            </GridList>
            <CreateEmployee dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} classes={classes}
                            openAlert={openAlert}/>
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={closeAlert}>
                <Alert onClose={closeAlert} severity={alertStatus}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}