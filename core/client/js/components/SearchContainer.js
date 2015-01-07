var React = require('react');

var SearchContainer = React.createClass( {
    _onChange: function (e) {
		this.setState({text: event.target.value});
    },
    _onSubmit: function (e) { 
        e.preventDefault();
    },
    _onFocus: function (e) { 
        this.setState({ search_focused: true });
    },
    _onBlur: function (e) { 
        this.setState({ search_focused: false });
    },
    getInitialState: function () {
        return { text: '', search_focused: false };
    },
    render: function () {
        _form_class = "search_form";
        if (this.state.search_focused) {
            _form_class += " search_focused";
        }
        return (
<form id="header_search_form" method="get" action="/api/messages/search" className={_form_class} 
onSubmit={this._onSubmit} onFocus={this._onFocus} onBlur={this._onBlur}>
<div className="highlighter_wrapper">
<input type="hidden" name="domain" value={this.props.domain} />
<input type="text" name="q" value={this.state.text} onChange={ this._onChange} 
className="search_input search_input_highlighted" autoComplete="off" maxLength="200" />
</div>
<div className="icon_search client_header_icon fa fa-search"></div>
</form>
        );
    }
});

module.exports = SearchContainer;