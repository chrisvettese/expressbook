import {
    Button,
    Divider,
    Grid,
    GridList,
    GridListTile,
    makeStyles,
    Paper, Snackbar, TextField,
    Typography
} from "@material-ui/core";
import React, {useState} from "react";
import {Severity, TitleBarCustomer} from "../index";
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
    }
}));

interface Reservation {
    booking_id: number;
    date_of_registration: string;
    check_in_day: string;
    check_out_day: string;
    title: string;
    is_extendable: boolean;
    amenities: string[];
    view: string;
    price: string;
    customer_sin: string;
    customer_name: string;
}

const GenerateReservations = ({
                                  classes,
                                  reservations,
                                  editButtonToDisable,
                                  setEditButtonToDisable,
                                  setAlertMessage,
                                  setAlertStatus,
                                  setAlertOpen,
                                  setReservations,
                                  isCheckIn,
                                  searchSIN,
                                  employeeSIN
                              }: any) => {

    const filteredReservations = reservations.filter((reservation: Reservation) => reservation.customer_sin.includes(searchSIN));
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
            filteredReservations.map((reservation: Reservation, index: number) => {
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
                                                onClick={() => patchReservation(isCheckIn ? 'Renting' : 'Archived', setEditButtonToDisable, reservations, reservation, setAlertMessage, setAlertStatus, setAlertOpen, setReservations, index, employeeSIN)}
                                                disabled={editButtonToDisable === reservation.booking_id}>
                                            {isCheckIn ? "Check In" : "Check Out"}
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

async function patchReservation(action: string, setEditButtonToDisable: any, reservations: Reservation[], reservation: Reservation, setAlertMessage: any, setAlertStatus: any, setAlertOpen: any, setReservations: any, index: number, employeeSIN: string) {
    setEditButtonToDisable(reservation.booking_id);
    try {
        let response = await fetch(process.env.REACT_APP_SERVER_URL + "/customers/" + reservation.customer_sin + "/reservations/" + reservation.booking_id, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: action,
                employee_sin: employeeSIN
            })
        })
        if (response.status === 204) {
            if (action === 'Renting') {
                openAlert('Successfully checked in customer', 'success', setAlertMessage, setAlertStatus, setAlertOpen);
            } else {
                openAlert('Successfully checked out customer', 'success', setAlertMessage, setAlertStatus, setAlertOpen);
            }
            const newReservations: Reservation[] = [...reservations];
            newReservations.splice(index, 1);
            setReservations(newReservations);
        } else {
            openAlert('Error: Unable to modify reservation', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
        }
    } catch (error) {
        console.error('Error:', error);
        openAlert('Error: Unable to modify reservation', 'error', setAlertMessage, setAlertStatus, setAlertOpen)
    }
    setEditButtonToDisable(-1);
}

function openAlert(message: string, status: string, setAlertMessage: any, setAlertStatus: any, setAlertOpen: any) {
    setAlertMessage(message);
    setAlertStatus(status);
    setAlertOpen(true);
}

export default function CheckCustomer() {
    const classes = useStyles();
    const location = useLocation<{
        response: Reservation[];
        checkIn: boolean;
        employeeSIN: string;
    }>();

    location.state.response.sort((r1: Reservation, r2: Reservation) => (r1.check_in_day > r2.check_in_day) ? 1 : -1);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus]: [Severity, any] = useState("success");
    const [editButtonToDisable, setEditButtonToDisable]: [number, any] = useState(-1);
    const [reservations, setReservations]: [Reservation[], any] = useState([...location.state.response]);
    const [searchSIN, setSearchSIN]: [string, any] = useState("");

    const dateWords = new Date().toDateString();
    const subTitle = location.state.checkIn ? 'For ' + dateWords : 'Customers currently renting rooms'

    function closeAlert() {
        setAlertOpen(false);
    }

    return (
        <div className={classes.root}>
            <TitleBarCustomer/>
            <Typography
                className={classes.centreTitle}>Customer {location.state.checkIn ? 'Check In' : 'Check Out'}</Typography>
            <Typography className={classes.centreSubTitle}>{subTitle}</Typography>
            <div className={classes.centreDiv}>
                <TextField label="Search by SIN" variant="outlined" value={searchSIN}
                           onChange={event => setSearchSIN(event.currentTarget.value)}/>
            </div>
            <GenerateReservations classes={classes} reservations={reservations}
                                  editButtonToDisable={editButtonToDisable} employeeSIN={location.state.employeeSIN}
                                  setEditButtonToDisable={setEditButtonToDisable} setAlertMessage={setAlertMessage}
                                  setAlertStatus={setAlertStatus} setAlertOpen={setAlertOpen} searchSIN={searchSIN}
                                  setReservations={setReservations} isCheckIn={location.state.checkIn}/>
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={closeAlert}>
                <Alert onClose={closeAlert} severity={alertStatus}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}