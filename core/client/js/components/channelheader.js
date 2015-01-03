var React = require('react');
var ChannelStore = require('../stores/ChannelStore');

function getStateFromStores() {
    return {
        channel: ChannelStore.getCurrentChannel()
    };
}

var ChannelHeader = React.createClass({
	getInitialState: function() {
        return getStateFromStores();
    },
    componentDidMount: function() {
        ChannelStore.addChangeListener(this._onChange);
    },
    _onChange: function() {
        this.setState(getStateFromStores());
    },
    render: function() {
        var channel_name = '';
        if (this.state.channel) {
            channel_name = this.state.channel.name;
        }
        return (
            <div id="channel_header">
                <div id="team_menu">
                    <span id="team_name" className="overflow-ellipsis right_padding">{this.props.domain.name}</span>
                    <i className="fa fa-chevron-down"></i>
                </div>
                <h2 id="active_channel_name" className="overflow-ellipsis">
                    <span className="star fa fa-star star_channel"></span>
                    <span className="name"><span className="prefix">#</span>{channel_name}</span>
                    <i id="channel_action" className="fa fa-chevron-down"></i>
                </h2>
            </div>
       );
  }
});

module.exports = ChannelHeader;