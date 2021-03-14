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
import {TitleBar} from "../index";
import {useHistory, useLocation} from "react-router-dom";
import {Rating} from "@material-ui/lab";

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
        marginBottom: '1em',
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
        marginRight: '5em'
    },
    hotelGrid: {
        width: '80%'
    }
}));

export default function Reservations() {
    const classes = useStyles();
    const location = useLocation<{
        customer_sin: string,
        response: any,
        brandName: string
    }>();
    const history = useHistory();

    const buttonStateValues: boolean[] = []
    for (let i = 0; i < location.state.response.length; i++) {
        buttonStateValues.push(false)
    }
    const [buttonStates, setButtonStates] = useState(buttonStateValues);

    async function getHotels(index: number) {
        let newStates = [...buttonStates]
        newStates[index] = true;
        setButtonStates(newStates);
        try {
            let response: Response = await fetch(process.env.REACT_APP_SERVER_URL + "/hotels/" + location.state.response[index].hotel_id + "/rooms");
            if (response.status !== 200) {
                let newStates = [...buttonStates]
                newStates[index] = false;
                setButtonStates(newStates);
                return;
            }
            response = await response.json()
            history.push('/ui/customer/rooms', {
                customer_sin: location.state.customer_sin,
                response: response,
                brandName: location.state.response[index].brand_name,
                address: location.state.response[index].physical_address
            });
        } catch (error) {
            console.error('Error:', error);
            let newStates = [...buttonStates]
            newStates[index] = false;
            setButtonStates(newStates);
        }
    }

    return (
        <div className={classes.root}>
            <TitleBar/>
            <Typography className={classes.centreTitle}>{location.state.brandName} Hotels</Typography>
            <GridList cols={1} cellHeight={175} className={classes.grid}>
                {
                    location.state.response.map((hotel: {
                        physical_address: string;
                        email_address: string;
                        phone_number: string;
                        number_of_rooms: number;
                        hotel_id: number;
                        star_category: number;
                    }, index: number) => {
                        return (
                            <GridListTile key={hotel.hotel_id} cols={1}>
                                <Paper elevation={3} key={hotel.hotel_id} className={classes.brandPaper}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid className={classes.hotelGrid}>
                                            <Typography
                                                className={classes.hotelTitle}>{hotel.physical_address}</Typography>
                                            <Typography>Email: {hotel.email_address}</Typography>
                                            <Typography>Phone: {hotel.phone_number}</Typography>
                                            <Typography>Number of rooms: {hotel.number_of_rooms}</Typography>
                                        </Grid>
                                        <Divider orientation="vertical" flexItem className={classes.divider}/>
                                        <Grid>
                                            <div>
                                                <Rating value={hotel.star_category} readOnly/>
                                                <br/><br/>
                                                <Button variant='contained' onClick={() => getHotels(index)}
                                                        disabled={buttonStates[index]}>View Details</Button>
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </GridListTile>
                        );
                    })
                }
            </GridList>
        </div>
    )
}