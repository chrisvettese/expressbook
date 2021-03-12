import {AppBar, Button, makeStyles, TextField, Typography} from "@material-ui/core";
import {useState} from "react";

const useStyles = makeStyles(() => ({
    title: {
        fontSize: "2.5em",
        fontWeight: "bold",
        paddingLeft: "1em"
    },
    sinCentre: {
        paddingTop: '5em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonCentre: {
        paddingTop: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
}));

export default function Customer() {
    const classes = useStyles();
    const [SIN, setSIN] = useState("");
    const sin_re: RegExp = /^[0-9]{3}-[0-9]{3}-[0-9]{3}$/;

    function validateSIN(): boolean {
        return !sin_re.test(SIN) && SIN.length !== 0;
    }

    return (
        <>
            <AppBar position="static">
                <Typography className={classes.title}>ExpressBook Customer Portal</Typography>
            </AppBar>
            <div className={classes.sinCentre}>
                <Typography>To begin searching destinations, enter your social insurance number:</Typography>
            </div>
            <div className={classes.sinCentre}>
                <TextField error={validateSIN()} helperText={validateSIN() ? "SIN must have format XXX-XXX-XXX" : ""}
                           onChange={(event) => setSIN(event.currentTarget.value)}
                           id="outlined-basic" label="Social Insurance Number" variant="outlined" value={SIN}/>
            </div>
            <div className={classes.buttonCentre}>
                <Button variant="contained" disabled={!sin_re.test(SIN)}>Sign In</Button>
            </div>

        </>
    )
}