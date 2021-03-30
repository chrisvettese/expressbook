import {
    Button,
    Divider,
    Grid,
    GridList,
    GridListTile,
    makeStyles,
    Paper, TextField, Tooltip,
    TooltipProps,
    Typography
} from "@material-ui/core";
import React, {useState} from "react";
import {HotelAlert, Severity, TitleBarCustomer} from "./index";
import {useLocation} from "react-router-dom";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from "@date-io/date-fns";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import {ConfirmationDialog} from "./sharedDialogs/ConfirmationDialog";

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
        marginLeft: '6em',
        marginRight: '6em',
        padding: '1em',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: '1em'
    },
    hotelTitle: {
        fontWeight: 'bold',
        fontSize: '1.5em'
    },
    grid: {
        boxShadow: '0 0 3pt 1pt gray',
        height: '50em',
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
    },
    gridParent: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
    },
    dialogDiv: {
        marginLeft: "0.5em",
        marginRight: "0.5em"
    },
    dialogHeader: {
        fontWeight: 'bold'
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
        fontStyle: "italic",
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center'
    }
}));

const useStylesBootstrap = makeStyles((theme) => ({
    arrow: {
        color: theme.palette.common.black,
    },
    tooltip: {
        backgroundColor: theme.palette.common.black,
    },
}));

function BootstrapTooltip(props: JSX.IntrinsicAttributes & TooltipProps) {
    const classes = useStylesBootstrap();

    return <Tooltip arrow classes={classes} {...props} />;
}

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
    enabled: undefined | boolean;
    tooltip: string;
}

interface AvailableRoom {
    type_id: number;
    occupancy: number;
}

