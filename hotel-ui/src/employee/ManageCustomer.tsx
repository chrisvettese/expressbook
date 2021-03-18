import {Button, Grid, GridList, makeStyles, Paper, TextField, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {TitleBarEmployee} from "../index";
import {useHistory,} from "react-router-dom";

const useStyles = makeStyles(() => ({
    centreTitle: {
        paddingTop: '2em',
        fontWeight: 'bold',
        fontSize: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
    subTitle: {
        fontSize: '1.4em'
    },
    paperContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        display: 'inline-block',
        padding: '1em',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inPaper: {
        display: 'flex'
    }
}));

interface CustomerResponse {
    customer_sin: string;
    customer_name: string;
    customer_address: string;
    customer_email: string;
    customer_phone: string;
}

interface CustomerError {
    error: string;
    message: string;
}

export default function ManageCustomer() {
    const classes = useStyles();
    const history = useHistory();

    const [SIN, setSIN] = useState("");
    const [disableFindCustomer, setDisableFindCustomer]: [boolean, any] = useState(false);
    const [customerData, setCustomerData]: [CustomerResponse | CustomerError | null, any] = useState(null);
    const [disableReservations, setDisableReservations]: [boolean, any] = useState(false);

    const sinRegex: RegExp = /^[0-9]{3}-[0-9]{3}-[0-9]{3}$/;

    function validateSIN(): boolean {
        return !sinRegex.test(SIN) && SIN.length !== 0;
    }

    function keyPressed(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter' && sinRegex.test(SIN)) {
            findCustomer();
        }
    }

    function ShowCustomer() {
        if (customerData === null) {
            return <></>
        } else if (customerData.hasOwnProperty('error')) {
            return <Typography className={classes.subTitle} align="center">Customer not found. Try searching a different
                social insurance number.</Typography>
        }
        return (
            <>
                <Typography className={classes.subTitle}
                            align="center">Customer: {"customer_name" in customerData ? customerData.customer_name : ''}</Typography>
                <div className={classes.paperContainer}>
                    <Paper elevation={3} className={classes.paper}>
                        <Typography
                            className={classes.inPaper}>Address: {"customer_address" in customerData ? customerData.customer_address : ''}</Typography>
                        <Typography
                            className={classes.inPaper}>Email: {"customer_email" in customerData ? customerData.customer_email : ''}</Typography>
                        <Typography className={classes.inPaper}>Phone
                            number: {"customer_phone" in customerData ? customerData.customer_phone : ''}</Typography>
                    </Paper>
                </div>
                <br/><br/>
                <div className={classes.paperContainer}>
                    <Button variant="contained" color="primary" disabled={disableReservations}
                            onClick={getReservations}>View Customer Reservations</Button>
                </div>
            </>
        );
    }

    async function getReservations() {
        if (customerData !== null && "customer_name" in customerData) {
            setDisableReservations(true);
            try {
                let response: Response = await fetch(process.env.REACT_APP_SERVER_URL + "/customers/" + customerData.customer_sin + "/reservations");
                if (response.status !== 200) {
                    setDisableReservations(false);
                    return;
                }
                response = await response.json();
                history.push('/ui/employee/reservations', {
                    customerName: customerData.customer_name,
                    customerSIN: customerData.customer_sin,
                    response: response,
                    isCustomer: false
                });
            } catch (error) {
                console.error('Error:', error);
                setDisableReservations(false);
            }
        }
    }

    function findCustomer() {
        setDisableFindCustomer(true);
        fetch(process.env.REACT_APP_SERVER_URL + "/customers/" + SIN)
            .then(response => {
                if (response.status === 200) {
                    response.json().then((response: CustomerResponse) => {
                        setCustomerData(response);
                    })
                } else if (response.status === 404) {
                    response.json().then((response: CustomerError) => {
                        setCustomerData(response);
                    })
                } else {
                    console.error('Error: unable to get customer info');
                }
            }).catch(error => {
                console.error('Error:', error);
            }
        );
        setDisableFindCustomer(false);
    }

    return (
        <>
            <TitleBarEmployee/>
            <Typography className={classes.centreTitle}>Manage Customer</Typography>
            <GridList className={classes.gridParent}>
                <Grid container item alignItems="center" xs={2} className={classes.dateGrid}>
                    <Typography>Enter customer SIN:</Typography>
                </Grid>
                <Grid container item alignItems="center" xs={2} className={classes.dateGrid}>
                    <TextField error={validateSIN()}
                               helperText={validateSIN() ? "SIN must have format XXX-XXX-XXX" : ""}
                               onChange={event => setSIN(event.currentTarget.value)}
                               onKeyPress={e => keyPressed(e)}
                               id="outlined-basic" label="Social Insurance Number" variant="outlined" value={SIN}/>
                </Grid>
                <Grid container item alignItems="center" xs={2} className={classes.dateGrid}>
                    <Button variant="contained" onClick={() => findCustomer()}
                            disabled={!sinRegex.test(SIN) || disableFindCustomer}>
                        Find Customer
                    </Button>
                </Grid>
            </GridList>
            <ShowCustomer/>
        </>
    )
}