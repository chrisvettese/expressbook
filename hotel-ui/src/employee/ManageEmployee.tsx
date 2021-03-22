import {
    Button, Dialog, DialogActions, DialogTitle,
    Divider,
    Grid,
    GridList,
    GridListTile, InputAdornment,
    makeStyles,
    Paper, Snackbar, TextField,
    Typography
} from "@material-ui/core";
import React, {useState} from "react";
import {GetEmployeeResponse, Severity, TitleBarEmployee} from "../index";
import {useLocation} from "react-router-dom";
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
        paddingBottom: '1em'
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
                            openAlert,
                            hotelID, managerSIN,
                            employees, setEmployees
                        }: any) => {

    const sinRegex: RegExp = /^[0-9]{3}-[0-9]{3}-[0-9]{3}$/;

    const [sinError, setSINError]: [boolean, any] = useState(false);
    const [nameError, setNameError]: [boolean, any] = useState(false);
    const [addressError, setAddressError]: [boolean, any] = useState(false);
    const [salaryError, setSalaryError]: [boolean, any] = useState(false);
    const [jobError, setJobError]: [boolean, any] = useState(false);

    const [sinHelper, setSINHelper]: [string, any] = useState('');
    const [nameHelper, setNameHelper]: [string, any] = useState('');
    const [addressHelper, setAddressHelper]: [string, any] = useState('');
    const [salaryHelper, setSalaryHelper]: [string, any] = useState('');
    const [jobHelper, setJobHelper]: [string, any] = useState('');

    const [disableCheck, setDisableCheck]: [boolean, any] = useState(false);
    const [disableCreateEmployee, setDisableCreateEmployee]: [boolean, any] = useState(false);

    const [showInfo, setShowInfo]: [boolean, any] = useState(false);

    const [employeeSIN, setEmployeeSIN]: [string, any] = useState("");
    const [employeeName, setEmployeeName]: [string, any] = useState("");
    const [employeeAddress, setEmployeeAddress]: [string, any] = useState("");
    const [employeeSalary, setEmployeeSalary]: [string, any] = useState("");
    const [employeeJobTitle, setEmployeeJobTitle]: [string, any] = useState("");

    const [isNewSIN, setIsNewSIN]: [boolean, any] = useState(false);

    function AdditionalInfo() {
        if (showInfo) {
            return (
                <>
                    <TextField label="Name" variant="outlined" value={employeeName} error={nameError}
                               helperText={nameHelper}
                               onChange={event => setEmployeeName(event.currentTarget.value)}/>
                    <br/>
                    <TextField label="Address" variant="outlined" value={employeeAddress} error={addressError}
                               helperText={addressHelper}
                               onChange={event => setEmployeeAddress(event.currentTarget.value)}/>
                    <br/>
                    <TextField label="Salary" variant="outlined" value={employeeSalary} error={salaryError}
                               helperText={salaryHelper} type="number"
                               onChange={event => setEmployeeSalary(event.currentTarget.value)}
                               InputProps={{
                                   startAdornment: <InputAdornment position="start">$</InputAdornment>,
                               }}/>
                    <br/>
                    <TextField label="Job Title" variant="outlined" value={employeeJobTitle} error={jobError}
                               helperText={jobHelper}
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
                setDisableCreateEmployee(false);
                setSINHelper("");
                setEmployeeName("");
                setEmployeeJobTitle("");
                setEmployeeSalary("");
                setEmployeeAddress("");
                setIsNewSIN(true);
                openAlert("Employee SIN validated", "success")
            } else if (response.status === 200) {
                const employeeResponse: GetEmployeeResponse = await response.json();
                if (employeeResponse.status === 'hired') {
                    setSINHelper("Invalid SIN. Employee already exists!");
                    setSINError(true);
                } else {
                    setIsNewSIN(false);
                    setSINError(false);
                    setDisableCheck(false);
                    setSINHelper("");
                    setDisableCreateEmployee(false);
                    //Show additional info filled out
                    setEmployeeAddress(employeeResponse.employee_address);
                    setEmployeeName(employeeResponse.employee_name);
                    setEmployeeJobTitle(employeeResponse.job_title);
                    setEmployeeSalary(employeeResponse.salary);
                    setShowInfo(true);
                    openAlert('Existing profile found', 'success');
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
        const validateName = employeeName.length > 0 && employeeName.length < 255;
        const validateAddress = employeeAddress.length > 0 && employeeAddress.length < 255;
        const validateSalary = !Number.isNaN(employeeSalary) && parseFloat(employeeSalary) > 0;
        const validateJobTitle = employeeJobTitle.length > 0;

        setNameError(!validateName);
        setAddressError(!validateAddress);
        setSalaryError(!validateSalary);
        setJobError(!validateJobTitle);

        if (!validateName) {
            setNameHelper('Must enter valid name for employee')
        }
        if (!validateAddress) {
            setAddressHelper('Must enter valid address for employee')
        }
        if (!validateSalary) {
            setSalaryHelper('Must enter valid salary for employee')
        }
        if (!validateJobTitle) {
            setJobHelper('Must enter valid job title for employee')
        }
        if (!validateName || !validateAddress || !validateSalary || !validateJobTitle) {
            setDisableCreateEmployee(false);
            return;
        }

        const fixedESalary: string = parseFloat(employeeSalary).toFixed(2)

        console.log(isNewSIN)
        if (isNewSIN) {
            try {
                let response = await fetch(process.env.REACT_APP_SERVER_URL + "/hotels/" + hotelID + "/employees", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        employee_sin: employeeSIN,
                        manager_sin: managerSIN,
                        name: employeeName,
                        address: employeeAddress,
                        salary: fixedESalary,
                        job_title: employeeJobTitle
                    })
                })
                if (response.status === 201) {
                    openAlert('Successfully added employee', 'success');
                    const newEmployees = [...employees];
                    newEmployees.push({
                        employee_sin: employeeSIN,
                        employee_name: employeeName,
                        employee_address: employeeAddress,
                        salary: fixedESalary,
                        job_title: employeeJobTitle,
                    });
                    setEmployees(newEmployees);
                    closeDialog();
                } else {
                    openAlert('Error: Unable to add employee', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                openAlert('Error: Unable to add employee', 'error');
            }
        } else {
            try {
                let response = await fetch(process.env.REACT_APP_SERVER_URL + "/hotels/" + hotelID + "/employees/" + employeeSIN, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        manager_sin: managerSIN,
                        name: employeeName,
                        address: employeeAddress,
                        salary: fixedESalary,
                        job_title: employeeJobTitle,
                        status: 'hired'
                    })
                })
                if (response.status === 204) {
                    openAlert('Successfully added employee', 'success');
                    const newEmployees = [...employees];
                    newEmployees.push({
                        employee_sin: employeeSIN,
                        employee_name: employeeName,
                        employee_address: employeeAddress,
                        salary: fixedESalary,
                        job_title: employeeJobTitle,
                    });
                    setEmployees(newEmployees);
                    closeDialog();
                } else {
                    openAlert('Error: Unable to add employee', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                openAlert('Error: Unable to add employee', 'error');
            }
        }
        setDisableCreateEmployee(false);
    }

    function closeDialog() {
        setDialogOpen(false);
        setSINError(false);
        setNameError(false);
        setAddressError(false);
        setSalaryError(false);
        setJobError(false);
        setDisableCheck(false);
        setSINHelper("");
        setNameHelper("");
        setAddressHelper("");
        setJobHelper("");
        setSalaryHelper("");
        setEmployeeSIN("");
        setEmployeeAddress("");
        setEmployeeSalary("");
        setEmployeeJobTitle("");
        setEmployeeName("");
        setShowInfo(false);
        setDisableCreateEmployee(true);
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
                           setDisableCreateEmployee(true);
                           setShowInfo(false);
                       }}/>
            <br/>
            <Button variant='contained' disabled={disableCheck} onClick={validateEmployeeSIN}>Check SIN</Button>
            <br/>
            {
                AdditionalInfo()
            }
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
            <TitleBarEmployee/>
            <Typography className={classes.centreTitle}>Hotel Employees</Typography>
            <Typography
                className={classes.subTitle}>{location.state.brandName + ", " + location.state.hotelAddress}
            </Typography>
            <div className={classes.subTitle}>
                <Button variant='contained' onClick={() => setDialogOpen(true)}>New Employee</Button>
            </div>
            <GridList cols={1} cellHeight={185} className={classes.grid}>
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
                                            <Typography>Salary: ${emp.salary}</Typography>
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
                            openAlert={openAlert} hotelID={location.state.hotelID} employees={employees}
                            managerSIN={location.state.managerSIN} setEmployees={setEmployees}/>
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={closeAlert}>
                <Alert onClose={closeAlert} severity={alertStatus}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}