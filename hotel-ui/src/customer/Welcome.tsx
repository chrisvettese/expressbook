import {Button, Card, Grid, makeStyles, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {TitleBar} from "../index";
import {useHistory, useLocation} from "react-router-dom";

const useStyles = makeStyles(() => ({
    centre: {
        paddingTop: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        marginTop: '2em'
    },
    buttonSpacing: {
        marginLeft: '1.5em',
        marginRight: '1.5em'
    }
}));

export default function Welcome() {
    const classes = useStyles();
    const location = useLocation<{ customer_sin: string, customer_name: string, customer_address: string }>();
    const history = useHistory();

    const welcomeMessage = "Welcome, " + location.state.customer_name
    const addressMessage = "Your address: " + location.state.customer_address

    return (
        <>
            <TitleBar/>
            <Typography className={classes.centreTitle}>{welcomeMessage}</Typography>
            <Typography className={classes.centre}>{addressMessage}</Typography>
            <div className={classes.buttonCentre}>
                <Button variant="contained" className={classes.buttonSpacing}>Find A Hotel</Button>
                <Button variant="contained" className={classes.buttonSpacing}>My Reservations</Button>
            </div>
        </>
    )
}