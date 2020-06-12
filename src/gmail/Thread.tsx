import React from 'react';
import Collapsible from 'react-collapsible';
import MessageHeader from './MessageHeader';
import Message from './Message';
import CacheFirst from '../requestCache';
import { keys } from '../constants';
import gmailInstance, { IMessage, IThread } from './gmailAPI';


interface Props {
    thread: IThread,
    archiveThread: (id: string) => void;
}
class GmailThread extends React.Component<Props, { messages: IMessage[] }> {
    threadCache: CacheFirst;
    constructor(props: Props) {
        super(props)
        this.state = {
            messages: this.props.thread.messages || [],
        }
        this.threadCache = new CacheFirst(keys.CACHE_THREADS);
    }

    componentDidMount() {
        if (this.state.messages.length === 0) {
            gmailInstance.getThread(this.props.thread.id)
                .then(response => {
                    const messages = response.result.messages;
                    if (messages) {
                        this.setState({
                            messages
                        })
                    }
                })
        }
    }

    archiveMessage(messageId: string) {
        gmailInstance.archiveMessage(messageId).then(_ => {
            this.setState({ messages: this.state.messages.filter(message => message.id !== messageId) });
        });
    }

    archiveThread() {
        this.props.archiveThread(this.props.thread.id);
    }

    render() {
        const noOfMessages = this.state.messages.length;
        if (noOfMessages === 0) {
            return <div>'loading...'</div>
        } else {
            const lastMessage = this.state.messages[noOfMessages - 1];
            if (noOfMessages === 1) {
                return (
                    <Message message={lastMessage} archiveMessage={this.archiveThread.bind(this)} />
                )
            } else {
                return (
                    <Collapsible trigger={<MessageHeader message={lastMessage} noOfMessages={noOfMessages} archiveMessage={this.archiveThread.bind(this)} />}>
                        {
                            this.state.messages.map(message => {
                                return (
                                    <Message key={message.id} message={message} isThread={true} archiveMessage={this.archiveMessage.bind(this)} />
                                )
                            })
                        }
                    </Collapsible>
                )

            }
        }
    }


}

export default GmailThread;