import React from 'react';
import logo from './logo.svg';
import './Gmail.css';
import BundleView from './gmail/BundleView';
import InboxView from './gmail/InboxView';
import { Button } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle'

import gmailInstance from './gmail/gmailAPI';




declare global {
    interface Window {
        gapi: any;
        cancelTimeout: any
    }
}



class GMail extends React.Component<{ onActivation: (title: string) => void }, { isSignedIn: boolean, messages: [], profileImage: string | any }> {
    gapi: any;
    constructor(props: Readonly<{ onActivation: (title: string) => void }>) {
        super(props)
        this.state = {
            isSignedIn: false,
            messages: [],
            profileImage: null,
        }
        props.onActivation("Inbox")

    }
    componentDidMount() {
        gmailInstance.init();
        gmailInstance.onSignInStatusChanged(this.updateSignInStatus.bind(this));
    }

    updateSignInStatus(isSignedIn: boolean) {
        this.setState({ isSignedIn })
    }

    render() {
        return (
            <div className="gmail">
                {this.state.isSignedIn ?
                    // <BundleView logo={logo} gmailApi={this.state.gmailApi}></BundleView> 
                    <InboxView /> :
                    <>
                        <h3>GManuail</h3>
                        <img src={logo} className="App-logo" alt="logo" />
                        <Button variant="contained" color="primary" onClick={gmailInstance.authorize.bind(gmailInstance)}>
                            <AccountCircle />
                            &nbsp;&nbsp;Authorize with Gmail Account
                        </Button>
                    </>
                }
            </div>
        );
    }
}

export default GMail;