import {
    Button,
    Divider,
    Grid,
    GridList,
    GridListTile,
    makeStyles,
    Paper, TextField,
    Typography
} from "@material-ui/core";
import React, {useState} from "react";
import {BackButton, HotelAlert, openAlert, REACT_APP_SERVER_URL, Reservation, Severity, TitleBar} from "../index";
import {useHistory, useLocation} from "react-router-dom";
import {GetPaymentDialog} from "./employeeDialogs/GetPaymentDialog";

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        backgroundColor: theme.palette.background.paper,
    },
    centreTitle: {
        paddingTop: '1em',
        fontWeight: 'bold',
        fontSize: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    centreSubTitle: {
        paddingTop: '0.5em',
        fontSize: '1.4em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    brandPaper: {
        marginTop: '2em',
        marginLeft: '6em',
        marginRight: '6em',
        padding: '1em',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    hotelTitle: {
        fontWeight: 'bold',
        fontSize: '1.5em'
    },
    grid: {
        boxShadow: '0 0 3pt 1pt gray',
        height: '38em',
        width: '85%',
        marginTop: '10em',
        marginLeft: '10em',
    },
    divider: {
        marginLeft: '1em',
        marginRight: '1em'
    },
    hotelGrid: {
        width: '70%'
    },
    priceDiv: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    centreDiv: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1em',
        marginTop: '1em'
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
        marginBottom: '2em',
        marginLeft: '1em',
        marginRight: '1em'
    },
    formControl: {
        minWidth: '14em',
        marginBottom: '1em'
    }
}));

export interface ReservationAndButton {
    reservation: Reservation;
    disabled: boolean;
}


