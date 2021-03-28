import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import SignInEmployee from "./employee/SignInEmployee";
import SignInCustomer from "./customer/SignInCustomer";
import {AppBar, makeStyles, Snackbar, Typography} from "@material-ui/core";
import Name from "./customer/Name";
import WelcomeCustomer from "./customer/WelcomeCustomer";
import HotelBrand from "./customer/HotelBrand";
import Hotel from "./customer/Hotel";
import Reservations from "./Reservations";
import Rooms from "./Rooms";
import WelcomeEmployee from "./employee/WelcomeEmployee";
import CheckCustomer from "./employee/CheckCustomer";
import ManageCustomer from "./employee/ManageCustomer";
import ManageEmployee from "./employee/ManageEmployee";
import {Alert} from "@material-ui/lab";

require('dotenv').config()

const useTitleStyles = makeStyles(() => ({
    title: {
        fontSize: "2.5em",
        fontWeight: "bold",
        paddingLeft: "1em"
    }
}));

export type Severity = "error" | "success" | "info" | "warning" | undefined;

export type EmployeeStatus = "hired" | "quit";

export interface GetEmployeeResponse {
    employee_sin: string;
    employee_name: string;
    employee_address: string;
    salary: string;
    job_title: string;
    brand_name: string;
    brand_id: number;
    hotel_id: number;
    hotel_address: string;
    status: EmployeeStatus;
}

export interface Employee {
    employee_sin: string;
    employee_name: string;
    employee_address: string;
    salary: string;
    job_title: string;
}

export function TitleBarCustomer() {
    const classes = useTitleStyles();
    return <AppBar position="static">
        <Typography className={classes.title}>ExpressBook Customer Portal</Typography>
    </AppBar>
}

export function TitleBarEmployee() {
    const classes = useTitleStyles();
    return <AppBar position="static">
        <Typography className={classes.title}>ExpressBook Employee Portal</Typography>
    </AppBar>
}

export function openAlert(message: string, status: string, setAlertMessage: any, setAlertStatus: any, setAlertOpen: any) {
    setAlertMessage(message);
    setAlertStatus(status);
    setAlertOpen(true);
}

export const phoneRegex: RegExp = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;
export const sinRegex: RegExp = /^[0-9]{3}-[0-9]{3}-[0-9]{3}$/;

interface AlertType {
    alertOpen: boolean;
    closeAlert: any;
    alertStatus: Severity;
    alertMessage: string
}

export function HotelAlert({alertOpen, closeAlert, alertStatus, alertMessage}: AlertType) {
    return <Snackbar open={alertOpen} autoHideDuration={6000} onClose={closeAlert}>
        <Alert onClose={closeAlert} severity={alertStatus}>
            {alertMessage}
        </Alert>
    </Snackbar>
}

ReactDOM.render(
    <>
        <Router>
            <Switch>
                <Route exact path="/ui/employee" component={SignInEmployee}/>
                <Route exact path="/ui/employee/welcome" component={WelcomeEmployee}/>
                <Route exact path="/ui/employee/checkin" component={CheckCustomer}/>
                <Route exact path="/ui/employee/checkout" component={CheckCustomer}/>
                <Route exact path="/ui/employee/managecustomer" component={ManageCustomer}/>
                <Route exact path="/ui/employee/reservations" component={Reservations}/>
                <Route exact path="/ui/employee/rooms" component={Rooms}/>
                <Route exact path="/ui/employee/manageemployee" component={ManageEmployee}/>
                <Route exact path="/ui/customer" component={SignInCustomer}/>
                <Route exact path="/ui/customer/name" component={Name}/>
                <Route exact path="/ui/customer/welcome" component={WelcomeCustomer}/>
                <Route exact path="/ui/customer/brands" component={HotelBrand}/>
                <Route exact path="/ui/customer/hotels" component={Hotel}/>
                <Route exact path="/ui/customer/reservations" component={Reservations}/>
                <Route exact path="/ui/customer/rooms" component={Rooms}/>
            </Switch>
        </Router>
    </>,
    document.getElementById('root')
);
