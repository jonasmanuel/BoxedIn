import React from 'react'
import GmailThread from "./Thread";

export default function ThreadList(props: { threads: any[], gmailApi: any }) {
    return (
        <>
            {props.threads
                .map(thread => <GmailThread thread={thread} key={thread.id} gmailApi={props.gmailApi}></GmailThread>)}
        </>
    )
}