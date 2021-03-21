import {
    Button,
    Divider,
    Grid,
    GridList,
    GridListTile,
    makeStyles,
    Paper, Snackbar,
    Typography
} from "@material-ui/core";
import React, {useState} from "react";
import {Severity, TitleBarCustomer} from "../index";
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
        marginBottom: '1em'
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
    }
}));

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
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={closeAlert}>
                <Alert onClose={closeAlert} severity={alertStatus}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}