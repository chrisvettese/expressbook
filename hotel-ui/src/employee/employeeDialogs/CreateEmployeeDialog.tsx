import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogTitle, InputAdornment, TextField, Typography} from "@material-ui/core";
import {GetEmployeeResponse, REACT_APP_SERVER_URL, sinRegex} from "../../index";

interface AMessage {
    isNewEmail: boolean;
}

interface AInfo {
    isNewEmail: boolean;
    classes: any;
    showInfo: boolean;
    sinHelper: string;
    nameHelper: string;
    addressHelper: string;
    salaryHelper: string;
    jobHelper: string;
    setEmployeeSIN: any;
    setEmployeeName: any;
    setEmployeeAddress: any;
    setEmployeeSalary: any;
    setEmployeeJobTitle: any;
    sinError: boolean;
    nameError: boolean;
    addressError: boolean;
    salaryError: boolean;
    jobError: boolean;
    employeeSIN: string;
    employeeName: string;
    employeeAddress: string;
    employeeSalary: string;
    employeeJobTitle: string;
}

function AdditionalMessage({isNewEmail}: AMessage) {
    if (isNewEmail) {
        return <Typography style={{marginBottom: '1em'}}>Please enter details for new employee:</Typography>
    } else {
        return <Typography style={{marginBottom: '1em'}}>Please confirm details for employee:</Typography>
    }
}

function AdditionalInfo(aInfo: AInfo) {
    if (aInfo.showInfo) {
        return (
            <>
                <AdditionalMessage isNewEmail={aInfo.isNewEmail}/>
                <TextField label="Name" variant="outlined" value={aInfo.employeeName} error={aInfo.nameError}
                           helperText={aInfo.nameError ? aInfo.nameHelper : ""} className={aInfo.classes.dialogGap}
                           onChange={event => aInfo.setEmployeeName(event.currentTarget.value)}/>
                <TextField label="Employee SIN" variant="outlined" value={aInfo.employeeSIN} error={aInfo.sinError}
                           helperText={aInfo.sinError ? aInfo.sinHelper : ""} className={aInfo.classes.dialogGap}
                           onChange={event => aInfo.setEmployeeSIN(event.currentTarget.value)}/>
                <TextField label="Address" variant="outlined" value={aInfo.employeeAddress} error={aInfo.addressError}
                           helperText={aInfo.addressError ? aInfo.addressHelper : ""}
                           className={aInfo.classes.dialogGap}
                           onChange={event => aInfo.setEmployeeAddress(event.currentTarget.value)}/>
                <TextField label="Salary" variant="outlined" value={aInfo.employeeSalary} error={aInfo.salaryError}
                           helperText={aInfo.salaryError ? aInfo.salaryHelper : ""} type="number"
                           className={aInfo.classes.dialogGap}
                           onChange={event => aInfo.setEmployeeSalary(event.currentTarget.value)}
                           InputProps={{
                               startAdornment: <InputAdornment position="start">$</InputAdornment>,
                           }}/>
                <TextField label="Job Title" variant="outlined" value={aInfo.employeeJobTitle} error={aInfo.jobError}
                           helperText={aInfo.jobHelper} className={aInfo.classes.dialogGap}
                           onChange={event => aInfo.setEmployeeJobTitle(event.currentTarget.value)}/>
            </>
        )
    } else {
        return <></>
    }
}

