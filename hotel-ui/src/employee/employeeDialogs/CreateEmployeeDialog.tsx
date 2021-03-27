import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogTitle, InputAdornment, TextField, Typography} from "@material-ui/core";
import {GetEmployeeResponse} from "../../index";

export const CreateEmployeeDialog = ({
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
    const [disableCreateEmployee, setDisableCreateEmployee]: [boolean, any] = useState(true);

    const [showInfo, setShowInfo]: [boolean, any] = useState(false);

    const [employeeSIN, setEmployeeSIN]: [string, any] = useState("");
    const [employeeName, setEmployeeName]: [string, any] = useState("");
    const [employeeAddress, setEmployeeAddress]: [string, any] = useState("");
    const [employeeSalary, setEmployeeSalary]: [string, any] = useState("");
    const [employeeJobTitle, setEmployeeJobTitle]: [string, any] = useState("");

    const [isNewSIN, setIsNewSIN]: [boolean, any] = useState(false);

    function AdditionalMessage() {
        if (isNewSIN) {
            return <Typography>Please enter details for new employee:</Typography>
        } else {
            return <Typography>Please confirm details for new employee:</Typography>
        }
    }

    function AdditionalInfo() {
        if (showInfo) {
            return (
                <>
                    <AdditionalMessage/>
                    <br/>
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
            setSINHelper("");
            setEmployeeName("");
            setEmployeeJobTitle("");
            setEmployeeSalary("");
            setEmployeeAddress("");
            return;
        }

        try {
            let response = await fetch(process.env.REACT_APP_SERVER_URL + "/employees/" + employeeSIN);
            if (response.status === 404) {
                if (!setShowInfo) {
                    setSINHelper("");
                    setEmployeeName("");
                    setEmployeeJobTitle("");
                    setEmployeeSalary("");
                    setEmployeeAddress("");
                }
                setShowInfo(true);
                setSINError(false);
                setDisableCheck(false);
                setShowInfo(true);
                setDisableCreateEmployee(false);
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
            <AdditionalInfo/>
        </div>
        <DialogActions>
            <Button disabled={disableCreateEmployee}
                    onClick={() => createEmployee()}
                    variant="contained"
                    color="primary">
                Create Profile
            </Button>
            <Button onClick={() => closeDialog()} variant="contained" color="secondary">
                Cancel
            </Button>
        </DialogActions>
    </Dialog>
};