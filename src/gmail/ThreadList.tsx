import React from 'react'
import GmailThread from "./Thread";
import { IThread } from './gmailAPI';

export default function ThreadList(props: { threads: IThread[], archiveThread: (id: string) => void }) {
    return (
        <>
            {props.threads
                .map(thread => <GmailThread thread={thread} key={thread.id} archiveThread={props.archiveThread}></GmailThread>)}
        </>
    )
}