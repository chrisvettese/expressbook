import {Button, Grid, makeStyles, Paper, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {TitleBarCustomer} from "../index";
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
        marginTop: '1em'
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

    const welcomeMessage = location.state.brandName + ", " + location.state.hotelAddress

    function ManagerActions() {
        if (location.state.jobTitle === 'Manager') {
            return (
                <>
                    <Typography className={classes.centre}>Manager Actions:</Typography>
                    <br/>
                    <div className={classes.paperContainer}>
                        <Button variant="contained" color='primary'>
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
            <TitleBarCustomer/>
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
                <Grid container alignItems="center" justify="center" className={classes.topGrid}>
                    <Grid item xs className={classes.gridSpacing}>
                        <Grid item xs className={classes.buttonSpacing}>
                            <Button variant="contained" className={classes.buttonSpacing}>
                                Check In Customers
                            </Button>
                        </Grid>
                        <Grid item xs className={classes.buttonSpacing}>
                            <Button variant="contained" className={classes.buttonSpacing}>
                                Create Booking
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid item xs className={classes.gridSpacing}>
                        <Grid item xs className={classes.buttonSpacing}>
                            <Button variant="contained" className={classes.buttonSpacing}>
                                Check Out Customers
                            </Button>
                        </Grid>
                        <Grid item xs className={classes.buttonSpacing}>
                            <Button variant="contained" className={classes.buttonSpacing}>
                                Manage Customer
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
            <br/>
            <ManagerActions/>
        </>
    )
}