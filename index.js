var Transform = require('readable-stream').Transform;
var inherits = require('inherits');

inherits(Tokenize, Transform);
module.exports = Tokenize;

var codes = {
    lt: '<'.charCodeAt(0),
    gt: '>'.charCodeAt(0)
};

function Tokenize () {
    if (!(this instanceof Tokenize)) return new Tokenize;
    Transform.call(this, { objectMode: true });
    this.state = 'text';
    this.buffers = [];
}

Tokenize.prototype._transform = function (buf, enc, next) {
    var parts = [];
    var offset = 0;
    for (var i = 0; i < buf.length; i++) {
        var b = buf[i];
        if (this.state === 'text' && b === codes.lt) {
            this.buffers.push(buf.slice(offset, i));
            offset = i;
            this.state = 'open';
            this._pushState('text');
        }
        else if (this.state === 'open' && b === codes.gt) {
            this.buffers.push(buf.slice(offset, i));
            offset = i;
            this.state = 'text';
            this._pushState('close');
        }
        else {
            
        }
    }
    if (offset < buf.length - 1) this.buffers.push(buf.slice(offset));
};

Tokenize.prototype._flush = function (next) {
    if (this.state === 'text') this._pushState('text');
    this.push(null);
    next();
};

Tokenize.prototype._pushState = function (ev) {
    if (this.buffers.length === 0) return;
    var buf = Buffer.concat(this.buffers);
    this.buffers = [];
    this.push([ ev, buf ]);
};
