var React = require('react'),
    ChannelHeader = require('./channelheader'),
    SearchContainer = require('./SearchContainer');

var Header = React.createClass({
    render: function() {
        return (
<div>
<ChannelHeader domain={this.props.domain} />
<SearchContainer domain={this.props.domain} />
</div>
        );
    }
});

module.exports = Header;
