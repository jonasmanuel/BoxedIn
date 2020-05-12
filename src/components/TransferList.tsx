import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
        overflow: 'auto'
    },
    cardHeader: {
        padding: theme.spacing(1, 2),
    },
    list: {
        width: 300,
        height: '60vh',
        minHeight: 200,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    button: {
        margin: theme.spacing(0.5, 0),
    },
}));

function not(a: any[], b: any[]) {
    return a.filter((value: any) => b.indexOf(value) === -1);
}

function intersection(a: any[], b: any[]) {
    return a.filter((value: any) => b.indexOf(value) !== -1);
}

function union(a: any[], b: any[]) {
    return [...a, ...not(b, a)];
}

export default function TransferList(props: { labelProvider: any; selectionChanged: any; left: any[]; right: any[] }) {
    const classes = useStyles();
    const [checked, setChecked] = React.useState([] as any[]);
    const [left, setLeft] = React.useState([] as any[]);
    const [right, setRight] = React.useState([] as any[]);
    const getLabel = props.labelProvider;
    const rightUpdated = props.selectionChanged;

    React.useEffect(() => {
        setLeft(props.left)
    }, [props.left]);

    React.useEffect(() => {
        setRight(props.right)
    }, [props.right]);

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const handleToggle = (value: any) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const numberOfChecked = (items: any[]) => intersection(checked, items).length;

    const handleToggleAll = (items: any[]) => () => {
        if (numberOfChecked(items) === items.length) {
            setChecked(not(checked, items));
        } else {
            setChecked(union(checked, items));
        }
    };

    const handleCheckedRight = () => {
        const added = leftChecked;
        setRight(right.concat(added));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
        rightUpdated(added, [])
    };

    const handleCheckedLeft = () => {
        const removed = rightChecked;
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
        rightUpdated([], removed);
    };

    const customList = (title: string, items: any[]) => (
        <Card>
            <CardHeader
                className={classes.cardHeader}
                avatar={
                    <Checkbox
                        onClick={handleToggleAll(items)}
                        checked={numberOfChecked(items) === items.length && items.length !== 0}
                        indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
                        disabled={items.length === 0}
                        inputProps={{ 'aria-label': 'all items selected' }}
                    />
                }
                title={title}
                subheader={`${numberOfChecked(items)}/${items.length} selected`}
            />
            <Divider />
            <List className={classes.list} dense component="div" role="list">
                {items.map((value: any) => {
                    const label = getLabel(value);
                    const labelId = `transfer-list-all-item-${label}-label`;

                    return (
                        <ListItem key={label} role="listitem" button onClick={handleToggle(value)}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.indexOf(value) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={`${label}`} />
                        </ListItem>
                    );
                })}
                <ListItem />
            </List>
        </Card>
    );

    return (
        <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
            <Grid item>{customList('Choices', left)}</Grid>
            <Grid item>
                <Grid container direction="column" alignItems="center">
                    <Button
                        variant="outlined"
                        size="small"
                        className={classes.button}
                        onClick={handleCheckedRight}
                        disabled={leftChecked.length === 0}
                        aria-label="move selected right"
                    >
                        &gt;
          </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        className={classes.button}
                        onClick={handleCheckedLeft}
                        disabled={rightChecked.length === 0}
                        aria-label="move selected left"
                    >
                        &lt;
          </Button>
                </Grid>
            </Grid>
            <Grid item>{customList('Chosen', right)}</Grid>
        </Grid>
    );
}