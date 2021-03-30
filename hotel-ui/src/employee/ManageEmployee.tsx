import {
    Button,
    Divider,
    Grid,
    GridList,
    GridListTile,
    makeStyles,
    Paper,
    Typography
} from "@material-ui/core";
import React, {useState} from "react";
import {Employee, HotelAlert, Severity, TitleBarEmployee} from "../index";
import {useLocation} from "react-router-dom";
import {CreateEmployeeDialog} from "./employeeDialogs/CreateEmployeeDialog";
import {EditEmployeeDialog} from "./employeeDialogs/EditEmployeeDialog";

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
    },
    dialogGap: {
        marginBottom: '2em'
    }
}));

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
    const [newDialogOpen, setNewDialogOpen]: [boolean, any] = useState(false);
    const [editDialogOpen, setEditDialogOpen]: [boolean, any] = useState(false);
    const [indexToEdit, setIndexToEdit]: [number, any] = useState(-1);

    //For edit profile
    const [employeeSalary, setEmployeeSalary]: [string, any] = useState('');
    const [employeeJobTitle, setEmployeeJobTitle]: [string, any] = useState('');

    function openAlert(message: string, status: Severity) {
        setAlertMessage(message);
        setAlertStatus(status);
        setAlertOpen(true);
    }

    async function deleteEmployee(emp: Employee, index: number) {
        let newStates = [...buttonStates]
        newStates[index] = true;
        setButtonStates(newStates);
        try {
            let response = await fetch(process.env.REACT_APP_SERVER_URL + "/hotels/" + location.state.hotelID + "/employees/" + emp.employee_sin, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    manager_sin: location.state.managerSIN,
                    status: 'quit'
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

    function editEmployee(index: number) {
        setIndexToEdit(index);
        setEmployeeSalary(employees[index].salary);
        setEmployeeJobTitle(employees[index].job_title);
        setEditDialogOpen(true);
    }

    return (
        <div className={classes.root}>
            <TitleBarEmployee/>
            <Typography className={classes.centreTitle}>Hotel Employees</Typography>
            <Typography
                className={classes.subTitle}>{location.state.brandName + ", " + location.state.hotelAddress}
            </Typography>
            <div className={classes.subTitle}>
                <Button variant='contained' onClick={() => setNewDialogOpen(true)}>New Employee</Button>
            </div>
            <GridList cols={1} cellHeight={210} className={classes.grid}>
                {
                    employees.map((emp: Employee, index: number) => {
                        return (
                            <GridListTile key={emp.employee_sin} cols={1}>
                                <Paper elevation={3} key={emp.employee_sin} className={classes.brandPaper}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid className={classes.brandGrid}>
                                            <Typography className={classes.empName}>{emp.employee_name}</Typography>
                                            <Typography>{emp.job_title}</Typography>
                                            <Typography>Email: {emp.employee_email}</Typography>
                                            <Typography>SIN: {emp.employee_sin}</Typography>
                                            <Typography>Address: {emp.employee_address}</Typography>
                                            <Typography>Salary: ${emp.salary}</Typography>
                                        </Grid>
                                        <Divider orientation="vertical" flexItem className={classes.divider}/>
                                        <Grid item xs={2}>
                                            <Grid className={classes.priceDiv}>
                                                <Button variant='contained' style={{marginBottom: '1.5em'}}
                                                        disabled={buttonStates[index]}
                                                        onClick={() => editEmployee(index)}>
                                                    Edit Profile
                                                </Button>
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
            <CreateEmployeeDialog dialogOpen={newDialogOpen} setDialogOpen={setNewDialogOpen} classes={classes}
                                  openAlert={openAlert} hotelID={location.state.hotelID} employees={employees}
                                  managerSIN={location.state.managerSIN} setEmployees={setEmployees}/>
            <EditEmployeeDialog dialogOpen={editDialogOpen} setDialogOpen={setEditDialogOpen} classes={classes}
                                openAlert={openAlert} hotelID={location.state.hotelID} employeeSalary={employeeSalary}
                                managerSIN={location.state.managerSIN} setEmployeeSalary={setEmployeeSalary}
                                employees={employees} setEmployees={setEmployees} eIndex={indexToEdit}
                                employeeJobTitle={employeeJobTitle} setEmployeeJobTitle={setEmployeeJobTitle}/>
            <HotelAlert alertOpen={alertOpen} closeAlert={() => setAlertOpen(false)} alertStatus={alertStatus}
                        alertMessage={alertMessage}/>
        </div>
    )
}