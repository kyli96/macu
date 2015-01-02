var React = require('react');

var ChannelHeader = React.createClass({
	getInitialState: function() {
		return {channel: {name: ''}};
	},
	updateChannel: function(channel) {
		this.setState({channel: channel});
	},
	render: function() {
		return (
			<div id="channel_header">
				<div id="team_menu">
					<span id="team_name" className="overflow-ellipsis right_padding">{this.props.domain.name}</span>
					<i className="fa fa-chevron-down"></i>
				</div>
				<h2 id="active_channel_name" className="overflow-ellipsis">
					<span className="star fa fa-star star_channel"></span>
					<span className="name"><span className="prefix">#</span>{this.state.channel.name}</span>
					<i id="channel_action" className="fa fa-chevron-down"></i>
				</h2>
			</div>
		);
	}
});

module.exports = ChannelHeader;