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
import {BackButton, HotelAlert, Severity, TitleBar} from "../index";
import {useHistory, useLocation,} from "react-router-dom";
import {CreateCustomerDialog} from "./employeeDialogs/CreateCustomerDialog";

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
    },
    dialogGap: {
        marginBottom: '2em'
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
}

interface ManageCustomerState {
    employeeSIN: string;
    employeeName: string;
    jobTitle: string;
    hotelID: number;
    brandName: string;
    address: string;
    employeeData: any;
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

    const [emailError, setEmailError]: [boolean, any] = useState(false);

    function validateEmail(email: string) {
        const emailError: boolean = isEmailError(email) && email.length !== 0;
        setEmailError(emailError);
    }

    function isEmailError(email: string): boolean {
        let emailError: boolean = email.includes(' ') || email.indexOf('@') < 1
        if (!emailError) {
            const index: number = email.indexOf('.', email.indexOf('@'))
            if (index < 3 || index === email.length - 1) {
                emailError = true;
            }
        }
        return emailError;
    }

    function keyPressed(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter' && !emailError) {
            findCustomer().then(_ => {
            });
        }
    }

    function ShowCustomer() {
        if (customerData === null) {
            return <></>
        } else if (customerData.hasOwnProperty('error')) {
            return <div style={{flexDirection: 'column'}}>
                <Typography className={classes.subTitle} align="center">Customer not found. Try searching a different
                    email, or create a new customer profile:</Typography>
                <br/>
                <div className={classes.paperContainer}>
                    <Button variant="contained" onClick={() => {
                        setCustomerName("");
                        setCustomerAddress("");
                        setSIN("");
                        setCustomerPhone("");
                        setDialogOpen(true);
                    }}>Create Customer Account</Button>
                </div>
            </div>
        }
        return (
            <div style={{flexDirection: 'column'}}>
                <Typography className={classes.subTitle}
                            align="center">Customer: {"customer_name" in customerData ? customerData.customer_name : ''}</Typography>
                <div className={classes.paperContainer}>
                    <Paper elevation={3} className={classes.paper}>
                        <Typography
                            className={classes.inPaper}>Address: {"customer_address" in customerData ? customerData.customer_address : ''}</Typography>
                        <Typography
                            className={classes.inPaper}>SIN: {"customer_sin" in customerData ? customerData.customer_sin : ''}</Typography>
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
            </div>
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
                    isCustomer: false,
                    manageData: location.state
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
                setDisableCreate(false);
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
                employeeSIN: location.state.employeeSIN,
                manageData: location.state
            });
        } catch (error) {
            console.error('Error:', error);
        }
        setDisableCreate(false);
    }

    async function findCustomer() {
        setDisableFindCustomer(true);
        try {
            const response = await fetch(process.env.REACT_APP_SERVER_URL + "/customers?email=" + customerEmail);
            if (response.status === 200) {
                const jsonResponse: CustomerResponse[] = await response.json();
                if (jsonResponse.length === 0) {
                    setCustomerData({error: "Not Found"});
                } else {
                    setCustomerData(jsonResponse[0]);
                }
            } else {
                console.error('Error: unable to get customer info');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setDisableFindCustomer(false);
    }

    return (
        <div className={classes.root}>
            <TitleBar history={history} userType='employee'/>
            <Typography className={classes.centreTitle}>Manage Customer</Typography>
            <GridList className={classes.gridParent}>
                <Grid container item alignItems="center" xs={2} className={classes.dateGrid}>
                    <Typography>Enter customer email:</Typography>
                </Grid>
                <Grid container item alignItems="center" xs={2} className={classes.dateGrid}>
                    <TextField error={emailError}
                               helperText={emailError ? "Email must have valid format" : ""}
                               onChange={event => {
                                   validateEmail(event.currentTarget.value);
                                   setCustomerEmail(event.currentTarget.value);
                               }}
                               onKeyPress={e => keyPressed(e)}
                               id="outlined-basic" label="Email Address" variant="outlined"
                               value={customerEmail}/>
                </Grid>
                <Grid container item alignItems="center" xs={2} className={classes.dateGrid}>
                    <Button variant="contained" onClick={findCustomer}
                            disabled={emailError || customerEmail.length === 0 || disableFindCustomer}>
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
                                  customerEmail={customerEmail} setCustomerSIN={setSIN}
                                  customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}/>
            <HotelAlert alertOpen={alertOpen} closeAlert={() => setAlertOpen(false)} alertStatus={alertStatus}
                        alertMessage={alertMessage}/>
            <div style={{height: '16em', width: '100%'}}/>
            <BackButton message={'Back'} history={history} url={'/ui/employee/welcome'}
                        state={location.state.employeeData}/>
        </div>
    )
}