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
import {TitleBar} from "../index";
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

interface Reservation {
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

export default function Reservations() {
    const classes = useStyles();
    const location = useLocation<{
        customer_name: string;
        customer_sin: string,
        response: Reservation[]
    }>();

    location.state.response.sort((r1: Reservation, r2: Reservation) => (r1.check_in_day > r2.check_in_day) ? 1 : -1);
    const ongoing: number[] = [];
    const upcoming: number[] = [];
    const past: number[] = [];
    const all: number[] = [];

    for (let i = 0; i < location.state.response.length; i++) {
        all.push(location.state.response[i].booking_id);
    }
    location.state.response.forEach((res: Reservation, index: number) => {
        if (res.status === 'Renting') {
            ongoing.push(location.state.response[index].booking_id);
        } else if (res.status === 'Booked') {
            upcoming.push(location.state.response[index].booking_id);
        } else {
            past.push(location.state.response[index].booking_id);
        }
    });

    const buttonStateValues: boolean[] = []
    for (let i = 0; i < location.state.response.length; i++) {
        buttonStateValues.push(false)
    }
    const [buttonStates, setButtonStates] = useState(buttonStateValues);
    const [radioState, setRadioState] = useState(0);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus]: [Severity, any] = useState("success");
    const [bookingIDs, setBookingIDs]: [number[], any] = useState(all);

    function openAlert(message: string, status: string) {
        setAlertMessage(message);
        setAlertStatus(status);
        setAlertOpen(true);
    }

    function closeAlert() {
        setAlertOpen(false);
    }

    async function patchReservation(action: string, bookingID: number) {
        let newStates = [...buttonStates]
        const reservation = bookingIDToReservation(bookingID);
        newStates[reservation.index] = true;
        setButtonStates(newStates);

        try {
            let response = await fetch(process.env.REACT_APP_SERVER_URL + "/customers/" + location.state.customer_sin + "/reservations/" + reservation.reservation.booking_id, {
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
                    ongoing.splice(ongoing.indexOf(bookingID), 1);
                    reservation.reservation.status = 'Archived';
                    past.push(bookingID)
                    setReservationIndices(radioState);
                    openAlert('Successfully checked out of hotel', 'success');

                } else {
                    upcoming.splice(upcoming.indexOf(bookingID), 1);
                    reservation.reservation.status = 'Cancelled';
                    past.push(bookingID)
                    setReservationIndices(radioState);
                    openAlert('Successfully cancelled room booking', 'success')
                }
            } else {
                let newStates = [...buttonStates]
                newStates[reservation.index] = false;
                setButtonStates(newStates);
                openAlert('Error: Unable to modify reservation', 'error')
            }
        } catch (error) {
            console.error('Error:', error);
            let newStates = [...buttonStates]
            newStates[reservation.index] = false;
            setButtonStates(newStates);
            openAlert('Error: Unable to modify reservation', 'error')
        }
    }

    function ReservationEditButton(props: { bookingID: number; }) {
        const res = bookingIDToReservation(props.bookingID);
        if (res.reservation.status === 'Renting') {
            return <Button variant='contained' onClick={() => patchReservation('Archived', props.bookingID)}
                           disabled={buttonStates[res.index]}>Check Out</Button>
        }
        if (res.reservation.status === 'Booked') {
            return <Button variant='contained' onClick={() => patchReservation('Cancelled', props.bookingID)}
                           disabled={buttonStates[res.index]}>Cancel</Button>
        }
        return <></>
    }

    function setReservationRadioState(event: React.ChangeEvent<HTMLInputElement>) {
        const value = parseInt(event.target.value);
        setRadioState(value);
        setReservationIndices(value);
    }

    function setReservationIndices(value: number) {
        if (value === 0) {
            setBookingIDs([...all]);
        } else if (value === 1) {
            setBookingIDs([...ongoing]);
        } else if (value === 2) {
            setBookingIDs([...upcoming]);
        } else {
            setBookingIDs([...past]);
        }
    }

    function bookingIDToReservation(bookingID: number): { reservation: Reservation, index: number } {
        for (let i = 0; i < location.state.response.length; i++) {
            const reservation = location.state.response[i];
            if (reservation.booking_id === bookingID) {
                return {reservation: reservation, index: i};
            }
        }
        return {
            reservation: {
                booking_id: -1,
                physical_address: '',
                date_of_registration: '',
                check_in_day: '',
                check_out_day: '',
                status: '',
                title: '',
                is_extendable: false,
                amenities: [],
                view: '',
                price: ''
            },
            index: -1
        }
    }


    function GenerateReservations(props: { reservations: number[] }) {
        return <GridList cols={1} cellHeight={220} className={classes.grid}>
            {
                props.reservations.map((bookingID: number) => {
                    const res = bookingIDToReservation(bookingID);
                    const reservation = res.reservation;
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
                                            <ReservationEditButton bookingID={bookingID}/>
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
            <TitleBar/>
            <Typography className={classes.centreTitle}>My Reservations - {location.state.customer_name}</Typography>
            <RadioGroup className={classes.radioGroup} value={radioState} onChange={e => setReservationRadioState(e)}
                        row>
                <Typography>Filter by:&nbsp;&nbsp;&nbsp;</Typography>
                <FormControlLabel value={0} control={<Radio/>} label="All Reservations"/>
                <FormControlLabel value={1} control={<Radio/>} label="Ongoing"/>
                <FormControlLabel value={2} control={<Radio/>} label="Upcoming"/>
                <FormControlLabel value={3} control={<Radio/>} label="Cancelled/Archived"/>
            </RadioGroup>
            <GenerateReservations reservations={bookingIDs}/>
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={closeAlert}>
                <Alert onClose={closeAlert} severity={alertStatus}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}