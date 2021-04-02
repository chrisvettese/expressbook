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
import {BackButton, HotelAlert, openAlert, REACT_APP_SERVER_URL, Severity, TitleBar} from "../index";
import {useHistory, useLocation} from "react-router-dom";
import {NewRoomDialog, View} from "./employeeDialogs/NewRoomDialog";

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        backgroundColor: theme.palette.background.paper,
        width: '100%'
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
        height: '36em',
        width: '85%',
        marginTop: '10em'
    },
    outsideGrid: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%'
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
        minWidth: '13em',
        marginLeft: '1em',
        marginRight: '1em',
        marginBottom: '1em'
    }
}));

export interface Room {
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

export default function ManageRoom() {
    const classes = useStyles();
    const history = useHistory();

    const location = useLocation<{
        address: string;
        response: Room[],
        brandName: string,
        hotelID: number,
        employeeSIN: string,
        employeeData: any
    }>();

    const deleteDisabled: boolean[] = new Array(location.state.response.length)
    for (let i = 0; i < deleteDisabled.length; i++) {
        deleteDisabled[i] = false;
    }

    const [rooms, setRooms]: [Room[], any] = useState(location.state.response);
    const [disableDelete, setDisableDelete]: [boolean[], any] = useState(deleteDisabled);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus]: [Severity, any] = useState("success");
    const [dialogOpen, setDialogOpen]: [boolean, any] = useState(false);
    const [disableNewRoom, setDisableNewRoom]: [boolean, any] = useState(false);
    const [views, setViews]: [View[], any] = useState([{view: ""}]);

    function getRoomAvailabilityMessage(numAvailable: number, total: number): string {
        return numAvailable + '/' + total + ' rooms available';
    }

    async function deleteRoom(index: number) {
        let newDisableDelete = [...disableDelete];
        newDisableDelete[index] = true;
        setDisableDelete(newDisableDelete);

        try {
            let response = await fetch(REACT_APP_SERVER_URL + "/hotels/" + location.state.hotelID + "/rooms/" + rooms[index].type_id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    manager_sin: location.state.employeeSIN,
                })
            })
            if (response.status === 204) {
                const newRooms = [...rooms];
                newRooms.splice(index, 1);
                setRooms(newRooms);
                newDisableDelete = [...disableDelete];
                newDisableDelete[index] = false;
                setDisableDelete(newDisableDelete);
                openAlert('Deleted room type', 'success', setAlertMessage, setAlertStatus, setAlertOpen);
                return;
            } else {
                openAlert('Error: Unable to delete room type', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
            }
        } catch (error) {
            console.error('Error:', error);
            openAlert('Error: Unable to delete room type', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
        }
        newDisableDelete = [...disableDelete];
        newDisableDelete[index] = false;
        setDisableDelete(newDisableDelete);
    }

    async function newRoomDialog() {
        setDisableNewRoom(true);
        try {
            let response = await fetch(REACT_APP_SERVER_URL + '/views');
            if (response.status === 200) {
                const views: View[] = await response.json();
                views.reverse();
                setViews(views);
            } else {
                openAlert('Error: Unable to open new room dialog', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
            }
        } catch (error) {
            console.error('Error:', error);
            openAlert('Error: Unable to open new room dialog', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
        }
        setDialogOpen(true);
        setDisableNewRoom(false);
    }

    return (
        <div className={classes.root}>
            <TitleBar history={history} userType='employee'/>
            <div className={classes.root}>
                <Typography className={classes.centreTitle}>{location.state.brandName}</Typography>
                <Typography className={classes.centreTitleNoSpace}>{location.state.address}</Typography>
                <Typography className={classes.smallerTitle}>{rooms.length} Room Types</Typography>
                <Button variant='contained' disabled={disableNewRoom} style={{marginBottom: '1.5em'}}
                        onClick={newRoomDialog}>
                    New Room Type
                </Button>
            </div>
            <div className={classes.outsideGrid}>
                <GridList cols={1} cellHeight={190} className={classes.grid}>
                    <div style={{height: '1em'}}/>
                    {
                        rooms.map((room: Room, index: number) => {
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
                                                                style={{marginTop: '0.3em'}}
                                                                disabled={disableDelete[index]}
                                                                onClick={() => deleteRoom(index)}>
                                                            Delete
                                                        </Button>
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
            <NewRoomDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} classes={classes}
                           managerSIN={location.state.employeeSIN} setAlertMessage={setAlertMessage}
                           rooms={rooms} setRooms={setRooms} setAlertStatus={setAlertStatus} views={views}
                           hotelID={location.state.hotelID} setAlertOpen={setAlertOpen}/>
            <HotelAlert alertOpen={alertOpen} closeAlert={() => setAlertOpen(false)} alertStatus={alertStatus}
                        alertMessage={alertMessage}/>
            <div style={{height: '1.5em', width: '100%'}}/>
            <BackButton message={'Back'} history={history} url={'/ui/employee/welcome'} state={location.state.employeeData}/>
        </div>
    )
}