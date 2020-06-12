import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import translate from '../translations';
import ThreadList from './ThreadList';
import { NetworkFirst } from '../requestCache';
import { keys } from '../constants';
import gmailInstance, { ILabel, IThread } from './gmailAPI';

interface Props {
    label?: ILabel,
    category?: string,
}

class LabelGroup extends React.Component<Props, { name: string, unread: number, open: boolean, threads: IThread[], labelColors?: any }> {
    constructor(props: Props) {
        super(props)
        let labelColors = {}
        if (props.label?.color) {
            labelColors = {
                color: props.label.color.textColor,
                backgroundColor: props.label.color.backgroundColor
            }
        }
        let name = ''
        if (props.category) {
            name = translate(props.category);
        } else if (props.label) {
            name = translate(props.label.name);
        }
        this.state = {
            name,
            unread: 0,
            open: false,
            threads: [],
            labelColors
        }
    }

    componentDidMount() {
        let labelIds = ['INBOX'];
        let query;
        if (this.props.label) {
            labelIds.push(this.props.label.id);
        } else if (this.props.category) {
            query = this.props.category;
        }
        gmailInstance.listThreads(this.state.name.replace(":", "_"), query, labelIds).then(result => {
            let { threads, resultSizeEstimate } = result;
            if (threads) {
                this.setState({ threads, unread: resultSizeEstimate })
            } else {
                this.setState({ unread: resultSizeEstimate })
            }
        })

    }
    toggleOpen() {
        this.setState({ open: !this.state.open });
    }

    archiveThread(id: string){
        gmailInstance.archiveThread(id).then(_ =>{
            this.setState({threads: this.state.threads.filter(thread => thread.id !== id)})
        })
    }

    archive(){
        gmailInstance.archiveThreads(this.state.threads.map(thread=>thread.id)).then(_=>{
            
        });
    }

    render() {
        if (this.state.unread === 0) {
            return ''
        }
        return (
            <>
                <ListItem style={this.state.labelColors} button onClick={this.toggleOpen.bind(this)}>
                    <ListItemText primary={translate(this.state.name)} secondary={this.state.unread}></ListItemText>
                    {this.state.open ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse style={{paddingLeft: "1em"}} in={this.state.open} timeout={100} mountOnEnter>
                    <ThreadList threads={this.state.threads} archiveThread={this.archiveThread.bind(this)}></ThreadList>
                </Collapse>
            </>
        )
    }
}

export default LabelGroup;