export default function Rooms() {
    const classes = useStyles();
    const location = useLocation<{
        address: string;
        customerSIN: string,
        customerName: string,
        customerAddress: string,
        customerEmail: string,
        customerPhone: string,
        response: Room[],
        brandName: string,
        hotelID: string,
        employeeName: string,
        employeeSIN: string,
        jobTitle: string
    }>();

    const [checkInDate, setCheckInDate]: [Date, any] = useState(new Date());
    const tomorrow: MaterialUiPickersDate = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1)
    const [checkOutDate, setCheckOutDate]: [Date, any] = useState(tomorrow);
    const [checkInDateToBook, setCheckInDateToBook]: [string, any] = useState("");
    const [checkOutDateToBook, setCheckOutDateToBook]: [string, any] = useState("");
    const [numPeople, setNumPeople]: [number, any] = useState(1);
    const [availability, setAvailability]: [boolean, any] = useState(false);
    const [disableAvailability, setDisableAvailability]: [boolean, any] = useState(false);
    const [roomData, setRoomData]: [Room[], any] = useState(location.state.response);
    const [numRooms, setNumRooms]: [number, any] = useState(location.state.response.length);
    const [dialogOpen, setDialogOpen]: [boolean, any] = useState(false);
    const [roomToBook, setRoomToBook]: [Room, any] = useState(location.state.response[0]);
    const [disableBookRoomButton, setDisableBookRoomButton]: [boolean, any] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus]: [Severity, any] = useState("success");

    const past: [Date, Date, number] = [tomorrow, tomorrow, -1]

    location.state.response.forEach((room: Room) => {
        room.enabled = true;
        room.tooltip = "";
    })

    function confirmBookRoom(room: Room) {
        setRoomToBook(room);
        setDialogOpen(true);
    }

    async function bookRoom(typeID: number) {
        setDisableBookRoomButton(true);
        let body: string = "";
        if (location.state.employeeSIN === undefined) {
            body = JSON.stringify({
                type_id: typeID,
                check_in: checkInDateToBook,
                check_out: checkOutDateToBook
            });
        } else {
            body = JSON.stringify({
                type_id: typeID,
                check_in: checkInDateToBook,
                check_out: checkOutDateToBook,
                employee_sin: location.state.employeeSIN
            });
        }

        try {
            let response = await fetch(process.env.REACT_APP_SERVER_URL + "/customers/" + location.state.customerSIN + "/reservations", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            })
            if (response.status === 201) {
                await checkAvailability();
                openAlert('Successfully booked room', 'success');
                setDialogOpen(false);
            } else {
                openAlert('Error: Unable to book room', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            openAlert('Error: Unable to book room', 'error');
        }
        setDisableBookRoomButton(false);
    }

    function openAlert(message: string, status: string) {
        setAlertMessage(message);
        setAlertStatus(status);
        setAlertOpen(true);
    }

    async function checkAvailability() {
        //Only check availability if filters have been changed
        if (past[0] !== checkInDate || past[1] !== checkOutDate || past[2] !== numPeople) {
            setDisableAvailability(true);
            try {
                let url: string = process.env.REACT_APP_SERVER_URL + "/hotels/" + location.state.hotelID + "/rooms/availability"
                url += "?check-in=" + dateToString(checkInDate) + "&check-out=" + dateToString(checkOutDate) + "&people=" + numPeople;

                let response: Response = await fetch(url);
                if (response.status !== 200) {
                    return;
                }
                const availableRooms: AvailableRoom[] = await response.json();
                const newRoomData: Room[] = JSON.parse(JSON.stringify(roomData));
                let roomNum: number = newRoomData.length;
                newRoomData.forEach(room => {
                    const roomInfo = getRoom(room.type_id, availableRooms);
                    room.enabled = true;
                    room.tooltip = "";
                    room.rooms_available = room.total_number_rooms - roomInfo.occupancy;
                    //Room capacity is too small; disable
                    if (roomInfo.type_id === -1) {
                        room.enabled = false;
                        room.tooltip = "Room capacity is too small";
                        roomNum--;
                    }
                    if (room.rooms_available <= 0) {
                        room.enabled = false;
                        room.tooltip = "Room is booked up over these dates"
                        roomNum--;
                    }
                });
                newRoomData.sort((r1: Room, r2: Room) => {
                    if (r1.enabled && !r2.enabled) {
                        return -1;
                    }
                    if (!r1.enabled && r2.enabled) {
                        return 1;
                    }
                    return r1.type_id > r2.type_id ? -1 : 1;
                })
                setRoomData(newRoomData);
                setNumRooms(roomNum);
                setCheckInDateToBook(dateToString(checkInDate));
                setCheckOutDateToBook(dateToString(checkOutDate));
            } catch (error) {
                console.error('Error:', error);
            }
            setDisableAvailability(false);
        }
        if (!availability) {
            setAvailability(true);
        }
    }

    function getRoom(typeID: number, roomData: AvailableRoom[]): AvailableRoom {
        for (let i = 0; i < roomData.length; i++) {
            if (roomData[i].type_id === typeID) {
                return roomData[i];
            }
        }
        return {
            type_id: -1,
            occupancy: -1
        }
    }

    function setNumberOfPeople(num: number) {
        if (num > 0) {
            setNumPeople(num);
            setAvailability(false);
        }
    }

    function setCheckOut(date: MaterialUiPickersDate) {
        if (date !== null && checkInDate !== null) {
            if (date.getTime() <= checkInDate.getTime()) {
                const checkIn: MaterialUiPickersDate = new Date();
                checkIn.setMonth(date.getMonth())
                checkIn.setDate(date.getDate() - 1)
                setCheckInDate(checkIn);
            }
            setAvailability(false);
            setCheckOutDate(date);
        }
    }

    function setCheckIn(date: MaterialUiPickersDate) {
        if (date !== null && checkOutDate !== null) {
            if (date.getTime() >= checkOutDate.getTime()) {
                const checkOut: MaterialUiPickersDate = new Date();
                checkOut.setMonth(date.getMonth())
                checkOut.setDate(date.getDate() + 1)
                setCheckOutDate(checkOut);
            }
            setAvailability(false);
            setCheckInDate(date);
        }
    }

    function dateToString(date: Date): string {
        let year: string = date.getFullYear().toString();
        let month: string = '' + (date.getMonth() + 1);
        let day: string = '' + date.getDate();

        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
        return year + '-' + month + '-' + day;
    }

    function getRoomAvailabilityMessage(numAvailable: number, total: number): string {
        return numAvailable + '/' + total + ' rooms available';
    }

    return (
        <div className={classes.root}>
            <TitleBarCustomer/>
            <Typography className={classes.centreTitle}>{location.state.brandName}</Typography>
            <Typography className={classes.centreTitleNoSpace}>{location.state.address}</Typography>
            <GridList className={classes.gridParent}>
                <Grid container item alignItems="center" xs={2} className={classes.dateGrid}>
                    <Typography>Enter booking info to select a room:</Typography>
                </Grid>
                <Grid container item alignItems="center" xs={2} className={classes.dateGrid}>
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
                <Grid container item alignItems="center" xs={2} className={classes.dateGrid}>
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
                <Grid container item alignItems="center" xs={2} className={classes.dateGrid}>
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
                <Grid container item alignItems="center" xs={2} className={classes.dateGrid}>
                    <Button variant="contained" onClick={checkAvailability} disabled={disableAvailability}>Check
                        Availability</Button>
                </Grid>
            </GridList>
            <Typography className={classes.smallerTitle}>{numRooms} Rooms Found</Typography>
            <div className={classes.outsideGrid}>
                <GridList cols={1} cellHeight={190} className={classes.grid}>
                    <div style={{height: '1em'}}/>
                    {
                        roomData.map((room: Room) => {
                            return (
                                <GridListTile key={room.type_id} cols={1}>
                                    <BootstrapTooltip title={room.tooltip} aria-label="add" placement="top">
                                        <Paper elevation={3} key={room.type_id} className={classes.brandPaper}
                                               style={room.enabled ? {} : {
                                                   backgroundColor: 'grey'
                                               }}>
                                            <div style={room.enabled ? {opacity: '1'} : {
                                                opacity: '0.40'
                                            }}>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid className={classes.hotelGrid}>
                                                        <Typography
                                                            className={classes.hotelTitle}>{room.title}</Typography>
                                                        <Typography>Amenities: {room.amenities.length === 0 ? "None" : room.amenities.join(', ')}</Typography>
                                                        <Typography>Max
                                                            capacity: {room.room_capacity} adults</Typography>
                                                        <Typography>View: {room.view}</Typography>
                                                        <Typography>Extendable: {room.is_extendable ? "Yes" : "No"}</Typography>
                                                    </Grid>
                                                    <Divider orientation="vertical" flexItem
                                                             className={classes.divider}/>
                                                    <Grid container item xs={3} alignItems="center">
                                                        <Grid container className={classes.priceDiv}>
                                                            <Typography
                                                                className={classes.hotelTitle}>${room.price}/night</Typography>
                                                            <Typography>{getRoomAvailabilityMessage(room.rooms_available, room.total_number_rooms)}</Typography>
                                                            <br/>
                                                            <BootstrapTooltip
                                                                title={(!availability && room.enabled) ? "Check availability to book a room" : ""}
                                                                aria-label="add" placement="top">
                                                                <div>
                                                                    <Button variant='contained'
                                                                            onClick={() => confirmBookRoom(room)}
                                                                            disabled={!room.enabled || !availability}>
                                                                        Book Room
                                                                    </Button>
                                                                </div>
                                                            </BootstrapTooltip>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </div>
                                        </Paper>
                                    </BootstrapTooltip>
                                </GridListTile>
                            );
                        })
                    }
                </GridList>
            </div>
            <ConfirmationDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} roomToBook={roomToBook}
                                classes={classes} location={location} checkInDateToBook={checkInDateToBook}
                                bookRoom={bookRoom} checkOutDateToBook={checkOutDateToBook}
                                disableBookRoomButton={disableBookRoomButton}/>
            <HotelAlert alertOpen={alertOpen} closeAlert={() => setAlertOpen(false)} alertStatus={alertStatus}
                        alertMessage={alertMessage}/>
        </div>
    )
}