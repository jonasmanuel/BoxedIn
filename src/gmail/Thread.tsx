import React from 'react';
import Collapsible from 'react-collapsible';
import MessageHeader from './MessageHeader';
import Message from './Message';
import CacheFirst from '../requestCache';
import { keys } from '../constants';


interface Props {
    thread: { id: string, messages: any[] },
    gmailApi: any
}
class GmailThread extends React.Component<Props, { messages: any[], noOfMessages: number, latestMessage?: any }> {
    threadCache: CacheFirst;
    constructor(props: Props) {
        super(props)
        this.state = {
            messages: this.props.thread.messages || [],
            noOfMessages: this.props.thread.messages?.length || 0,
            latestMessage: this.props.thread.messages ? this.state.messages[this.state.messages.length - 1] : null
        }
        this.threadCache = new CacheFirst(keys.CACHE_THREADS);
    }

    componentDidMount() {
        if (this.state.messages.length === 0) {
            this.threadCache.get(this.props.thread.id,
                this.props.gmailApi.threads.get({
                    userId: 'me',
                    id: this.props.thread.id
                })
            ).then(response => {
                const messages = response.result.messages;
                this.setState({
                    messages,
                    noOfMessages: messages.length,
                    latestMessage: messages[messages.length - 1]
                })
            })
        }
    }

    render() {
        if (this.state.noOfMessages === 0) {
            return <div>'loading...'</div>
        }
        if (this.state.noOfMessages === 1) {
            return (
                <Message message={this.state.latestMessage} />
            )
        }
        return (
            <Collapsible trigger={<MessageHeader message={this.state.latestMessage} noOfMessages={this.state.noOfMessages} />}>
                {
                    this.state.messages.map(message => {
                        return (
                            <Message key={message.id} message={message} isThread={true} />
                        )
                    })
                }
            </Collapsible>
        )
    }


}

export default GmailThread;