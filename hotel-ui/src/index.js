import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import Employee from "./Employee";
import Customer from "./Customer";

ReactDOM.render(
    <Router>
        <Switch>
            <Route path="/ui/employee">
                <Employee/>
            </Route>
            <Route path="/ui/customer">
                <Customer/>
            </Route>
        </Switch>
    </Router>,
    document.getElementById('root')
);
