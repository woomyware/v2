const colours = require('../assets/colours.json');
const HEX_REGEX = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

class RichEmbed {
    /**
     * @param {EmbedData} data
     */
    constructor (data = {}) {
        if (data.title) this.title = data.title;
        if (data.description) this.description = data.description;
        if (data.url) this.url = data.url;
        if (data.timestamp) this.timestamp = data.timestamp;
        if (data.color) this.color = data.color;
        if (data.footer) this.footer = data.footer;
        if (data.image) this.image = data.image;
        if (data.thumbnail) this.thumbnail = data.thumbnail;
        if (data.author) this.author = data.author;
        this.fields = data.fields || [];
    }

    /**
     * @param {String} title
     */
    setTitle (title) {
        if (typeof title !== 'string') throw new TypeError(`Expected type 'string', received type '${typeof title}'`);
        if (title.length > 256) throw new RangeError('Embed titles cannot exceed 256 characters');
        this.title = title;
        return this;
    }

    /**
     * @param {String} description
     */
    setDescription (description) {
        if (typeof description !== 'string') throw new TypeError(`Expected type 'string', received type '${typeof description}'`);
        if (description.length > 2048) throw new RangeError('Embed titles cannot exceed 2048 characters');
        this.description = description;
        return this;
    }

    /**
     * @param {String} url
     */
    setURL (url) {
        if (typeof url !== 'string') throw new TypeError(`Expected type 'string', received type '${typeof url}'`);
        this.url = url;
        return this;
    }

    /**
     * @param {DateConstructor} [timestamp]
     */
    setTimestamp (timestamp = new Date()) {
        if (Number.isNaN(new Date(timestamp).getTime())) throw new Error('Invalid Date');
        this.timestamp = new Date(timestamp);
        return this;
    }

    /**
     * @param {String|Number} color
     */
    setColour (color) {
        const resolvedColour = colours[color.toUpperCase()];
        if (resolvedColour) color = resolvedColour;

        if (typeof color !== 'string' && typeof color !== 'number') throw new TypeError(`Expected types 'string' or 'number', received type ${typeof color} instead`);
        if (typeof color === 'number') {
            if (color > 16777215 || color < 0) throw new RangeError('Invalid color');
            this.color = color;
        } else {
            const match = color.match(HEX_REGEX);
            if (!match) throw new Error('Invalid color');
            this.color = parseInt(match[1], 16);
        }

        return this;
    }

    /**
     * @param {String} text
     * @param {String} [iconURL]
     */
    setFooter (text, iconURL) {
        if (typeof text !== 'string') throw new TypeError(`Expected type 'string', received type ${typeof text}`);
        if (text.length > 2048) throw new RangeError('Embed footer texts cannot exceed 2048 characters');
        this.footer = { text };

        if (iconURL !== undefined) {
            if (typeof iconURL !== 'string') throw new TypeError(`Expected type 'string', received type '${typeof iconURL}'`);
            this.footer.icon_url = iconURL;
        }

        return this;
    }

    /**
     * @param {String} imageURL
     */
    setImage (imageURL) {
        if (typeof imageURL !== 'string') throw new TypeError(`Expected type 'string', received type ${typeof imageURL}`);
        this.image = { url: imageURL };
        return this;
    }

    /**
     * @param {String} thumbnailURL
     */
    setThumbnail (thumbnailURL) {
        if (typeof thumbnailURL !== 'string') throw new TypeError(`Expected type 'string', received type ${typeof thumbnailURL}`);
        this.thumbnail = { url: thumbnailURL };
        return this;
    }

    /**
     * @param {String} name
     * @param {String} [url]
     * @param {String} [iconURL]
     */
    setAuthor (name, url, iconURL) {
        if (typeof name !== 'string') throw new TypeError(`Expected type 'string', received type ${typeof name}`);
        if (name.length > 256) throw new RangeError('Embed footer texts cannot exceed 2048 characters');
        this.author = { name };

        if (url !== undefined) {
            if (typeof url !== 'string') throw new TypeError(`Expected type 'string', received type '${typeof url}'`);
            this.author.url = url;
        }

        if (iconURL !== undefined) {
            if (typeof iconURL !== 'string') throw new TypeError(`Expected type 'string', received type '${typeof iconURL}'`);
            this.author.icon_url = iconURL;
        }

        return this;
    }

    /**
     * @param {String} name
     * @param {String} value
     * @param {Boolean} [inline]
     */
    addField (name, value, inline = false) {
        if (this.fields.length >= 25) throw new RangeError('Embeds cannot contain more than 25 fields');
        if (typeof name !== 'string') throw new TypeError(`Name field expected type 'string', received type ${typeof name}`);
        if (typeof value !== 'string') throw new TypeError(`Value field expected type 'string', received type ${typeof value}`);
        if (typeof inline !== 'boolean') throw new TypeError(`Inline field expected type 'boolean', received type ${typeof inline}`);
        if (name.length > 256) throw new RangeError('Embed field names cannot exceed 256 characters');
        if (value.length > 1024) throw new RangeError('Embed field names cannot exceed 256 characters');

        this.fields.push({ name, value, inline });
        return this;
    }
}

module.exports = RichEmbed;