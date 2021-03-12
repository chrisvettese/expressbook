import {makeStyles} from "@material-ui/core";
import React, {useState} from "react";
import {TitleBar} from "../index";

const useStyles = makeStyles(() => ({

}));

export default function Welcome() {
    const classes = useStyles();

    return (
        <>
            <TitleBar/>
        </>
    )
}