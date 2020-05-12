import React from 'react';
import { Collapse } from '@material-ui/core';
import MessageHeader from './MessageHeader';
import MessageBody from './MessageBody';


export default class Message extends React.Component<{message: any, isThread?: boolean}> {
    state = {
        open: false
    }

    toggleOpen() {
        this.setState({ open: !this.state.open })
    }

    render() {
        const { message } = this.props;
        return (
            <>
                <div onClick={this.toggleOpen.bind(this)}>
                    <MessageHeader message={message} noOfMessages={1} isThread={this.props.isThread}  />
                </div>
                <Collapse in={this.state.open} mountOnEnter unmountOnExit>
                    <MessageBody message={message}></MessageBody>
                </Collapse>
            </>
        )
    }
}