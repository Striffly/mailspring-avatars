/*Adapted from https://github.com/sitebase/react-avatar */

"use strict";
import {Utils, React} from 'mailspring-exports';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import validator from 'validator';

// Simple LRU cache implementation
class LRUCache {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    has(key) {
        return this.cache.has(key);
    }

    get(key) {
        var hit = this.cache.has(key);
        if (!hit) return undefined;
        // Move to end (most recently used)
        var value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    set(key, value) {
        // Delete if exists to refresh position
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        this.cache.set(key, value);
        // Evict oldest if over capacity
        if (this.cache.size > this.maxSize) {
            var oldest = this.cache.keys().next().value;
            this.cache.delete(oldest);
        }
    }
}

// LRU cache for favicons - stores data URLs (base64)
const urlCache = new LRUCache(4096);

const AvatarImage = createReactClass({
    displayName: 'AvatarImage',

    shouldComponentUpdate(nextProps, nextState) {
        return !Utils.isEqualReact(nextProps, this.props) || !Utils.isEqualReact(nextState, this.state);
    },

    propTypes: {
        className: PropTypes.string,
        fgColor: PropTypes.string,
        color: PropTypes.string,
        name: PropTypes.string,
        value: PropTypes.string,
        email: PropTypes.string,
        round: PropTypes.bool,
        size: PropTypes.number
    },

    getInitialState: function() {
        return {
            img_data: null,
            value: null,
        };
    },

    componentDidMount: function() {
        this.fetchAvatar();
    },

    componentWillReceiveProps: function(newProps) {
        if (newProps.img_data && newProps.img_data !== this.props.img_data) {
            this.trySetState({ img_data: newProps.img_data });
        } else if (newProps.name && newProps.name !== this.props.name) {
            this.trySetState({ value: this.getInitials(newProps.name) });
        } else if (newProps.value && newProps.value !== this.props.value) {
            this.trySetState({ value: newProps.value });
        }
    },

    trySetState: function(hash) {
        if (this.isMounted()) {
            this.setState(hash);
        }
    },

    /**
     * Validate and sanitize domain extracted from email
     * @param  {string}   domain
     * @return {string|null} Validated domain or null if invalid
     */
    validateDomain: function(domain) {
        if (!domain) return null;
        
        // Use validator.isFQDN to check if it's a valid domain
        // Options: require_tld ensures a TLD is present, allow_underscores=false for strict validation
        if (!validator.isFQDN(domain, { require_tld: true, allow_underscores: false })) {
            return null;
        }
        
        return domain;
    },

    /**
     * Extract domain from email, optionally getting root domain only
     */
    getDomain: function(email, useFullDomain) {
        if (!email || typeof email !== 'string') return null;
        if (email.indexOf('@') === -1) return null;
        
        var parts = email.split('@');
        // Reject malformed emails like "user@@domain" or "user@" or "@domain"
        if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
        
        var domain = parts[1].trim();
        if (!domain) return null;
        
        if (!useFullDomain) {
            var domainParts = domain.split('.');
            if (domainParts.length > 2) {
                domain = domainParts.slice(-2).join('.');
            }
        }
        return domain;
    },

    /**
     * Convert loaded image to data URL using canvas
     */
    imageToDataUrl: function(img, url, resolve) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
            var dataUrl = canvas.toDataURL('image/png');
            urlCache.set(url, dataUrl);
            resolve(dataUrl);
        } catch (e) {
            // CORS issue - fall back to using the URL directly
            urlCache.set(url, url);
            resolve(url);
        }
    },

    /**
     * Load favicon and convert to data URL (cached)
     * Caches the base64 data URL on success to avoid network requests on re-render
     */
    loadFavicon: function(url) {
        // Return cached result if available
        if (urlCache.has(url)) {
            var cached = urlCache.get(url);
            // cached is either a promise (pending) or a data URL string (resolved)
            if (typeof cached === 'string') {
                return Promise.resolve(cached);
            }
            return cached;
        }

        var self = this;
        // Create and cache the promise immediately
        var promise = new Promise((resolve, reject) => {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => self.imageToDataUrl(img, url, resolve);
            img.onerror = () => reject();
            img.src = url;
        });

        urlCache.set(url, promise);
        return promise;
    },

