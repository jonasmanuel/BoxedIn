import React from 'react';
import { NetworkFirst } from '../requestCache';
import {noShow, keys} from '../constants';
import LabelGroup from './LabelGroup';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';


interface Props {
    logo: any,
    classes: any,
    gmailApi: any
}

export interface ILabel {
    id: string,
    threadsTotal: number,
    name: string,
    color?: {
        textColor: string,
        backgroundColor: string
    }
};

class BundleView extends React.Component<Props,{labels: any[]}> {
    cache: NetworkFirst;
    constructor(props: Props) {
        super(props)
        this.state = {
            labels: []
        }

        this.cache = new NetworkFirst(keys.CACHE_LABLES);
    }

    componentDidMount() {
        this.getLabels()
    }

    getLabels() {
        return this.props.gmailApi.labels.list({
            'userId': 'me'
        }).then((response: { result: { labels: [{id: string}]; }; }) => {
            let batch = window.gapi.client.newBatch();
            response.result.labels.filter(label => !noShow.includes(label.id)).forEach(label => {
                batch.add(window.gapi.client.request({
                    path: 'gmail/v1/users/me/labels/' + label.id,
                    params: {}
                }));
            });
            return this.cache.get("ALL-LABELS", batch).then((responses: {result: {result : any}}) => {
                return Object.values(responses.result).map(response => response.result);
            }, error => {
                console.log(error);
            })
        })
            .then((labels: ILabel[]) => {
                let labelsSorted  = labels.filter(label => label.threadsTotal > 0).sort((l1, l2) => l1.name.localeCompare(l2.name))
                this.setState({ labels:  labelsSorted})
            });
    }

    render() {
        return this.renderLables(this.state.labels)
    }

    renderLables(labels: ILabel[]) {
        const { classes } = this.props;
        return <>
            <h3>Bundle View</h3>
            <List className={classes.root}>

                {
                    labels.length === 0 ?
                        <img src={this.props.logo} className="App-logo" alt="logo" />
                        :
                        labels.map(label => <LabelGroup key={label.id} label={label} gmailApi={this.props.gmailApi}></LabelGroup>)
                }
            </List>
        </>
    }
}

export default withStyles(theme => ({
    root: {
        width: '50vw',
        overflowY: 'auto',
        backgroundColor: theme.palette.background.paper,
    },
}), { withTheme: true })(BundleView);