export default function CheckCustomer() {
    const classes = useStyles();
    const history = useHistory();

    const location = useLocation<{
        response: Reservation[];
        checkIn: boolean;
        employeeSIN: string;
        employeeData: any;
    }>();

    const reservationList = [...location.state.response];
    reservationList.sort((r1: Reservation, r2: Reservation) => (r1.check_in_day > r2.check_in_day) ? 1 : -1);
    const reservationButtonList: ReservationAndButton[] = new Array(reservationList.length);
    for (let i = 0; i < reservationButtonList.length; i++) {
        reservationButtonList[i] = {
            reservation: reservationList[i],
            disabled: false
        }
    }

    const [alertOpen, setAlertOpen]: [boolean, any] = useState(false);
    const [alertMessage, setAlertMessage]: [string, any] = useState("");
    const [alertStatus, setAlertStatus]: [Severity, any] = useState("success");
    const [reservations, setReservations]: [ReservationAndButton[], any] = useState(reservationButtonList);
    const [searchName, setSearchName]: [string, any] = useState("");
    const [showGetPayment, setShowGetPayment]: [boolean, any] = useState(false);

    const [index, setIndex]: [number, any] = useState(-1);

    const dateWords = new Date().toDateString();
    const subTitle = location.state.checkIn ? 'For ' + dateWords : 'Customers currently renting rooms'

    function setDisableButton(index: number, disabled: boolean) {
        const newReservations = [...reservations];
        newReservations[index].disabled = disabled;
        setReservations(newReservations);
    }

    async function checkOutReservation(index: number) {
        setDisableButton(index, true);
        const reservation = reservations[index].reservation;
        try {
            let response = await fetch(REACT_APP_SERVER_URL + "/customers/" + reservation.customer_sin + "/reservations/" + reservation.booking_id, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'Archived',
                    employee_sin: location.state.employeeSIN
                })
            })
            if (response.status === 204) {
                openAlert('Successfully checked out customer', 'success', setAlertMessage, setAlertStatus, setAlertOpen);
                const newReservations: ReservationAndButton[] = [...reservations];
                newReservations.splice(index, 1);
                setReservations(newReservations);
                return;
            } else {
                openAlert('Error: Unable to check out customer', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
            }
        } catch (error) {
            console.error('Error:', error);
            openAlert('Error: Unable to check out customer', 'error', setAlertMessage, setAlertStatus, setAlertOpen)
        }
        setDisableButton(index, false);
    }

    function getPayment(index: number) {
        setIndex(index);
        setShowGetPayment(true);
    }

    function GenerateReservations() {
        const filteredReservations = reservations.filter((r: ReservationAndButton) => r.reservation.customer_name.toLowerCase().includes(searchName.toLowerCase()));
        if (filteredReservations.length === 0) {
            return (
                <GridList cols={1} cellHeight={220} className={classes.grid}>
                    <GridListTile cols={1}>
                        <Typography className={classes.centreSubTitle}>No reservations found!</Typography>
                    </GridListTile>
                </GridList>
            )
        }

        return <GridList cols={1} cellHeight={220} className={classes.grid}>
            {
                filteredReservations.map((r: ReservationAndButton, index: number) => {
                    const reservation = r.reservation;
                    const checkIn: Date = new Date(reservation.check_in_day.replace('-', '/'))
                    const checkOut: Date = new Date(reservation.check_out_day.replace('-', '/'))
                    const days: number = Math.round(Math.abs(+checkIn - +checkOut) / 24 / 60 / 60 / 1000)
                    const totalPrice: string = (days * parseFloat(reservation.price)).toFixed(2)

                    if (reservation.amenities.length === 0) {
                        reservation.amenities.push("None")
                    }

                    return (
                        <GridListTile key={reservation.booking_id} cols={1}>
                            <Paper elevation={3} key={reservation.booking_id} className={classes.brandPaper}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid className={classes.hotelGrid}>
                                        <Typography
                                            className={classes.hotelTitle}>Room: {reservation.title} | {reservation.check_in_day} to {reservation.check_out_day}
                                        </Typography>
                                        <Typography>Customer name: {reservation.customer_name}</Typography>
                                        <Typography>Customer SIN: {reservation.customer_sin}</Typography>
                                        <Typography>Amenities: {reservation.amenities.join(', ')}</Typography>
                                        <Typography>View: {reservation.view}</Typography>
                                        <Typography>
                                            Extendable: {reservation.is_extendable ? "Yes" : "No"}
                                        </Typography>
                                    </Grid>
                                    <Divider orientation="vertical" flexItem className={classes.divider}/>
                                    <Grid item xs={3}>
                                        <Grid className={classes.priceDiv}>
                                            <Typography>Booked on {reservation.date_of_registration}</Typography>
                                            <Typography className={classes.hotelTitle}>Total price:</Typography>
                                            <Typography className={classes.hotelTitle}>${totalPrice}</Typography>
                                            <br/>
                                            <Button variant='contained'
                                                    onClick={() => location.state.checkIn ? getPayment(index) : checkOutReservation(index)}
                                                    disabled={r.disabled}>
                                                {location.state.checkIn ? "Check In" : "Check Out"}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </GridListTile>
                    );
                })
            }
        </GridList>
    }

    return (
        <div className={classes.root}>
            <TitleBar history={history} userType='employee'/>
            <Typography
                className={classes.centreTitle}>Customer {location.state.checkIn ? 'Check In' : 'Check Out'}</Typography>
            <Typography className={classes.centreSubTitle}>{subTitle}</Typography>
            <div className={classes.centreDiv}>
                <TextField label="Search by Customer Name" variant="outlined" value={searchName}
                           onChange={event => setSearchName(event.currentTarget.value)}/>
            </div>
            <GenerateReservations/>
            <GetPaymentDialog dialogOpen={showGetPayment} setDialogOpen={setShowGetPayment} classes={classes}
                              setAlertMessage={setAlertMessage} setAlertStatus={setAlertStatus}
                              setAlertOpen={setAlertOpen} employeeSIN={location.state.employeeSIN} index={index}
                              reservations={reservations} setReservations={setReservations}/>
            <HotelAlert alertOpen={alertOpen} closeAlert={() => setAlertOpen(false)} alertStatus={alertStatus}
                        alertMessage={alertMessage}/>
            <div style={{height: '1.5em', width: '100%'}}/>
            <BackButton message={'Back'} history={history} url={'/ui/employee/welcome'}
                        state={location.state.employeeData}/>
        </div>
    )
}