import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Switch,
    Route, RouteComponentProps
} from "react-router-dom";
import Employee from "./Employee";
import Customer from "./customer/Customer";
import {AppBar, makeStyles, Typography} from "@material-ui/core";
import Name from "./customer/Name";
import Welcome from "./customer/Welcome";

require('dotenv').config()

interface MatchParams {
    name: string;
}
export interface MatchProps extends RouteComponentProps<MatchParams> {
}

const useTitleStyles = makeStyles(() => ({
    title: {
        fontSize: "2.5em",
        fontWeight: "bold",
        paddingLeft: "1em"
    }
}));

export function TitleBar() {
    const classes = useTitleStyles();
    return <AppBar position="static">
        <Typography className={classes.title}>ExpressBook Customer Portal</Typography>
    </AppBar>
}

ReactDOM.render(
    <>
        <Router>
            <Switch>
                <Route exact path="/ui/employee" component={Employee}/>
                <Route exact path="/ui/customer" component={Customer}/>
                <Route exact path="/ui/customer/name" component={Name}/>
                <Route exact path="/ui/customer/welcome" component={Welcome}/>
            </Switch>
        </Router>
    </>,
    document.getElementById('root')
);
