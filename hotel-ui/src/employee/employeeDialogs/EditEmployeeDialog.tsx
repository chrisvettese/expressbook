import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogTitle, InputAdornment, TextField, Typography} from "@material-ui/core";
import {Employee} from "../../index";

interface EditEmployee {
    dialogOpen: boolean;
    setDialogOpen: any;
    classes: any;
    openAlert: any;
    hotelID: number;
    managerSIN: string;
    employees: Employee[];
    setEmployees: any;
    eIndex: number;
    employeeSalary: string;
    setEmployeeSalary: any;
    employeeJobTitle: string;
    setEmployeeJobTitle: any;
}

export const EditEmployeeDialog = ({
                                       dialogOpen, setDialogOpen,
                                       classes,
                                       openAlert,
                                       hotelID, managerSIN,
                                       employees, setEmployees, eIndex,
                                       employeeSalary, setEmployeeSalary,
                                       employeeJobTitle, setEmployeeJobTitle
                                   }: EditEmployee) => {

    const employee: Employee = employees[eIndex];

    const [salaryError, setSalaryError]: [boolean, any] = useState(false);
    const [jobError, setJobError]: [boolean, any] = useState(false);

    const [salaryHelper, setSalaryHelper]: [string, any] = useState('');
    const [jobHelper, setJobHelper]: [string, any] = useState('');

    const [disableUpdateEmployee, setDisableUpdateEmployee]: [boolean, any] = useState(false);

    if (employee === undefined) {
        return <></>
    }

    async function updateEmployee() {
        setDisableUpdateEmployee(true);
        const validateSalary = !Number.isNaN(employeeSalary) && parseFloat(employeeSalary) > 0;
        const validateJobTitle = employeeJobTitle.length > 0;

        setSalaryError(!validateSalary);
        setJobError(!validateJobTitle);

        if (!validateSalary) {
            setSalaryHelper('Must enter valid salary for employee')
        }
        if (!validateJobTitle) {
            setJobHelper('Must enter valid job title for employee')
        }
        if (!validateSalary || !validateJobTitle) {
            setDisableUpdateEmployee(false);
            return;
        }

        const fixedESalary: string = parseFloat(employeeSalary).toFixed(2)

        try {
            let response = await fetch(process.env.REACT_APP_SERVER_URL + "/hotels/" + hotelID + "/employees/" + employee.employee_sin, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    manager_sin: managerSIN,
                    salary: fixedESalary,
                    job_title: employeeJobTitle
                })
            })
            if (response.status === 204) {
                openAlert('Successfully updated profile', 'success');
                const newEmployees = [...employees];
                newEmployees[eIndex].salary = fixedESalary;
                newEmployees[eIndex].job_title = employeeJobTitle;
                setEmployees(newEmployees);
                closeDialog();
            } else {
                openAlert('Error: Unable to edit employee', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            openAlert('Error: Unable to edit employee', 'error');
        }
        setDisableUpdateEmployee(false);
    }

    function closeDialog() {
        setDialogOpen(false);
        setSalaryError(false);
        setJobError(false);
        setJobHelper("");
        setSalaryHelper("");
        setEmployeeSalary("");
        setEmployeeJobTitle("");
    }

    return <Dialog onClose={() => closeDialog()} aria-labelledby="simple-dialog-title" open={dialogOpen}>
        <DialogTitle id="dialog-title" className={classes.dialogTitle}>
            <Typography className={classes.dialogTitle}>Edit {employee.employee_name}'s Profile</Typography>
        </DialogTitle>
        <div className={classes.dialogAddress}>
            <TextField label="Salary" variant="outlined" value={employeeSalary} error={salaryError}
                       helperText={salaryHelper} type="number" className={classes.dialogGap}
                       onChange={event => setEmployeeSalary(event.currentTarget.value)}
                       InputProps={{
                           startAdornment: <InputAdornment position="start">$</InputAdornment>,
                       }}/>
            <TextField label="Job Title" variant="outlined" value={employeeJobTitle} error={jobError}
                       helperText={jobHelper} className={classes.dialogGap}
                       onChange={event => setEmployeeJobTitle(event.currentTarget.value)}/>
        </div>
        <DialogActions>
            <Button disabled={disableUpdateEmployee}
                    onClick={() => updateEmployee()}
                    variant="contained"
                    color="primary">
                Save Changes
            </Button>
            <Button onClick={() => closeDialog()} variant="contained" color="secondary">
                Cancel
            </Button>
        </DialogActions>
    </Dialog>
};