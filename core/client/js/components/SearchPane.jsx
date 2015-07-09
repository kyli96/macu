var React = require('react');
var SearchStore = require('../stores/SearchStore');
var MessageList = require('./messages.jsx');
var Message = MessageList.Message;
var ResizeUtils = require('../resizeUtils');
var Scrollers = require('../scroller');
var SearchActionCreators = require('../actions/SearchActionCreators');

var SearchPane = React.createClass({
    mixins: [ReactIntlMixin],
	getInitialState: function() {
		return {active: false, results: SearchStore.getResults()};
    },
    componentDidMount: function() {
        SearchStore.addChangeListener(this._onChange);
    },
    _onChange: function () {
        this.setState({ results: SearchStore.getResults() }, function () {
            ResizeUtils.resizeMessageScrollDiv();
            if (!Scrollers.scrollPanes['search_results_scroll_div']) {
                Scrollers.init('search_results_scroll_div');
            } else {
                Scrollers.scrollPanes['search_results_scroll_div'].update();
            }
            Scrollers.scrollPanes['search_results_scroll_div'].gotoTop();
        });
    },
    _onShow: function (){
        this.setState({ active: true });
    },
    _onHide: function () {
        this.setState({ active: false });
    },
    _onClickMessage: function(msg) {
        SearchActionCreators.clickMessageResult(msg);
    },
    render: function () {
        var renderMessage = function (message) {
            return (
                <div className="search_message_result" onClick={this._onClickMessage.bind(this, message)} key={message._id}>
                  <div className="search_result_with_extract">
                    <Message key={message.ts} msg={ message} showDayDivider={ false} />
                  </div>
                </div>
            );
        }.bind(this);
        var _className = "tab-pane";
        if (this.state.active) {
            _className += " active";
        }
        return (
            <div id="search_tab" className={_className}>
              <div id="search_result_container">
                <div className="heading">
                  <div id="search_heading" className="inline-block">{this.formatMessage(this.getIntlMessage('search.searchResults'))}</div>
                </div>
                <div id="search_results_scroll_div" className="side_pane_scroll_div macu_scroller">
                  <div id="search_message_results">
                    {this.state.results.map(renderMessage)}
                  </div>
                </div>
              </div>
            </div>
        );
    }
});

module.exports = SearchPane;