import {
    Button,
    Grid,
    GridList,
    makeStyles,
    Paper,
    TextField,
    Typography
} from "@material-ui/core";
import React, {useState} from "react";
import {HotelAlert, Severity, TitleBarEmployee} from "../index";
import {useHistory, useLocation,} from "react-router-dom";
import {CreateCustomerDialog} from "./employeeDialogs/CreateCustomerDialog";

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

interface ManageCustomerState {
    employeeSIN: string;
    employeeName: string;
    jobTitle: string;
    hotelID: number;
    brandName: string;
    address: string;
}

export default function ManageCustomer() {
    const classes = useStyles();
    const history = useHistory();
    const location = useLocation<ManageCustomerState>();

    const [SIN, setSIN] = useState("");
    const [disableFindCustomer, setDisableFindCustomer]: [boolean, any] = useState(false);
    const [customerData, setCustomerData]: [CustomerResponse | CustomerError | null, any] = useState(null);
    const [disableReservations, setDisableReservations]: [boolean, any] = useState(false);
    const [disableCreate, setDisableCreate]: [boolean, any] = useState(false);
    const [dialogOpen, setDialogOpen]: [boolean, any] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus]: [Severity, any] = useState("success");

    const [customerName, setCustomerName]: [string, any] = useState("");
    const [customerAddress, setCustomerAddress]: [string, any] = useState("");
    const [customerEmail, setCustomerEmail]: [string, any] = useState("");
    const [customerPhone, setCustomerPhone]: [string, any] = useState("");

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
            return <>
                <Typography className={classes.subTitle} align="center">Customer not found. Try searching a different
                    social insurance number, or create a new customer profile:</Typography>
                <br/>
                <div className={classes.paperContainer}>
                    <Button variant="contained" onClick={() => {
                        setCustomerName("");
                        setCustomerAddress("");
                        setCustomerEmail("");
                        setCustomerPhone("");
                        setDialogOpen(true);
                    }}>Create Customer Account</Button>
                </div>
            </>
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
                    <Button variant="contained" disabled={disableReservations}
                            onClick={getReservations}>View Customer Bookings</Button>
                </div>
                <br/><br/>
                <div className={classes.paperContainer}>
                    <Button variant="contained" disabled={disableCreate}
                            onClick={getRooms}>Create Booking for Customer</Button>
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

    async function getRooms() {
        setDisableCreate(true);
        try {
            let response: Response = await fetch(process.env.REACT_APP_SERVER_URL + "/hotels/" + location.state.hotelID + "/rooms");
            if (response.status !== 200 || customerData === null || !("customer_name" in customerData)) {
                return;
            }
            response = await response.json()
            history.push('/ui/employee/rooms', {
                customerSIN: customerData.customer_sin,
                customerName: customerData.customer_name,
                customerAddress: customerData.customer_address,
                customerEmail: customerData.customer_email,
                customerPhone: customerData.customer_phone,
                response: response,
                brandName: location.state.brandName,
                address: location.state.address,
                hotelID: location.state.hotelID,
                employeeName: location.state.employeeName,
                jobTitle: location.state.jobTitle,
                employeeSIN: location.state.employeeSIN
            });
        } catch (error) {
            console.error('Error:', error);
        }
        setDisableCreate(false);
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
            <CreateCustomerDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} classes={classes}
                                  setAlertMessage={setAlertMessage} setAlertStatus={setAlertStatus}
                                  setAlertOpen={setAlertOpen} setCustomerData={setCustomerData}
                                  customerName={customerName} setCustomerName={setCustomerName} customerSIN={SIN}
                                  customerAddress={customerAddress} setCustomerAddress={setCustomerAddress}
                                  customerEmail={customerEmail} setCustomerEmail={setCustomerEmail}
                                  customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}/>
            <HotelAlert alertOpen={alertOpen} closeAlert={() => setAlertOpen(false)} alertStatus={alertStatus}
                        alertMessage={alertMessage}/>
        </>
    )
}