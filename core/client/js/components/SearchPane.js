var React = require('react');
var SearchStore = require('../stores/SearchStore');
var MessageList = require('./messages.js');
var Message = MessageList.Message;
var resizeUtils = require('../resizeUtils');
var Scrollers = require('../scroller');

var SearchPane = React.createClass({
	getInitialState: function() {
		return {active: false, results: SearchStore.getResults()};
    },
    componentDidMount: function() {
        SearchStore.addChangeListener(this._onChange);
    },
    _onChange: function () {
        this.setState({ results: SearchStore.getResults() }, function () { 
            if (!Scrollers.scrollPanes['search_results_scroll_div']) {
                Scrollers.init('search_results_scroll_div');
            } else {
                Scrollers.scrollPanes['search_results_scroll_div'].update();
            }
        });
    },
    _onShow: function (){
        this.setState({ active: true });
    },
    _onHide: function () {
        this.setState({ active: false });
    },
    render: function () {
        var renderMessage = function (message) {
            return (
<div className="search_message_result" key={message._id}>
<div className="search_result_with_extract">
<Message key={message.ts} msg={ message} showDayDivider={ false} />
</div>
</div>
            );
        };
        var _className = "tab-pane";
        if (this.state.active) {
            _className += " active";
        }
        return (
<div id="search_tab" className={_className}>
<div id="search_results_scroll_div">
<div id="search_message_results">
{this.state.results.map(renderMessage)}
</div>
</div>
</div>
        );
    }
});

module.exports = SearchPane;