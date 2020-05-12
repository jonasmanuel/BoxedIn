import React from 'react';
import { get as lsget, set as lsset } from 'local-storage';
import './Settings.css';
import TransferList from './components/TransferList';
import CacheFirst from './requestCache';
import translate from './translations';
import { noShow, defaultSettings, keys } from './constants';


interface Props {

}

interface State {
    labels: any,
    bundleLabels: any,
    sortLabel: any
}

export default class Settings extends React.Component<Props, State> {
    cache: CacheFirst;
    constructor(props: Readonly<Props>) {
        super(props)
        this.state = lsget(keys.settings) || defaultSettings;

        this.cache = new CacheFirst(keys.CACHE_LABLES);
    }

    componentDidMount() {
        this.cache.get("ALL-LABELS").then((responses: { result: [{ result: { id: string, name: string } }] }) => {
            return Object.values(responses.result)
                .map(response => response.result)
                .filter(label => !noShow.includes(label.id))
                .sort((a, b) => translate(a.name) > translate(b.name) ? 1 : -1);
        }).then((labels: any[]) => {
            //TODO filter categories from labels

            let labelMap = labels.reduce((m, label) => {
                m[label.id] = label
                return m
            }, {});
            let unchosen: any = {}
            for (let key in labelMap) {
                if (!this.state.bundleLabels[key]) {
                    unchosen[key] = labelMap[key];
                }
            }
            this.setState({ labels: unchosen });
        });
    }

    componentWillUnmount() {
        lsset('settings', this.state);
    }

    selectionChanged(added: string | any[], removed: string | any[]) {
        if (added.length === 0 && removed.length === 0)
            return;

        let labels = Object.assign({}, this.state.labels);
        let bundleLabels = Object.assign({}, this.state.bundleLabels);

        for (let add of added) {
            bundleLabels[add.id] = add;
            delete labels[add.id];
        }

        for (let remove of removed) {
            delete bundleLabels[remove.id];
            labels[remove.id] = remove;
        }

        this.setState({ labels, bundleLabels })
    }

    render() {
        return (
            <div className="settings">
                <h2>Settings</h2>
                <TransferList left={Object.values(this.state.labels)} right={Object.values(this.state.bundleLabels)} labelProvider={(label: { name: string; }) => translate(label.name)} selectionChanged={this.selectionChanged.bind(this)}></TransferList>
            </div>
        )
    }
}