const e = React.createElement;
const dom = document.querySelector('#options');

class Options extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return e(
            'button', {}, 'click me'
        )
    }
}

ReactDOM.render(e(Options), dom)