var ChannelsCol = React.createClass({
    _onClickChannel: function(i) {
        var new_cid = this.props.channels[i]._id;
        if (new_cid == this.props.currentCid) {
            return;
        }
        if (!this.props.onCurrentCidChange) {
            return;
        }
        this.props.onCurrentCidChange(new_cid);
    },
    _onClickCreateChannel: function() {
        if (this.props.onClickCreateChannel) {
            this.props.onClickCreateChannel();
        }
    },
    render: function () {
        var createItem = function (channel, i) {
            return (
                <li className="channel" key={i}>
                    <a id={channel._id} onClick={this._onClickChannel.bind(this, i)} className="channel_name">#{channel.name}</a>
                </li>
            );
        }.bind(this);
        return (
            <div id="channels" className="section_holder">
              <h2 id="channels_header" className="hoverable">Channels</h2>
              <ul id="channels_list">
                {this.props.channels.map(createItem)}
                <a className="create_channel list_more" onClick={this._onClickCreateChannel}>Create Channel</a>
              </ul>
            </div>
        );
    }
});