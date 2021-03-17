import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import Employee from "./employee/Employee";
import SignInCustomer from "./customer/SignInCustomer";
import {AppBar, makeStyles, Typography} from "@material-ui/core";
import Name from "./customer/Name";
import WelcomeCustomer from "./customer/WelcomeCustomer";
import HotelBrand from "./customer/HotelBrand";
import Hotel from "./customer/Hotel";
import Reservations from "./customer/Reservations";
import Rooms from "./customer/Rooms";
import WelcomeEmployee from "./employee/WelcomeEmployee";
import CheckIn from "./employee/CheckIn";

require('dotenv').config()

const useTitleStyles = makeStyles(() => ({
    title: {
        fontSize: "2.5em",
        fontWeight: "bold",
        paddingLeft: "1em"
    }
}));

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

ReactDOM.render(
    <>
        <Router>
            <Switch>
                <Route exact path="/ui/employee" component={Employee}/>
                <Route exact path="/ui/employee/welcome" component={WelcomeEmployee}/>
                <Route exact path="/ui/employee/checkin" component={CheckIn}/>
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
