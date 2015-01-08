var React = require('react');
var SearchPane = require('./SearchPane');

var SidePane = React.createClass( {
    render: function () {
        return (
<div id="side_pane_content">
<SearchPane />
</div>
        );
    }
});

module.exports = SidePane;