import React, {useEffect, useState} from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle, FormControl, InputAdornment, InputLabel, MenuItem, Select,
    TextField,
    Typography
} from "@material-ui/core";
import ChipInput from "material-ui-chip-input";
import {openAlert, REACT_APP_SERVER_URL} from "../../index";
import {Room} from "../ManageRoom";

export interface View {
    view: string;
}

interface NewRoom {
    dialogOpen: boolean;
    setDialogOpen: any;
    classes: any;
    managerSIN: string;
    setAlertMessage: any;
    setAlertStatus: any;
    setAlertOpen: any;
    views: View[];
    hotelID: number;
    rooms: Room[];
    setRooms: any;
}

export const NewRoomDialog = (newRoom: NewRoom) => {
    const classes = newRoom.classes;

    const [disableSubmit, setDisableSubmit]: [boolean, any] = useState(false);

    const [title, setTitle]: [string, any] = useState("");
    const [price, setPrice]: [string, any] = useState("");
    const [capacity, setCapacity]: [string, any] = useState("");
    const [numberOfRooms, setNumberOfRooms]: [string, any] = useState("");
    const [isExtendable, setIsExtendable]: [string, any] = useState("false");
    const [view, setView]: [string, any] = useState(newRoom.views[0].view)
    const [amenities, setAmenities]: [string[], any] = useState([])

    const [titleError, setTitleError]: [boolean, any] = useState(false);
    const [priceError, setPriceError]: [boolean, any] = useState(false);
    const [capacityError, setCapacityError]: [boolean, any] = useState(false);
    const [roomError, setRoomError]: [boolean, any] = useState(false);

    useEffect(() => {
        setView(newRoom.views[0].view);
    }, [newRoom.dialogOpen, newRoom.views]);

    async function createRoom() {
        setDisableSubmit(true);

        const titleError = title.length === 0;
        const priceError = Number.isNaN(price) || parseFloat(price) < 0 || price.length === 0;

        const capacityInteger: boolean = /^\d+$/.test(capacity);
        const capacityError = capacity.length === 0 || !capacityInteger || (capacityInteger && parseInt(capacity) <= 0);

        const roomInteger: boolean = /^\d+$/.test(numberOfRooms);
        const roomError = numberOfRooms.length === 0 || !roomInteger || (roomInteger && parseInt(numberOfRooms) <= 0);

        setTitleError(titleError);
        setPriceError(priceError);
        setCapacityError(capacityError);
        setRoomError(roomError);

        if (titleError || priceError || capacityError || roomError) {
            setDisableSubmit(false);
            return;
        }

        const fixedPrice: string = parseFloat(price).toFixed(2);
        const numRooms = parseInt(numberOfRooms);
        const roomCapacity = parseInt(capacity);

        try {
            let response = await fetch(REACT_APP_SERVER_URL + "/hotels/" + newRoom.hotelID + "/rooms", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    price: fixedPrice,
                    amenities: amenities,
                    room_capacity: roomCapacity,
                    view: view,
                    is_extendable: isExtendable === 'true',
                    rooms: numRooms,
                    manager_sin: newRoom.managerSIN
                })
            })
            if (response.status === 201) {
                openAlert('Created new room type', 'success', newRoom.setAlertMessage, newRoom.setAlertStatus, newRoom.setAlertOpen);
                const jsonResponse: {type_id: number} = await response.json();
                newRoom.rooms.push({
                    type_id: jsonResponse.type_id,
                    title: title,
                    price: fixedPrice,
                    amenities: amenities,
                    room_capacity: roomCapacity,
                    view: view,
                    is_extendable: isExtendable === 'true',
                    total_number_rooms: numRooms,
                    rooms_available: numRooms,
                });
                closeDialog();
            } else {
                openAlert('Error: Unable to create room type', 'error', newRoom.setAlertMessage, newRoom.setAlertStatus, newRoom.setAlertOpen);
            }
        } catch (error) {
            console.error('Error:', error);
            openAlert('Error: Unable to create room type', 'error', newRoom.setAlertMessage, newRoom.setAlertStatus, newRoom.setAlertOpen)
        }

        setDisableSubmit(false);
    }

    function closeDialog() {
        newRoom.setDialogOpen(false);

        setTitle("");
        setPrice("");
        setCapacity("");
        setNumberOfRooms("");
        setAmenities([]);
        setIsExtendable(false);

        setTitleError(false);
        setPriceError(false);
        setCapacityError(false);
        setRoomError(false);
    }

    function setViewByIndex(view: any) {
        for (let i = 0; i < newRoom.views.length; i++) {
            if (newRoom.views[i].view === view) {
                setView(newRoom.views[i].view);
                return;
            }
        }
    }

    return <Dialog onClose={() => closeDialog()} aria-labelledby="simple-dialog-title" open={newRoom.dialogOpen}>
        <DialogTitle id="dialog-title" className={classes.dialogTitle}>
            <Typography className={classes.dialogTitle}>New Room Type</Typography>
        </DialogTitle>
        <div className={classes.dialogAddress}>
            <div>
                <TextField label="Room Title" variant="outlined" value={title} error={titleError}
                           helperText={titleError ? "Must provide room title" : ""} className={classes.dialogGap}
                           onChange={event => setTitle(event.currentTarget.value)}/>
                <TextField label="Price (nightly)" variant="outlined" type="number" value={price} error={priceError}
                           helperText={priceError ? "Must enter valid room price" : ""} className={classes.dialogGap}
                           onChange={event => setPrice(event.currentTarget.value)}
                           InputProps={{
                               startAdornment: <InputAdornment position="start">$</InputAdornment>,
                           }}/>
            </div>
            <div>
                <TextField label="Max Room Capacity" variant="outlined" type="number" value={capacity}
                           error={capacityError}
                           helperText={capacityError ? "Must enter valid room capacity" : ""}
                           className={classes.dialogGap}
                           onChange={event => setCapacity(event.currentTarget.value)}/>
                <TextField label="Number of Rooms" variant="outlined" type="number" value={numberOfRooms}
                           error={roomError}
                           helperText={roomError ? "Must enter valid number of rooms" : ""}
                           className={classes.dialogGap}
                           onChange={event => setNumberOfRooms(event.currentTarget.value)}/>
            </div>
            <div>
                <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel id="room-label">Room is Extendable</InputLabel>
                    <Select
                        labelId="room-label"
                        id="room-outlined"
                        value={isExtendable}
                        onChange={e => setIsExtendable(e.target.value)}
                        label="Room is Extendable">
                        <MenuItem value="false" key="false">No</MenuItem>
                        <MenuItem value="true" key="true">Yes</MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel id="view-label">Room View</InputLabel>
                    <Select
                        labelId="view-label"
                        id="view-outlined"
                        value={view}
                        onChange={e => setViewByIndex(e.target.value)}
                        label="Room View">
                        {
                            newRoom.views.map((view: View, index: number) => {
                                return <MenuItem value={view.view} key={index}>{view.view}</MenuItem>
                            })
                        }
                    </Select>
                </FormControl>
            </div>
            <ChipInput variant="outlined" label="Amenities (press enter to add)" value={amenities}
                       style={{marginBottom: '1em', marginTop: '1em', minWidth: "20em"}}
                       onAdd={(chip) => {
                           const newAmenities = [...amenities];
                           newAmenities.push(chip);
                           setAmenities(newAmenities)
                       }}
                       onDelete={(_, index) => {
                           const newAmenities = [...amenities];
                           newAmenities.splice(index, 1);
                           setAmenities(newAmenities)
                       }}
            />
        </div>
        <DialogActions>
            <Button
                onClick={() => createRoom()}
                variant="contained"
                disabled={disableSubmit}
                color="primary">
                Create Room Type
            </Button>
            <Button onClick={() => closeDialog()} variant="contained" color="secondary">
                Cancel
            </Button>
        </DialogActions>
    </Dialog>
};