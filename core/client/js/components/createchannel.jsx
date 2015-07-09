var React = require('react');

var CreateChannel = React.createClass({
    mixins: [ReactIntlMixin],
	_onClickSave: function(event) {
		if (this.props.onClickSave) {
			this.props.onClickSave(this.state);
			this.setState(this.getInitialState());
		}
	},
	getInitialState: function() {
		return {name: '', description: ''};
	},
	_onNameChange: function(event) {
		this.setState({name: event.target.value});
	},
	_onDescriptionChange: function(event) {
		this.setState({description: event.target.value});
	},
	render: function() {
		return (
			<div className="modal-dialog">
			  <div className="modal-content">
      			<div className="modal-header">
        		  <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 className="modal-title">
                    {this.formatMessage(this.getIntlMessage('channel.createChannel'))}
                    </h4>
      			</div>
      			<div className="modal-body">
      			  <p className="top_margin">
        		  <label htmlFor="channel_name" className="inline-block">{this.formatMessage(this.getIntlMessage('channel.name'))}</label> 
        		  <input className="title_input" type="text" id="channel_name" value={this.state.name} onChange={this._onNameChange} />
        		  </p>
        		  <p>
        		  <label htmlFor="channel_desc" className="inline-block">
        		  {this.formatMessage(this.getIntlMessage('channel.description'))}<br/>
        		  <span className="normal">({this.formatMessage(this.getIntlMessage('common.optional'))})</span>
        		  </label>
        		  <textarea maxLength="250" id="channel_desc" value={this.state.description} onChange={this._onDescriptionChange} />
      			  </p>
      			</div>
      			<div className="modal-footer">
                  <button type="button" className="btn btn-default" data-dismiss="modal">
                  {this.formatMessage(this.getIntlMessage('common.cancel'))}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={this._onClickSave}>
                  {this.formatMessage(this.getIntlMessage('common.save'))}
                  </button>
      			</div>
			  </div>
			</div>
		);
	}
});

module.exports = CreateChannel;