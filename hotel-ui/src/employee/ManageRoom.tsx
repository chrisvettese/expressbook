import {
    Button,
    Divider,
    Grid,
    GridList,
    GridListTile,
    makeStyles,
    Paper,
    Typography
} from "@material-ui/core";
import React, {useState} from "react";
import {TitleBarCustomer} from "../index";
import {useLocation} from "react-router-dom";

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
        height: '39em',
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
    disableDelete: boolean;
}

interface AvailableRoom {
    type_id: number;
    occupancy: number;
}

export default function ManageRoom() {
    const classes = useStyles();
    const location = useLocation<{
        address: string;
        response: Room[],
        brandName: string,
        hotelID: string,
        employeeSIN: string,
    }>();

    const roomArr = [...location.state.response];
    roomArr.map(room => {
        room.disableDelete = false;
        return room;
    })

    const [rooms, setRooms]: [Room[], any] = useState(roomArr);

    function getRoomAvailabilityMessage(numAvailable: number, total: number): string {
        return numAvailable + '/' + total + ' rooms available';
    }

    return (
        <div className={classes.root}>
            <TitleBarCustomer/>
            <Typography className={classes.centreTitle}>{location.state.brandName}</Typography>
            <Typography className={classes.centreTitleNoSpace}>{location.state.address}</Typography>
            <Typography className={classes.smallerTitle}>{rooms.length} Room Types</Typography>
            <Button variant='contained' style={{marginBottom: '1.5em'}}>New Room Type</Button>
            <div className={classes.outsideGrid}>
                <GridList cols={1} cellHeight={190} className={classes.grid}>
                    <div style={{height: '1em'}}/>
                    {
                        rooms.map((room: Room) => {
                            return (
                                <GridListTile key={room.type_id} cols={1}>
                                    <Paper elevation={3} key={room.type_id} className={classes.brandPaper}>
                                        <div>
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
                                                        <Button variant='contained' color='secondary'
                                                                style={{marginTop: '0.3em'}}>Delete</Button>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </div>
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