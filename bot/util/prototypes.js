// YEAH IM EXTENDING PROTOTYPES FUCK YOU

String.prototype.toProperCase = function () {
    return this.replace(/([^\W_]+[^\s-]*) */g, function (txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.remove = function (element) {
    const index = this.indexOf(element);
    if (index !== -1) this.splice(index, 1);
    return this;
};