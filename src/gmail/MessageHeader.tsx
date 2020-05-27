import React from 'react';
import { Avatar } from '@material-ui/core';
import translate from '../translations';
import { arrayToMap } from '../utils';

export function headerMap(headers: [{name: string, value: any}]) {
    return arrayToMap(headers, header => header.name, header => header.value);
}

export default class MessageHeader extends React.Component<{message: any, noOfMessages: number, isThread?: boolean}> {
    render() {
        const classes = {
            root: {
                display: 'flex'
            }
        }
        let message = this.props.message;
        let noOfMessages = this.props.noOfMessages;
        let isThread = this.props.isThread;
        let headers = headerMap(message.payload.headers)
        const subject = headers["Subject"];
        const from = headers["From"].replace(">", "").split("<");
        from[0] = from[0].replace(/"/g, '');
        const read = !message.labelIds.includes("UNREAD");
        return (
            <div className={"message " + (isThread ? "threaded " : "") + (read ? "read" : "")} style={classes.root}>
                <Avatar>{from[0][0]}</Avatar>
                <div >
                    <div title={from[1]}><b>{from[0]}</b>{noOfMessages > 1 ? noOfMessages : ""}</div>
                    <div><b>Subject:</b> {subject}</div>
                    <div title={message.snippet} className="snippet">{message.snippet}</div>
                    {this.props.message.labelIds.map((label : string )=> <Tag text={translate(label)}></Tag>)}
                </div>
            </div>
        )
    }
}

export function Tag(props:{textColor?: string, backgroundColor?: string, text: string}) {
    const style = {
        color: props.textColor || 'black',
        background: props.backgroundColor || 'white',
        borderRadius: '0.25em',
        display: 'inline-block',
        marginRight: '0.5em',
        padding: '0 5px'
    }
    return <div style={style} >{props.text}</div>
}