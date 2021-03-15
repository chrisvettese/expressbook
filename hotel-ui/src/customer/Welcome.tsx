import {Button, makeStyles, Typography} from "@material-ui/core";
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
    const [disableHotelButton, setDisableHotelButton] = useState(false);
    const [disableReservationButton, setDisableReservationButton] = useState(false);

    const welcomeMessage = "Welcome, " + location.state.customer_name;
    const addressMessage = "Your address: " + location.state.customer_address;

    async function goToBrandPage() {
        setDisableHotelButton(true);
        try {
            let response: Response = await fetch(process.env.REACT_APP_SERVER_URL + "/brands");
            if (response.status !== 200) {
                setDisableHotelButton(false);
                return;
            }
            response = await response.json()
            history.push('/ui/customer/brands', {customer_sin: location.state.customer_sin, response: response});
        } catch (error) {
            console.error('Error:', error);
            setDisableHotelButton(false);
        }
    }

    async function goToReservationsPage() {
        setDisableReservationButton(true);
        try {
            let response: Response = await fetch(process.env.REACT_APP_SERVER_URL + "/customers/" + location.state.customer_sin + "/reservations");
            if (response.status !== 200) {
                setDisableReservationButton(false);
                return;
            }
            response = await response.json();
            history.push('/ui/customer/reservations', {
                customer_name: location.state.customer_name,
                customer_sin: location.state.customer_sin,
                response: response
            });
        } catch (error) {
            console.error('Error:', error);
            setDisableReservationButton(false);
        }
    }

    return (
        <>
            <TitleBar/>
            <Typography className={classes.centreTitle}>{welcomeMessage}</Typography>
            <Typography className={classes.centre}>{addressMessage}</Typography>
            <div className={classes.buttonCentre}>
                <Button variant="contained" className={classes.buttonSpacing} onClick={() => goToBrandPage()}
                        disabled={disableHotelButton}>Find A Hotel</Button>
                <Button variant="contained" onClick={() => goToReservationsPage()} disabled={disableReservationButton}>My
                    Reservations</Button>
            </div>
        </>
    )
}