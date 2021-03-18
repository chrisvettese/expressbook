import {Button, makeStyles, Paper, Typography} from "@material-ui/core";
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
        marginTop: '2em'
    },
    buttonSpacing: {
        marginLeft: '1.5em',
        marginRight: '1.5em'
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
    }
}));

export default function WelcomeCustomer() {
    const classes = useStyles();
    const location = useLocation<{ customerSIN: string, customerName: string, customerAddress: string, customerEmail: string, customerPhone: string }>();
    const history = useHistory();
    const [disableHotelButton, setDisableHotelButton] = useState(false);
    const [disableReservationButton, setDisableReservationButton] = useState(false);

    const welcomeMessage = "Welcome, " + location.state.customerName;

    async function goToBrandPage() {
        setDisableHotelButton(true);
        try {
            let response: Response = await fetch(process.env.REACT_APP_SERVER_URL + "/brands");
            if (response.status !== 200) {
                setDisableHotelButton(false);
                return;
            }
            response = await response.json();
            history.push('/ui/customer/brands', {
                customerSIN: location.state.customerSIN,
                customerAddress: location.state.customerAddress,
                customerName: location.state.customerName,
                customerEmail: location.state.customerEmail,
                customerPhone: location.state.customerPhone,
                response: response
            });
        } catch (error) {
            console.error('Error:', error);
            setDisableHotelButton(false);
        }
    }

    async function goToReservationsPage() {
        setDisableReservationButton(true);
        try {
            let response: Response = await fetch(process.env.REACT_APP_SERVER_URL + "/customers/" + location.state.customerSIN + "/reservations");
            if (response.status !== 200) {
                setDisableReservationButton(false);
                return;
            }
            response = await response.json();
            history.push('/ui/customer/reservations', {
                customerName: location.state.customerName,
                customerSIN: location.state.customerSIN,
                response: response,
                isCustomer: true
            });
        } catch (error) {
            console.error('Error:', error);
            setDisableReservationButton(false);
        }
    }

    return (
        <>
            <TitleBarCustomer/>
            <Typography className={classes.centreTitle}>{welcomeMessage}</Typography>
            <Typography className={classes.centre}>Your profile:</Typography>
            <div className={classes.paperContainer}>
                <Paper elevation={3} className={classes.paper}>
                    <Typography className={classes.inPaper}>Address: {location.state.customerAddress}</Typography>
                    <Typography className={classes.inPaper}>Email: {location.state.customerEmail}</Typography>
                    <Typography className={classes.inPaper}>Phone number: {location.state.customerPhone}</Typography>
                </Paper>
            </div>
            <div className={classes.buttonCentre}>
                <Button variant="contained" className={classes.buttonSpacing} onClick={() => goToBrandPage()}
                        disabled={disableHotelButton}>Find A Hotel</Button>
                <Button variant="contained" onClick={() => goToReservationsPage()} disabled={disableReservationButton}>My
                    Reservations</Button>
            </div>
        </>
    )
}