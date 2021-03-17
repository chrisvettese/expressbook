import {
    Button,
    Divider, FormControlLabel,
    Grid,
    GridList,
    GridListTile,
    makeStyles,
    Paper, Radio, RadioGroup, Snackbar,
    Typography
} from "@material-ui/core";
import React, {useState} from "react";
import {TitleBarCustomer} from "../index";
import {useLocation} from "react-router-dom";
import {Alert} from "@material-ui/lab";

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        backgroundColor: theme.palette.background.paper,

    },
    centreTitle: {
        paddingTop: '2em',
        fontWeight: 'bold',
        fontSize: '2em',
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
    radioGroup: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1em'
    }
}));

type Reservation = {
    booking_id: number;
    physical_address: string;
    date_of_registration: string;
    check_in_day: string;
    check_out_day: string;
    status: string;
    title: string;
    is_extendable: boolean;
    amenities: string[];
    view: string;
    price: string;
}

type Severity = "error" | "success" | "info" | "warning" | undefined;

const GenerateReservations = ({
                                  classes,
                                  reservations,
                                  editButtonToDisable,
                                  radioState,
                                  setEditButtonToDisable,
                                  setAlertMessage,
                                  setAlertStatus,
                                  setAlertOpen,
                                  customerSIN,
                                  setReservations
                              }: any) => {

    return <GridList cols={1} cellHeight={220} className={classes.grid}>
        {
            reservations.filter((reservation: Reservation) => {
                return !((radioState === 1 && reservation.status !== 'Renting')
                    || (radioState === 2 && reservation.status !== 'Booked')
                    || (radioState === 3 && reservation.status !== 'Archived' && reservation.status !== 'Cancelled'))
            }).map((reservation: Reservation) => {
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
                                    <Typography>{reservation.physical_address}</Typography>
                                    <Typography>Booking status: {reservation.status}</Typography>
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
                                        <ReservationEditButton reservation={reservation}
                                                               reservations={reservations}
                                                               setEditButtonToDisable={setEditButtonToDisable}
                                                               editButtonToDisable={editButtonToDisable}
                                                               setAlertMessage={setAlertMessage}
                                                               setAlertStatus={setAlertStatus}
                                                               setAlertOpen={setAlertOpen}
                                                               customerSIN={customerSIN}
                                                               setReservations={setReservations}/>
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

type ReservationEditProps = {
    reservation: Reservation;
    reservations: Reservation[];
    editButtonToDisable: number;
    setEditButtonToDisable: any;
    setAlertMessage: any;
    setAlertStatus: any;
    setAlertOpen: any;
    customerSIN: string;
    setReservations: any;
}

const ReservationEditButton = ({
                                   reservation,
                                   reservations,
                                   editButtonToDisable,
                                   setEditButtonToDisable,
                                   setAlertMessage,
                                   setAlertStatus,
                                   setAlertOpen,
                                   customerSIN,
                                   setReservations
                               }: ReservationEditProps) => {
    if (reservation.status === 'Renting') {
        return <Button variant='contained'
                       onClick={() => patchReservation('Archived', setEditButtonToDisable, reservations, reservation, setAlertMessage, setAlertStatus, setAlertOpen, customerSIN, setReservations)}
                       disabled={editButtonToDisable === reservation.booking_id}>Check Out</Button>
    }
    if (reservation.status === 'Booked') {
        return <Button variant='contained'
                       onClick={() => patchReservation('Cancelled', setEditButtonToDisable, reservations, reservation, setAlertMessage, setAlertStatus, setAlertOpen, customerSIN, setReservations)}
                       disabled={editButtonToDisable === reservation.booking_id}>Cancel</Button>
    }
    return <></>
}

async function patchReservation(action: string, setEditButtonToDisable: any, reservations: Reservation[], reservation: Reservation, setAlertMessage: any, setAlertStatus: any, setAlertOpen: any, customerSIN: string, setReservations: any) {
    setEditButtonToDisable(reservation.booking_id);
    try {
        let response = await fetch(process.env.REACT_APP_SERVER_URL + "/customers/" + customerSIN + "/reservations/" + reservation.booking_id, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: action
            })
        })
        if (response.status === 204) {
            if (action === 'Archived') {
                updateReservations([...reservations], reservation.booking_id, 'Archived', setReservations);
                openAlert('Successfully checked out of hotel', 'success', setAlertMessage, setAlertStatus, setAlertOpen);

            } else {
                updateReservations([...reservations], reservation.booking_id, 'Cancelled', setReservations);
                openAlert('Successfully cancelled room booking', 'success', setAlertMessage, setAlertStatus, setAlertOpen)
            }
        } else {
            openAlert('Error: Unable to modify reservation', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
        }
    } catch (error) {
        console.error('Error:', error);
        openAlert('Error: Unable to modify reservation', 'error', setAlertMessage, setAlertStatus, setAlertOpen)
    }
    setEditButtonToDisable(-1);
}

function updateReservations(reservations: Reservation[], bookingID: number, status: string, setReservations: any) {
    for (let i = 0; i < reservations.length; i++) {
        if (reservations[i].booking_id === bookingID) {
            reservations[i].status = status;
            setReservations(reservations);
            return;
        }
    }
}

function openAlert(message: string, status: string, setAlertMessage: any, setAlertStatus: any, setAlertOpen: any) {
    setAlertMessage(message);
    setAlertStatus(status);
    setAlertOpen(true);
}

export default function Reservations() {
    const classes = useStyles();
    const location = useLocation<{
        customerName: string;
        customerSIN: string,
        response: Reservation[]
    }>();

    location.state.response.sort((r1: Reservation, r2: Reservation) => (r1.check_in_day > r2.check_in_day) ? 1 : -1);

    const [radioState, setRadioState] = useState(0);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus]: [Severity, any] = useState("success");
    const [editButtonToDisable, setEditButtonToDisable]: [number, any] = useState(-1);
    const [reservations, setReservations]: [Reservation[], any] = useState([...location.state.response]);

    function closeAlert() {
        setAlertOpen(false);
    }

    function setReservationRadioState(event: React.ChangeEvent<HTMLInputElement>) {
        const value = parseInt(event.target.value);
        setRadioState(value);
    }

    return (
        <div className={classes.root}>
            <TitleBarCustomer/>
            <Typography className={classes.centreTitle}>My Reservations - {location.state.customerName}</Typography>
            <RadioGroup className={classes.radioGroup} value={radioState} onChange={e => setReservationRadioState(e)}
                        row>
                <Typography>Filter by:&nbsp;&nbsp;&nbsp;</Typography>
                <FormControlLabel value={0} control={<Radio/>} label="All Reservations"/>
                <FormControlLabel value={1} control={<Radio/>} label="Ongoing"/>
                <FormControlLabel value={2} control={<Radio/>} label="Upcoming"/>
                <FormControlLabel value={3} control={<Radio/>} label="Cancelled/Archived"/>
            </RadioGroup>
            <GenerateReservations classes={classes} reservations={reservations}
                                  editButtonToDisable={editButtonToDisable} radioState={radioState}
                                  setEditButtonToDisable={setEditButtonToDisable} setAlertMessage={setAlertMessage}
                                  setAlertStatus={setAlertStatus} setAlertOpen={setAlertOpen}
                                  customerSIN={location.state.customerSIN} setReservations={setReservations}/>
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={closeAlert}>
                <Alert onClose={closeAlert} severity={alertStatus}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}