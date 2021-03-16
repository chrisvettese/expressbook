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
        marginBottom: '1em'
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
        fontSize: '1.5em',
        width: '100%'
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
    brandGrid: {
        width: '80%'
    },
    priceDiv: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center'
    }
}));

export default function HotelBrand() {
    const classes = useStyles();
    const location = useLocation<{customerSIN: string, customerName: string, customerAddress: string, response: any }>();
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
            let response: Response = await fetch(process.env.REACT_APP_SERVER_URL + "/brands/" + location.state.response[index].brand_id + "/hotels");
            if (response.status !== 200) {
                let newStates = [...buttonStates]
                newStates[index] = false;
                setButtonStates(newStates);
                return;
            }
            response = await response.json()
            history.push('/ui/customer/hotels', {
                customerSIN: location.state.customerSIN,
                customerName: location.state.customerName,
                customerAddress: location.state.customerAddress,
                response: response,
                brandName: location.state.response[index].name,
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
            <Typography className={classes.centreTitle}>Select a hotel brand to view hotels:</Typography>
            <GridList cols={1} cellHeight={200} className={classes.grid}>
                {
                    location.state.response.map((brand: {
                        brand_id: number;
                        name: string;
                        main_office_address: string;
                        email_address: string;
                        phone_number: string;
                        number_of_hotels: number;
                    }, index: number) => {
                        return (
                            <GridListTile key={brand.brand_id} cols={1}>
                                <Paper elevation={3} key={brand.brand_id} className={classes.brandPaper}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid className={classes.brandGrid}>
                                            <Typography className={classes.hotelTitle}>{brand.name}</Typography>
                                            <Typography>Headquarters Address: {brand.main_office_address}</Typography>
                                            <Typography>Email: {brand.email_address}</Typography>
                                            <Typography>Phone: {brand.phone_number}</Typography>
                                            <Typography>Number of hotels: {brand.number_of_hotels}</Typography>
                                        </Grid>
                                        <Divider orientation="vertical" flexItem className={classes.divider}/>
                                        <Grid item xs={2}>
                                            <Grid className={classes.priceDiv}>
                                                <Button variant='contained' onClick={() => getHotels(index)}
                                                        disabled={buttonStates[index]}>Select</Button>
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
    )
}