var ChannelList = React.createClass({
    render: function () {
        var createItem = function (channel) {
            return <li className="channel"><a id={channel._id} className="channel_name">#{channel.name}</a></li>;
        };
        return <ul id="channels_list">{this.props.items.map(createItem)}</ul>;
    }
});

var ChannelsCol = React.createClass({
    getInitialState: function () {
        return {
            currentCid: null,
            channels: []
        };
    },
    componentDidMount: function () {
        Mf.getChannels(function (data) {
            if (this.isMounted()) {
                var current_cid = M.currentCid || data[0]._id;
                this.setState({
                    currentCid: current_cid,
                    channels: data
                });
            }
        }.bind(this));
    },
    render: function () {
        return (
            <div id="channels_col">
              <div id="channels" className="section_holder">
                <h2 id="channels_header" className="hoverable">Channels</h2>
                <ChannelList items={this.state.channels} ccid={this.state.currentCid} />
              </div>
            </div>
        );
    }
});