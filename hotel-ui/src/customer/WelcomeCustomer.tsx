import {Button, makeStyles, Paper, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {HotelAlert, Severity, TitleBarCustomer} from "../index";
import {useHistory, useLocation} from "react-router-dom";
import {EditCustomerProfileDialog} from "./customerDialogs/EditCustomerProfileDialog";

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
    },
    dialogTitle: {
        fontSize: "1.8em",
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    dialogAddress: {
        marginLeft: "0.5em",
        marginRight: "0.5em",
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    dialogGap: {
        marginBottom: '2em'
    }
}));

export default function WelcomeCustomer() {
    const classes = useStyles();
    const location = useLocation<{ customerSIN: string, customerName: string, customerAddress: string, customerEmail: string, customerPhone: string }>();
    const history = useHistory();
    const [disableHotelButton, setDisableHotelButton]: [boolean, any] = useState(false);
    const [disableReservationButton, setDisableReservationButton]: [boolean, any] = useState(false);
    const [dialogOpen, setDialogOpen]: [boolean, any] = useState(false);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus]: [Severity, any] = useState("success");

    const [customerName, setCustomerName]: [string, any] = useState(location.state.customerName);
    const [customerAddress, setCustomerAddress]: [string, any] = useState(location.state.customerAddress);
    const [customerEmail, setCustomerEmail]: [string, any] = useState(location.state.customerEmail);
    const [customerPhone, setCustomerPhone]: [string, any] = useState(location.state.customerPhone);

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
                customerAddress: customerAddress,
                customerName: customerName,
                customerEmail: customerEmail,
                customerPhone: customerPhone,
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
                customerName: customerName,
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
            <Typography className={classes.centreTitle}>{"Welcome, " + customerName}</Typography>
            <Typography className={classes.centre}>Your profile:</Typography>
            <div className={classes.paperContainer}>
                <Paper elevation={3} className={classes.paper}>
                    <Typography className={classes.inPaper}>Address: {customerAddress}</Typography>
                    <Typography className={classes.inPaper}>Email: {customerEmail}</Typography>
                    <Typography className={classes.inPaper}>Phone number: {customerPhone}</Typography>
                </Paper>
            </div>
            <div className={classes.buttonCentre}>
                <Button variant="contained" onClick={() => setDialogOpen(true)}>Edit Profile</Button>
            </div>
            <div className={classes.buttonCentre}>
                <Button variant="contained" className={classes.buttonSpacing} onClick={() => goToBrandPage()}
                        disabled={disableHotelButton}>Find A Hotel</Button>
                <Button variant="contained" onClick={() => goToReservationsPage()} disabled={disableReservationButton}>My
                    Reservations</Button>
            </div>
            <EditCustomerProfileDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} classes={classes}
                                       customerSIN={location.state.customerSIN} setAlertMessage={setAlertMessage}
                                       setAlertStatus={setAlertStatus} setAlertOpen={setAlertOpen}
                                       customerName={customerName} customerAddress={customerAddress}
                                       customerPhone={customerPhone} customerEmail={customerEmail}
                                       setCustomerName={setCustomerName} setCustomerAddress={setCustomerAddress}
                                       setCustomerPhone={setCustomerPhone} setCustomerEmail={setCustomerEmail}/>
            <HotelAlert alertOpen={alertOpen} closeAlert={() => setAlertOpen(false)} alertStatus={alertStatus}
                        alertMessage={alertMessage}/>
        </>
    )
}