export const CreateEmployeeDialog = ({
                                         dialogOpen, setDialogOpen,
                                         classes,
                                         openAlert,
                                         hotelID, managerSIN,
                                         employees, setEmployees
                                     }: any) => {
    const [emailError, setEmailError]: [boolean, any] = useState(false);
    const [sinError, setSINError]: [boolean, any] = useState(false);
    const [nameError, setNameError]: [boolean, any] = useState(false);
    const [addressError, setAddressError]: [boolean, any] = useState(false);
    const [salaryError, setSalaryError]: [boolean, any] = useState(false);
    const [jobError, setJobError]: [boolean, any] = useState(false);

    const [emailHelper, setEmailHelper]: [string, any] = useState('');
    const [sinHelper, setSINHelper]: [string, any] = useState('');
    const [nameHelper, setNameHelper]: [string, any] = useState('');
    const [addressHelper, setAddressHelper]: [string, any] = useState('');
    const [salaryHelper, setSalaryHelper]: [string, any] = useState('');
    const [jobHelper, setJobHelper]: [string, any] = useState('');

    const [disableCheck, setDisableCheck]: [boolean, any] = useState(false);
    const [disableCreateEmployee, setDisableCreateEmployee]: [boolean, any] = useState(true);

    const [showInfo, setShowInfo]: [boolean, any] = useState(false);

    const [employeeEmail, setEmployeeEmail]: [string, any] = useState("");
    const [employeeSIN, setEmployeeSIN]: [string, any] = useState("");
    const [employeeName, setEmployeeName]: [string, any] = useState("");
    const [employeeAddress, setEmployeeAddress]: [string, any] = useState("");
    const [employeeSalary, setEmployeeSalary]: [string, any] = useState("");
    const [employeeJobTitle, setEmployeeJobTitle]: [string, any] = useState("");

    const [isNewEmail, setIsNewEmail]: [boolean, any] = useState(false);

    async function validateEmployeeEmail() {
        setDisableCheck(true);

        let isEmailError: boolean = employeeEmail.includes(' ') || employeeEmail.indexOf('@') < 1
        if (!isEmailError) {
            const index: number = employeeEmail.indexOf('.', employeeEmail.indexOf('@'))
            if (index < 3 || index === employeeEmail.length - 1) {
                isEmailError = true;
            }
        }
        setEmailError(isEmailError);

        if (isEmailError) {
            setEmailHelper("Must enter valid email");
            setDisableCheck(false);
            setShowInfo(false);
            setEmployeeSIN("");
            setEmployeeName("");
            setEmployeeJobTitle("");
            setEmployeeSalary("");
            setEmployeeAddress("");
            return;
        } else {
            setEmailHelper("");
        }

        try {
            let response = await fetch(REACT_APP_SERVER_URL + "/employees?email=" + employeeEmail);
            if (response.status === 200) {
                const employeeResponse: GetEmployeeResponse[] = await response.json();
                if (employeeResponse.length === 0) {
                    if (!setShowInfo) {
                        setEmailHelper("");
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
                    setIsNewEmail(true);
                    openAlert("Employee email validated", "success")
                } else {
                    if (employeeResponse[0].status === 'hired') {
                        setEmailHelper("Invalid email. Employee with email already exists!");
                        setEmailError(true);
                    } else {
                        setIsNewEmail(false);
                        setSINError(false);
                        setDisableCheck(false);
                        setSINHelper("");
                        setDisableCreateEmployee(false);
                        //Show additional info filled out
                        setEmployeeAddress(employeeResponse[0].employee_address);
                        setEmployeeName(employeeResponse[0].employee_name);
                        setEmployeeJobTitle(employeeResponse[0].job_title);
                        setEmployeeSalary(employeeResponse[0].salary);
                        setEmployeeSIN(employeeResponse[0].employee_sin);
                        setShowInfo(true);
                        openAlert('Existing profile found', 'success');
                    }
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
        const validateEmployeeSIN = sinRegex.test(employeeSIN);
        console.log(validateEmployeeSIN);
        setNameError(!validateName);
        setAddressError(!validateAddress);
        setSalaryError(!validateSalary);
        setJobError(!validateJobTitle);
        setSINError(!validateEmployeeSIN);

        if (!validateName) {
            setNameHelper('Must enter valid name for employee')
        }
        if (!validateAddress) {
            setAddressHelper('Must enter valid address for employee')
        }
        if (!validateSalary) {
            setSalaryHelper('Must enter valid salary for employee')
        }
        if (!validateEmployeeSIN) {
            setSINHelper('Must enter employee SIN in format XXX-XXX-XXX')
        }
        if (!validateJobTitle) {
            setJobHelper('Must enter valid job title for employee')
        }
        if (!validateName || !validateAddress || !validateSalary || !validateJobTitle || !validateEmployeeSIN) {
            setDisableCreateEmployee(false);
            return;
        }

        const fixedESalary: string = parseFloat(employeeSalary).toFixed(2)
        if (isNewEmail) {
            try {
                let response = await fetch(REACT_APP_SERVER_URL + "/hotels/" + hotelID + "/employees", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        employee_sin: employeeSIN,
                        email: employeeEmail,
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
                        employee_email: employeeEmail,
                        employee_address: employeeAddress,
                        salary: fixedESalary,
                        job_title: employeeJobTitle,
                    });
                    setEmployees(newEmployees);
                    closeDialog();
                } else if (response.status === 409) {
                    setSINError(true);
                    setSINHelper("Employee with SIN already exists");
                } else {
                    openAlert('Error: Unable to add employee', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                openAlert('Error: Unable to add employee', 'error');
            }
        } else {
            try {
                let response = await fetch(REACT_APP_SERVER_URL + "/hotels/" + hotelID + "/employees/" + employeeSIN, {
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
                        employee_email: employeeEmail,
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
        setEmailError(false);
        setNameError(false);
        setAddressError(false);
        setSalaryError(false);
        setJobError(false);
        setDisableCheck(false);
        setEmailHelper("");
        setSINHelper("");
        setNameHelper("");
        setAddressHelper("");
        setJobHelper("");
        setSalaryHelper("");
        setEmployeeSIN("");
        setEmployeeEmail("");
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
            <TextField label="Employee Email" variant="outlined" value={employeeEmail} error={emailError}
                       helperText={emailHelper} className={classes.dialogGap}
                       onChange={event => {
                           setEmployeeEmail(event.currentTarget.value);
                           setDisableCreateEmployee(true);
                           setShowInfo(false);
                           setEmployeeName("");
                           setEmployeeSIN("");
                           setEmployeeAddress("");
                           setEmployeeSalary("");
                           setEmployeeJobTitle("");
                       }}/>
            <Button variant='contained' disabled={disableCheck} onClick={validateEmployeeEmail}
                    className={classes.dialogGap}>Check Email</Button>
            <AdditionalInfo addressError={addressError} addressHelper={addressHelper} classes={classes}
                            employeeAddress={employeeAddress} employeeJobTitle={employeeJobTitle}
                            employeeName={employeeName} employeeSalary={employeeSalary} isNewEmail={isNewEmail}
                            jobError={jobError} jobHelper={jobHelper} nameError={nameError} nameHelper={nameHelper}
                            salaryError={salaryError} salaryHelper={salaryHelper}
                            setEmployeeAddress={setEmployeeAddress} setEmployeeJobTitle={setEmployeeJobTitle}
                            setEmployeeName={setEmployeeName} setEmployeeSalary={setEmployeeSalary}
                            showInfo={showInfo} employeeSIN={employeeSIN} setEmployeeSIN={setEmployeeSIN}
                            sinError={sinError} sinHelper={sinHelper}/>
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