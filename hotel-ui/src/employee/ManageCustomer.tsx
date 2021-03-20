import {
    Button,
    Dialog, DialogActions,
    DialogTitle,
    Grid,
    GridList,
    makeStyles,
    Paper, Snackbar,
    TextField,
    Typography
} from "@material-ui/core";
import React, {useState} from "react";
import {Severity, TitleBarEmployee} from "../index";
import {useHistory,} from "react-router-dom";
import {Alert} from "@material-ui/lab";

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

const CreateCustomerDialog = ({
                                  dialogOpen, setDialogOpen,
                                  classes,
                                  customerSIN,
                                  setAlertMessage,
                                  setAlertStatus,
                                  setAlertOpen,
                                  setCustomerData,
                                  customerName, setCustomerName,
                                  customerAddress, setCustomerAddress,
                                  customerPhone, setCustomerPhone,
                                  customerEmail, setCustomerEmail
                              }: any) => {

    const [nameError, setNameError]: [boolean, any] = useState(false);
    const [addressError, setAddressError]: [boolean, any] = useState(false);
    const [emailError, setEmailError]: [boolean, any] = useState(false);
    const [phoneError, setPhoneError]: [boolean, any] = useState(false);

    const [disableCreateCustomer, setDisableCreateCustomer]: [boolean, any] = useState(false);

    return <Dialog onClose={() => setDialogOpen(false)} aria-labelledby="simple-dialog-title" open={dialogOpen}>
        <DialogTitle id="dialog-title" className={classes.dialogTitle}>
            <Typography className={classes.dialogTitle}>Create Customer Profile</Typography>
        </DialogTitle>
        <div className={classes.dialogAddress}>
            <Typography align="center">Customer SIN: {customerSIN}</Typography>
            <br/>
            <TextField label="Customer Name" variant="outlined" value={customerName} error={nameError}
                       helperText={nameError ? "Must provide name" : ""}
                       onChange={event => setCustomerName(event.currentTarget.value)}/>
            <br/>
            <TextField label="Customer Address" variant="outlined" value={customerAddress} error={addressError}
                       helperText={addressError ? "Must provide address" : ""}
                       onChange={event => setCustomerAddress(event.currentTarget.value)}/>
            <br/>
            <TextField label="Customer Email" variant="outlined" value={customerEmail} error={emailError}
                       helperText={emailError ? "Must provide valid email" : ""}
                       onChange={event => setCustomerEmail(event.currentTarget.value)}/>
            <br/>
            <TextField label="Customer Phone Number" variant="outlined" value={customerPhone} error={phoneError}
                       helperText={phoneError ? "Must provide valid phone number" : ""}
                       onChange={event => setCustomerPhone(event.currentTarget.value)}/>
            <br/>
        </div>
        <DialogActions>
            <Button disabled={disableCreateCustomer}
                    onClick={() => createCustomer(customerSIN, customerName, customerAddress, customerEmail, customerPhone,
                        setDisableCreateCustomer, setNameError, setAddressError, setEmailError, setPhoneError,
                        setAlertMessage, setAlertStatus, setAlertOpen, setCustomerData, setDialogOpen)}
                    variant="contained"
                    color="primary">
                Create Profile
            </Button>
            <Button onClick={() => {
                setDialogOpen(false);
            }} variant="contained" color="secondary">
                Cancel
            </Button>
        </DialogActions>
    </Dialog>
};

async function createCustomer(customerSIN: string, name: string, address: string, email: string,
                              phoneNumber: string, setDisableCreateCustomer: any, setNameError: any,
                              setAddressError: any, setEmailError: any, setPhoneError: any,
                              setAlertMessage: any, setAlertStatus: any, setAlertOpen: any,
                              setCustomerData: any, setDialogOpen: any) {
    const isNameError: boolean = name.length === 0;
    const isAddressError: boolean = address.length === 0;
    let isEmailError: boolean = email.includes(' ') || email.indexOf('@') < 1
    if (!isEmailError) {
        const index: number = email.indexOf('.', email.indexOf('@'))
        if (index < 3 || index === email.length - 1) {
            isEmailError = true;
        }
    }
    const isPhoneError: boolean = !(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im).test(phoneNumber);

    setNameError(isNameError);
    setAddressError(isAddressError);
    setEmailError(isEmailError);
    setPhoneError(isPhoneError);

    if (isNameError || isAddressError || isEmailError || isPhoneError) {
        return;
    }

    setDisableCreateCustomer(true);

    try {
        let response = await fetch(process.env.REACT_APP_SERVER_URL + "/customers", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer_sin: customerSIN,
                customer_name: name,
                customer_address: address,
                customer_email: email,
                customer_phone: phoneNumber
            })
        })
        if (response.status === 201) {
            setCustomerData({
                customer_sin: customerSIN,
                customer_name: name,
                customer_address: address,
                customer_email: email,
                customer_phone: phoneNumber
            });
            openAlert('Successfully created customer profile', 'success', setAlertMessage, setAlertStatus, setAlertOpen);
            setDialogOpen(false);
        } else {
            openAlert('Error: Unable to created customer profile', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
        }
    } catch (error) {
        console.error('Error:', error);
        openAlert('Error: Unable to created customer profile', 'error', setAlertMessage, setAlertStatus, setAlertOpen);
    }
    setDisableCreateCustomer(false);
}

function openAlert(message: string, status: string, setAlertMessage: any, setAlertStatus: any, setAlertOpen: any) {
    setAlertMessage(message);
    setAlertStatus(status);
    setAlertOpen(true);
}

export default function ManageCustomer() {
    const classes = useStyles();
    const history = useHistory();

    const [SIN, setSIN] = useState("");
    const [disableFindCustomer, setDisableFindCustomer]: [boolean, any] = useState(false);
    const [customerData, setCustomerData]: [CustomerResponse | CustomerError | null, any] = useState(null);
    const [disableReservations, setDisableReservations]: [boolean, any] = useState(false);
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

    function closeAlert() {
        setAlertOpen(false);
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
            <CreateCustomerDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} classes={classes}
                                  setAlertMessage={setAlertMessage} setAlertStatus={setAlertStatus}
                                  setAlertOpen={setAlertOpen} setCustomerData={setCustomerData}
                                  customerName={customerName} setCustomerName={setCustomerName} customerSIN={SIN}
                                  customerAddress={customerAddress} setCustomerAddress={setCustomerAddress}
                                  customerEmail={customerEmail} setCustomerEmail={setCustomerEmail}
                                  customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}/>
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={closeAlert}>
                <Alert onClose={closeAlert} severity={alertStatus}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </>
    )
}