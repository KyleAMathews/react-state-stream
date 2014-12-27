/*global -React */
var React = require('react');
var I = require('Immutable');
var stateStream = require('./stateStream');

var Child = React.createClass({
  mixins: [stateStream.Mixin],
  getInitialStateStream: function() {
    return stateStream.toRange(999999).map(function(ms, i) {
      // note that we use this.props here, and because of laziless, we know it's
      // gonna be the very current value of props (when the item is evaluated).
      // This is abusing the behavior of laziness and likely not a good idea
      // (e.g. in clojure, lazy seqs are chunked 32 items at time rather than 1,
      // so this shortcut wouldn't work)
      return I.Map({
        // *3 to offset the parent rotation. Just some visual nit
        deg: ((this.state && this.state.deg) || 0) + 2 * (this.props.turnLeft ? -1 : 3)
      });
    }, this);
  },

  render: function() {
    // turn right 3 times faster to offset parent turning left. Just visual nits
    var s = {
      border: '1px solid gray',
      borderRadius: '20px',
      display: 'inline-block',
      padding: 22,
      transform: 'rotate(' + this.state.deg + 'deg)',
    };
    return (
      <div style={s}>
        asd
      </div>
    );
  }
});

var App1 = React.createClass({
  mixins: [stateStream.Mixin],
  getInitialStateStream: function() {
    return stateStream.toRange(999999).map(function(ms, i) {
      return I.Map({
        deg: i * -2,
        childTurnLeft: false,
      });
    });
  },

  handleClick: function() {
    // key part! Alter the stream
    // for an infinite stream this is just asking for memory leak, since each
    // modification lazily accumulates functions to apply when a stream item is
    // taken. This is just a trivial demo however
    var newTurn = !this.stream.first().getIn(['childTurnLeft']);
    var s = this.stream.map(function(stateI) {
      return stateI.updateIn(['childTurnLeft'], function() {
        return newTurn;
      });
    });

    this.setStateStream(s);
  },

  render: function() {
    var s = {
      border: '1px solid gray',
      borderRadius: '30px',
      display: 'inline-block',
      padding: 50,
      transform: 'rotate(' + this.state.deg + 'deg)',
    };
    return (
      <div style={s} onClick={this.handleClick}>
        <Child turnLeft={this.state.childTurnLeft}></Child>
      </div>
    );
  }
});

module.exports = App1;
