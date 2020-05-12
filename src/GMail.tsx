import React from 'react';
import credentials from './credentials.json';
import logo from './logo.svg';
import './Gmail.css';
import BundleView from './gmail/BundleView';
import InboxView from './gmail/InboxView';
import { IconButton, Button } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle'
import ExitToApp from '@material-ui/icons/ExitToApp'
import Avatar from '@material-ui/core/Avatar';


// Authorization scopes required by the API; 
const scope = 'https://www.googleapis.com/auth/gmail.readonly';
// Array of API discovery doc URLs for APIs used by the quickstart
const discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
// api keys 
const clientId = credentials.web.client_id;
const apiKey = credentials.web.api_key;

declare global {
    interface Window {
        gapi:any;
        cancelTimeout: any
    }
}
  


class GMail extends React.Component<{},{isSignedIn: boolean, messages: [], gmailApi: any, profileImage: string | any}> {
    gapi: any;
    constructor(props: Readonly<{}>) {
        super(props)
        this.state = {
            isSignedIn: false,
            messages: [], 
            gmailApi : null,
            profileImage: null,
        }

    }
    componentDidMount() {
        this.gapi = window.gapi;
        this.gapi.load('client:auth2', () => {
            this.gapi.client.init({ apiKey, clientId, discoveryDocs, scope }).then(() => {
                //register signin status event handler
                this.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSignInStatus.bind(this));

                // Handle the initial sign-in state.
                this.updateSignInStatus(this.gapi.auth2.getAuthInstance().isSignedIn.get());

            }, (error: any) => {
                console.log('Error: ' + error)
            })
        });
    }
    updateSignInStatus(isSignedIn: boolean) {
        if (isSignedIn) {
            var profile = this.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile()
            // console.log('ID: ' + profile.getId());
            // console.log('Full Name: ' + profile.getName());
            // console.log('Given Name: ' + profile.getGivenName());
            // console.log('Family Name: ' + profile.getFamilyName());
            // console.log('Image URL: ' + profile.getImageUrl());
            // console.log('Email: ' + profile.getEmail());
            // this.listEmails()
            this.setState({
                gmailApi: this.gapi.client.gmail.users,
                profileImage: profile.getImageUrl()
            })
        }
        this.setState({ isSignedIn })
    }

    render() {
        return (
            <div className="gmail">
                <div className="buttons">
                    {!this.state.isSignedIn ?
                        '' :
                        <div style={{ display: 'inline-flex' }}>
                            <Avatar src={this.state.profileImage}></Avatar>
                            <IconButton onClick={this.signOut}>
                                <ExitToApp />
                            </IconButton>
                        </div>
                    }
                </div>
                {this.state.isSignedIn && this.state.gmailApi ?
                    // <BundleView logo={logo} gmailApi={this.state.gmailApi}></BundleView> 
                    <InboxView gmailApi={this.state.gmailApi}></InboxView>:
                    <>
                        <h3>GManuail</h3>
                        <img src={logo} className="App-logo" alt="logo" />
                        <Button variant="contained" color="primary" onClick={this.authorize}>
                            <AccountCircle />
                            &nbsp;&nbsp;Authorize with Gmail Account
                        </Button>
                    </>
                }
            </div>
        );
    }

    authorize() {
        window.gapi.auth2.getAuthInstance().signIn();
    }
    signOut() {
        window.gapi.auth2.getAuthInstance().signOut();
    }
}

export default GMail;