var React = require('react');
var ChannelHeader = require('./channelheader.jsx');
var SearchContainer = require('./SearchContainer.jsx');
var SidePaneActionCreators = require('../actions/SidePaneActionCreators');
var SearchStore = require('../stores/SearchStore');

var Header = React.createClass({
	getInitialState: function() {
		return {side_pane_active: false};
    },
    componentDidMount: function() {
        SearchStore.addChangeListener(this._onChange);
    },
    _onChange: function () {
        if (!this.state.side_pane_active) {
            this.setState({ side_pane_active: true });
        }
    },
    _onClickSidePaneToggle: function () {
        SidePaneActionCreators.toggleSidePane();
        this.setState({ side_pane_active: !this.state.side_pane_active });
    },
    render: function () {
        var _side_pane_toggle_title = this.state.side_pane_active ? "Hide Side Pane" : "Show Side Pane";
        var _side_pane_toggle_class = "client_header_icon icon_side_pane fa fa-2x ";
        _side_pane_toggle_class += this.state.side_pane_active ? "fa-caret-square-o-right" : "fa-caret-square-o-left";
        return (
<div>
<ChannelHeader domain={this.props.domain} />
<SearchContainer domain={this.props.domain} />
<a id="side_pane_toggle" title={_side_pane_toggle_title} className="client_header_button"
onClick={this._onClickSidePaneToggle}>
<i className={_side_pane_toggle_class}></i>
</a>
</div>
        );
    }
});

module.exports = Header;