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
import {TitleBar} from "../index";
import {useLocation} from "react-router-dom";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from "@date-io/date-fns";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";

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
    centreTitleNoSpace: {
        fontWeight: 'bold',
        fontSize: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    smallerTitle: {
        fontSize: '1.7em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: '0.5em'
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
        marginTop: '10em'
    },
    outsideGrid: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        marginBottom: '2em'
    },
    divider: {
        marginLeft: '1em',
        marginRight: '1em',
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
    dateGrid: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    }
}));

interface Room {
    type_id: number;
    title: string;
    price: string;
    amenities: string[];
    room_capacity: number;
    view: string;
    is_extendable: boolean;
    total_number_rooms: number;
    rooms_available: number;
}

export default function Rooms() {
    const classes = useStyles();
    const location = useLocation<{
        address: string;
        customer_sin: string,
        response: Room[],
        brandName: string
    }>();

    const buttonStateValues: boolean[] = []
    for (let i = 0; i < location.state.response.length; i++) {
        buttonStateValues.push(true)
    }

    const [buttonStates, setButtonStates] = useState(buttonStateValues);
    const [checkInDate, setCheckInDate]: [MaterialUiPickersDate, any] = useState(new Date());
    const tomorrow: MaterialUiPickersDate = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1)
    const [checkOutDate, setCheckOutDate]: [MaterialUiPickersDate, any] = useState(tomorrow);
    const [numPeople, setNumPeople]: [number, any] = useState(1);

    function bookRoom(index: number) {

    }

    function setNumberOfPeople(num: number) {
        if (num > 0) {
            setNumPeople(num);
        }
    }

    function setCheckOut(date: MaterialUiPickersDate) {
        if (date !== null && checkInDate !== null) {
            if (date <= checkInDate) {
                const checkIn: MaterialUiPickersDate = new Date();
                checkIn.setDate(date.getDate() - 1)
                setCheckInDate(checkIn);
            }
            setCheckOutDate(date);
        }
    }

    function setCheckIn(date: MaterialUiPickersDate) {
        if (date !== null && checkOutDate !== null) {
            if (date >= checkOutDate) {
                const checkOut: MaterialUiPickersDate = new Date();
                checkOut.setDate(date.getDate() + 1)
                setCheckOutDate(checkOut);
            }
        }
        setCheckInDate(date);
    }

    return (
        <div className={classes.root}>
            <TitleBar/>
            <Typography className={classes.centreTitle}>{location.state.brandName}</Typography>
            <Typography className={classes.centreTitleNoSpace}>{location.state.address}</Typography>
            <GridList className={classes.dateGrid}>
                <Grid container alignItems="center" xs={2} className={classes.dateGrid}>
                    <Typography>Enter booking info to select a room:</Typography>
                </Grid>
                <Grid container alignItems="center" xs={2} className={classes.dateGrid}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            margin="normal"
                            id="check-in-dialog"
                            label="Check in date"
                            format="yyyy-MM-dd"
                            minDate={new Date()}
                            value={checkInDate}
                            onChange={(date: MaterialUiPickersDate) => setCheckIn(date)}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid container alignItems="center" xs={2} className={classes.dateGrid}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            margin="normal"
                            id="check-out-dialog"
                            label="Check out date"
                            format="yyyy-MM-dd"
                            minDate={tomorrow}
                            value={checkOutDate}
                            onChange={(date: MaterialUiPickersDate) => setCheckOut(date)}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid container alignItems="center" xs={2} className={classes.dateGrid}>
                    <TextField
                        id="capacity-number"
                        label="# of people"
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined"
                        value={numPeople}
                        onChange={e => setNumberOfPeople(parseInt(e.target.value))}
                    />
                </Grid>
                <Grid container alignItems="center" xs={2} className={classes.dateGrid}>
                    <Button variant="contained">Check Availability</Button>
                </Grid>
            </GridList>
            <Typography className={classes.smallerTitle}>{location.state.response.length} Rooms Found</Typography>
            <div className={classes.outsideGrid}>
                <GridList cols={1} cellHeight={190} className={classes.grid}>
                    {
                        location.state.response.map((room: Room, index: number) => {
                            return (
                                <GridListTile key={room.type_id} cols={1}>
                                    <Paper elevation={3} key={room.type_id} className={classes.brandPaper}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid className={classes.hotelGrid}>
                                                <Typography
                                                    className={classes.hotelTitle}>{room.title}</Typography>
                                                <Typography>Amenities: {room.amenities.length === 0 ? "None" : room.amenities}</Typography>
                                                <Typography>Max capacity: {room.room_capacity} adults</Typography>
                                                <Typography>View: {room.view}</Typography>
                                                <Typography>Extendable: {room.is_extendable ? "Yes" : "No"}</Typography>
                                            </Grid>
                                            <Divider orientation="vertical" flexItem className={classes.divider}/>
                                            <Grid item xs={3} alignItems="center">
                                                <Grid className={classes.priceDiv}>
                                                    <Typography
                                                        className={classes.hotelTitle}>${room.price}/night</Typography>
                                                    <br/><br/>
                                                    <Button variant='contained' onClick={() => bookRoom(index)}
                                                            disabled={buttonStates[index]}>Book Room</Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </GridListTile>
                            );
                        })
                    }
                </GridList>
            </div>
        </div>
    )
}