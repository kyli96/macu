var React = require('react');
var ChannelStore = require('../stores/ChannelStore');
var ChannelActionCreators = require('../actions/ChannelActionCreators');

function getStateFromStores() {
    return {
        channels: ChannelStore.getAvailableChannels()
    };
}

var JoinChannel = React.createClass({
    mixins: [ReactIntlMixin],
    getInitialState: function() {
        return getStateFromStores();
    },
    componentDidMount: function() {
        ChannelStore.addChangeListener(this._onChange);
    },
    _onChange: function() {
        this.setState(getStateFromStores());
    },
    _onClickJoin: function() {
        if (this.state.selectedId) {
            ChannelActionCreators.joinChannel(this.state.selectedId);
            this.setState({ selectedId: null });
        }
    },
    _onClickChannel: function (channel_id) {
        this.setState({selectedId: channel_id});
    },
    render: function (){
        var renderChannel = function (channel) {
            var className = "modal_channel";
            if (this.state.selectedId == channel._id) {
                className += " active";
            }
            return (
                <div className={className} key={channel._id} onClick={ this._onClickChannel.bind(this, channel._id)}>
                  <div className="modal_channel_name">{channel.name}</div>
                  <p className="message">{channel.description}</p>
                </div>
            );
        }.bind(this);
        return (
			<div className="modal-dialog">
			  <div className="modal-content">
      			<div className="modal-header">
        		  <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        		  <h4 className="modal-title">{this.formatMessage(this.getIntlMessage('channel.joinChannel'))}</h4>
      			</div>
      			<div className="modal-body">
                  <div id="join_channels_scroll_div">
                    <div className="modal-content-items">
                      {this.state.channels.map(renderChannel)}
                    </div>
                  </div>
      			</div>
      			<div className="modal-footer">
                  <button type="button" className="btn btn-default" data-dismiss="modal">
                  {this.formatMessage(this.getIntlMessage('common.cancel'))}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={this._onClickJoin}>
                  {this.formatMessage(this.getIntlMessage('channel.join'))}
                  </button>
      			</div>
			  </div>
			</div>
        );
    }
});

module.exports = JoinChannel;