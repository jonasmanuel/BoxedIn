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
import { ILabel } from './BundleView';

interface Props {
    label?: ILabel,
    category?: string,
    gmailApi: any,
}

class LabelGroup extends React.Component<Props, {name: string, unread: number, open: boolean, threads: any[], labelColors?: any}> {
    cache: NetworkFirst;
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

        this.cache = new NetworkFirst(keys.CACHE_BUNDLES);

    }

    componentDidMount() {
        let request = null;
        if (this.props.label) {
            request = this.props.gmailApi.threads.list({
                userId: 'me',
                labelIds: ['INBOX', this.props.label.id],
            })
        } else if (this.props.category) {
            request = this.props.gmailApi.threads.list({
                userId: 'me',
                q: this.props.category,
                labelIds: ['INBOX'],
            })
        }
        this.cache.get(this.state.name.replace(":","_"), request).then(response => {
            if (response.result.threads) {
                this.setState({ threads: response.result.threads, unread: response.result.resultSizeEstimate })
            } else {
                this.setState({ unread: 0 })
            }
        })

    }
    handleClick() {
        this.setState({ open: !this.state.open });
    }

    render() {
        if (this.state.unread === 0) {
            return ''
        }
        return (
            <>
                <ListItem style={this.state.labelColors} button onClick={this.handleClick.bind(this)}>
                    <ListItemText primary={translate(this.state.name)} secondary={this.state.unread}></ListItemText>
                    {this.state.open ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={this.state.open} timeout="auto" mountOnEnter unmountOnExit>
                    <ThreadList threads={this.state.threads} gmailApi={this.props.gmailApi}></ThreadList>
                </Collapse>
            </>
        )
    }
}

export default LabelGroup;