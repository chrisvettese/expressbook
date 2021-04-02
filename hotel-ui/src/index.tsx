import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import SignInEmployee from "./employee/SignInEmployee";
import SignInCustomer from "./customer/SignInCustomer";
import {AppBar, Button, makeStyles, Snackbar, Toolbar, Typography} from "@material-ui/core";
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
import ManageRoom from "./employee/ManageRoom";

const useTitleStyles = makeStyles(() => ({
    title: {
        fontSize: "2.5em",
        fontWeight: "bold",
        paddingLeft: "1em"
    }
}));

export const REACT_APP_SERVER_URL: string = 'http://localhost:1234/service';

export type Severity = "error" | "success" | "info" | "warning" | undefined;

export type EmployeeStatus = "hired" | "quit";

export interface GetEmployeeResponse {
    employee_sin: string;
    employee_name: string;
    employee_address: string;
    employee_email: string;
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
    employee_email: string;
    employee_name: string;
    employee_address: string;
    salary: string;
    job_title: string;
}

export interface Reservation {
    booking_id: number;
    date_of_registration: string;
    check_in_day: string;
    check_out_day: string;
    title: string;
    is_extendable: boolean;
    amenities: string[];
    view: string;
    price: string;
    customer_sin: string;
    customer_name: string;
}

interface TitleType {
    userType: string;
    history: any;
}

function SignOut({userType, history}: TitleType) {
    if (window.location.pathname === '/ui/' + userType || window.location.pathname === '/ui/' + userType + '/name') {
        return <></>
    }
    return <div style={{position: 'absolute', right: '1em'}}>
        <Button color="inherit" onClick={() => history.push('/ui/' + userType)}>Sign Out</Button>
    </div>
}

export function TitleBar({userType, history}: TitleType) {
    const classes = useTitleStyles();
    const userTitle = userType.charAt(0).toUpperCase() + userType.slice(1);
    return <AppBar position="static">
        <Toolbar>
            <Typography className={classes.title}>ExpressBook {userTitle} Portal</Typography>
            <SignOut userType={userType} history={history}/>
        </Toolbar>
    </AppBar>
}

export function openAlert(message: string, status: string, setAlertMessage: any, setAlertStatus: any, setAlertOpen: any) {
    setAlertMessage(message);
    setAlertStatus(status);
    setAlertOpen(true);
}

export const phoneRegex: RegExp = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
export const sinRegex: RegExp = /^[0-9]{3}-[0-9]{3}-[0-9]{3}$/;

interface AlertType {
    alertOpen: boolean;
    closeAlert: any;
    alertStatus: Severity;
    alertMessage: string
}

interface BackType {
    message: string;
    history: any;
    url: string;
    state: object;
}

export function HotelAlert({alertOpen, closeAlert, alertStatus, alertMessage}: AlertType) {
    return <Snackbar open={alertOpen} autoHideDuration={6000} onClose={closeAlert}>
        <Alert onClose={closeAlert} severity={alertStatus}>
            {alertMessage}
        </Alert>
    </Snackbar>
}

export function BackButton(backProps: BackType) {
    return (
        <div style={{bottom: '1em', left: '50%'}}>
            <Button variant='contained' onClick={() => backProps.history.push(backProps.url, backProps.state)}>
                {backProps.message}
            </Button>
        </div>
    )
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
                <Route exact path="/ui/employee/manageroom" component={ManageRoom}/>
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
