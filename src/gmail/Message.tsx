import React from 'react';
import { Collapse } from '@material-ui/core';
import MessageHeader from './MessageHeader';
import MessageBody from './MessageBody';
import { IMessage } from './gmailAPI';

interface Props {
    message: IMessage,
    isThread?: boolean,
    archiveMessage: (messageId: string) => void
}

export default class Message extends React.Component<Props> {
    state = {
        open: false
    }

    toggleOpen() {
        this.setState({ open: !this.state.open })
    }

    render() {
        const { message, isThread, archiveMessage } = this.props;
        return (
            <>
                <div onClick={this.toggleOpen.bind(this)}>
                    <MessageHeader message={message} noOfMessages={1} isThread={isThread} archiveMessage={archiveMessage} />
                </div>
                <Collapse in={this.state.open} mountOnEnter unmountOnExit>
                    <MessageBody message={message}></MessageBody>
                </Collapse>
            </>
        )
    }
}