    /**
     * Try to fetch avatar from TwentyIcons
     */
    fetchAvatar: async function() {
        if (!this.props.email) {
            this.setFallback();
            return;
        }

        var fullDomain = this.validateDomain(this.getDomain(this.props.email, true));
        var rootDomain = this.validateDomain(this.getDomain(this.props.email, false));

        // Try full domain first if it has subdomains
        if (fullDomain && fullDomain !== rootDomain) {
            try {
                var img_data = await this.loadFavicon('https://twenty-icons.com/' + fullDomain);
                this.trySetState({ img_data: img_data });
                return;
            } catch (e) {
                // Fall through to try root domain
            }
        }

        // Try root domain
        if (rootDomain) {
            try {
                var img_data = await this.loadFavicon('https://twenty-icons.com/' + rootDomain);
                this.trySetState({ img_data: img_data });
                return;
            } catch (e) {
                // Fall through to vemetric fallback
            }
        }

        // Try vemetric with full domain first if it has subdomains
        // default= forces vemetric to return 404 if no favicon found
        if (fullDomain && fullDomain !== rootDomain) {
            try {
                var img_data = await this.loadFavicon('https://favicon.vemetric.com/' + fullDomain + '?default=');
                this.trySetState({ img_data: img_data });
                return;
            } catch (e) {
                // Fall through to try root domain
            }
        }

        // Try vemetric with root domain
        // default= forces vemetric to return 404 if no favicon found
        if (rootDomain) {
            try {
                var img_data = await this.loadFavicon('https://favicon.vemetric.com/' + rootDomain + '?default=');
                this.trySetState({ img_data: img_data });
                return;
            } catch (e) {
                // Fall through to favicon0 fallback
            }
        }

        // Try favicon0 with full domain first if it has subdomains
        if (fullDomain && fullDomain !== rootDomain) {
            try {
                var img_data = await this.loadFavicon('https://cdn.favicon0.com/' + fullDomain + '/favicon.png');
                this.trySetState({ img_data: img_data });
                return;
            } catch (e) {
                // Fall through to try root domain
            }
        }

        // Try favicon0 with root domain
        if (rootDomain) {
            try {
                var img_data = await this.loadFavicon('https://cdn.favicon0.com/' + rootDomain + '/favicon.png');
                this.trySetState({ img_data: img_data });
                return;
            } catch (e) {
                // Fall through to initials
            }
        }

        this.setFallback();
    },

    setFallback: function() {
        if (this.props.name) {
            this.trySetState({ value: this.getInitials(this.props.name) });
        } else if (this.props.value) {
            this.trySetState({ value: this.props.value });
        }
    },

    /**
     * Return a deterministic color based on email
     */
    rndColor: function() {
        var colors = [
            '#d73d32',
            '#7e3794',
            '#4285f4',
            '#67ae3f',
            '#d61a7f',
            '#ff4080',
            '#1E0F1C',
            '#226D68',
            '#430C05',
            '#955149'
        ];
        var hash = 0;
        var str = this.props.email || '';
        for (var i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return colors[Math.abs(hash) % colors.length];
    },

    /**
     * Convert a name into initials
     */
    getInitials: function(name) {
        var parts = name.split(' ');
        var initials = '';
        for (var i = 0; i < parts.length && i < 4; i++) {
            initials += parts[i].substr(0, 1).toUpperCase();
        }
        return initials;
    },

    handleImageError: function() {
        this.trySetState({ img_data: null });
        this.setFallback();
    },

    getVisual: function() {
        var imageStyle = {
            maxWidth: '100%',
            width: this.props.size,
            height: this.props.size,
            borderRadius: (this.props.round ? 500 : 0),
            objectFit: 'cover'
        };

        var initialsStyle = {
            background: this.props.color || this.rndColor(),
            width: this.props.size,
            height: this.props.size,
            font: Math.floor(this.props.size / 3) + 'px/100px',
            color: this.props.fgColor,
            textAlign: 'center',
            textTransform: 'uppercase',
            lineHeight: (this.props.size + Math.floor(this.props.size / 10)) + 'px',
            borderRadius: (this.props.round ? 500 : 0)
        };

        if (this.state.img_data) {
            return (
                <img width={this.props.size} height={this.props.size} style={imageStyle} src={this.state.img_data} onError={this.handleImageError} />
            );
        } else {
            return (
                <div style={initialsStyle}>{this.state.value}</div>
            );
        }
    },

    render: function() {
        var hostStyle = {
            display: 'inline-block',
            width: this.props.size,
            height: this.props.size,
            borderRadius: (this.props.round ? 500 : 0),
            objectFit: 'cover'
        };

        return (
            <div className={this.props.className} style={hostStyle}>
                {this.getVisual()}
            </div>
        );
    }
});

AvatarImage.defaultProps = {
    fgColor: '#FFF',
    color: null,
    name: null,
    value: null,
    email: null,
    round: false,
    size: 32
};

module.exports = AvatarImage;
