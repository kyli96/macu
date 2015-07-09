var Login = React.createClass( {
    mixins: [ReactIntlMixin],
    render: function () {
        var showMessage = function () {
            if (this.props.message) {
                return <p>{ this.props.message }</p>;
            }
            return '';
        }.bind(this);
        if (this.props.show == 'login') {
            return (
              <div className="wrapper">
                <form method="post" action="/login" className="form-signin">
                  <h2 className="form-signin-heading">{ this.formatMessage(this.getIntlMessage('user.please_login')) }</h2>
                  {showMessage()}
                  <input type="text" className="form-control" name="domain" placeholder={this.formatMessage(this.getIntlMessage('user.team_name'))} required="" autofocus="" />
                  <input type="text" className="form-control" name="email" placeholder={this.formatMessage(this.getIntlMessage('user.email'))} required="" />
                  <input type="password" className="form-control last-input" name="password" placeholder={this.formatMessage(this.getIntlMessage('user.password'))} required="" />
                  <label className="checkbox">
                    <input type="checkbox" value="remember-me" id="rememberMe" name="rememberMe" />{this.formatMessage(this.getIntlMessage('user.remember_me'))}
                  </label>
                  <button className="btn btn-lg btn-primary btn-block" type="submit">{this.formatMessage(this.getIntlMessage('user.login'))}</button>
                  <p>{this.formatMessage(this.getIntlMessage('common.or'))} <a href="/signup">{this.formatMessage(this.getIntlMessage('user.signup_here'))}</a></p>
                </form>
              </div>
            );
        }
        else {
            return (
              <div className="wrapper">
                <form method="post" action="/signup" className="form-signin">
                  <h2 className="form-signin-heading">{this.formatMessage(this.getIntlMessage('user.signup_now'))}</h2>
                  {showMessage()}
                  <input type="text" className="form-control" name="domain" placeholder={this.formatMessage(this.getIntlMessage('user.team_name'))} required="" autofocus="" />
                  <input type="text" className="form-control" name="name" placeholder={this.formatMessage(this.getIntlMessage('user.full_name'))} required="" />
                  <input type="text" className="form-control" name="email" placeholder={this.formatMessage(this.getIntlMessage('user.email'))} required="" />
                  <input type="password" className="form-control" name="password" placeholder={this.formatMessage(this.getIntlMessage('user.password'))} required="" />
                  <input type="password" className="form-control last-input" name="confirm_password" placeholder={this.formatMessage(this.getIntlMessage('user.confirm_password'))} required="" />
                  <button className="btn btn-lg btn-primary btn-block" type="submit">{this.formatMessage(this.getIntlMessage('user.signup'))}</button>
                </form>
              </div>
            );
        }
    }
});

module.exports = Login;