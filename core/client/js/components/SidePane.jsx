var React = require('react');
var SearchPane = require('./SearchPane.jsx');

var SidePane = React.createClass( {
    render: function () {
        return (
<div id="side_pane_content">
<SearchPane locales={this.props.locales} messages={this.props.messages} />
</div>
        );
    }
});

module.exports = SidePane;