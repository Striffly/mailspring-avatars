/*Adapted from https://github.com/sitebase/react-avatar */

"use strict";
import {Utils, React} from 'mailspring-exports';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import md5 from 'md5';

const isRetina = require('is-retina')();
const a_table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
const b_table = a_table.split(' ').map(function(s){ return parseInt(s,16) });

const AvatarImage = createReactClass({
    displayName: 'AvatarImage',
    getProtocol: function()
    {
        if( typeof window === 'undefined' )
            return 'https:';

        return window.location.protocol;
    },

    shouldComponentUpdate(nextProps, nextState) {
        return !Utils.isEqualReact(nextProps, this.props) || !Utils.isEqualReact(nextState, this.state);
    },

    /**
     * Gravatar implementation
     * @param  {string}   email MD5 hash or plain text email address
     * @param  {int}   size
     * @param  {Function} cb
     * @return {void}
     */
    getGravatarURL: function(email, size, cb, tryNext )
    {
        var base = 'gravatar.com/avatar/<%=id%>?s=<%=size%>&d=404';

        // if email does not contain @ it's already an MD5 hash
        if( email.indexOf('@') > -1 )
            email = md5(email);

        var prefix = this.getProtocol() === 'https:' ? 'https://secure.' : 'http://';
        size = isRetina ? size * 2 : size;
        var url = prefix + this.parse(base, { id: email, size: size });
        this.get(url, function(data) {
            cb(url);
        }, tryNext)
    },

    getClearbitURL: function(email, size, cb, tryNext)
    {
        var base = "logo.clearbit.com/<%=domain%>";

        var domain;
        if( email.indexOf('@') > -1 ) domain = email.split('@')[1];
        var prefix = this.getProtocol() === 'https:' ? 'https://secure.' : 'http://';
        var url = prefix + this.parse(base, { domain: domain });
        this.get(url, function(data) {
            cb(url);
        }, tryNext);
    },

    getTwentyIconsURL: function(email, size, cb, tryNext, useFullDomain)
    {
        var base = "twenty-icons.com/<%=domain%>";

        var domain;
        if( email.indexOf('@') > -1 ) {
            domain = email.split('@')[1];
            // If useFullDomain is false, get root domain by removing subdomains
            // Example: mail.adflex.vn -> adflex.vn
            if( !useFullDomain ) {
                var parts = domain.split('.');
                if( parts.length > 2 ) {
                    // Take the last 2 parts (domain + TLD)
                    domain = parts.slice(-2).join('.');
                }
            }
        }
        var prefix = this.getProtocol() === 'https:' ? 'https://' : 'http://';
        var url = prefix + this.parse(base, { domain: domain });
        this.get(url, function(data) {
            cb(url);
        }, tryNext);
    },

    /**
     * Facebook implementation
     * @param  {string|int}   id
     * @param  {int}   size
     * @param  {Function} cb
     * @return {void}
     */
    getFacebookURL: function( id, size, cb, tryNext )
    {
        var base = 'graph.facebook.com/<%=id%>/picture?width=<%=size%>';
        var url = this.getProtocol() + '//' + this.parse(base, {id: id, size: size});
        this.get(url, function(data) {
            cb(url);
        }, tryNext)
    },

    /**
     * Google+ implementation
     * @param  {int}   id
     * @param  {int}   size
     * @param  {Function} cb
     * @return {void}
     */
    getGoogleURL: function( id, size, cb, tryNext )
    {
        var base = 'picasaweb.google.com/data/entry/api/user/<%=id%>?alt=json';
        var url = this.getProtocol() + '//' + this.parse(base, {id: id});
        this.get(url, function(data) {
            var src = data.entry.gphoto$thumbnail.$t.replace('s64', 's' + size); // replace with the correct size
            cb(src);
        }, tryNext);
    },

    /**
     * Skype implementation
     * @param  {string}   id
     * @param  {int}   size
     * @param  {Function} cb
     * @return {void}
     */
    getSkypeURL: function( id, size, cb, tryNext )
    {
        var base = 'api.skype.com/users/<%=id%>/profile/avatar';
        var url = this.getProtocol() + '//' + this.parse(base, {id: id});
        this.get(url, function(data) {
            cb(url);
        }, tryNext)
    },

    /**
     * Replace variables in a string
     * @param  {string} value String that will be parsed
     * @param  {Object} variables    Key value object
     * @return {string}
     */
    parse: function( value, variables )
    {
        for(var variable in variables)
        {
            value = value.replace('<%=' + variable + '%>', variables[variable]);
        }
        return value;
    },

    /**
     * Implementatiopn of PHP crc32 function
     * @param str
     * @return {number}
     */
    crc32 (str) {
        var crc = -1;
        for (var i= 0, iTop=str.length; i<iTop; i++) {
            crc = ( crc >>> 8 ) ^ b_table[( crc ^ str.charCodeAt( i ) ) & 0xFF];
        }
        return (crc ^ (-1)) >>> 0;
    },

    /**
     * Return a random color
     * @return {string}
     */
    rndColor: function()
    {
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
        var crc32Value = this.crc32(this.props.email)
        var index = (crc32Value % colors.length) + 1;
        // var index = Math.floor(Math.random()*colors.length);
        return colors[ index ];
    },

    /**
     * Convert a name into initials
     * @param {string} name
     * @return {string}
     */
    getInitials: function( name )
    {
        var parts = name.split(' ');
        var initials = '';
        for(var i=0 ; i < parts.length ; i++)
        {
            if (i > 3) break;
            initials += parts[i].substr(0, 1).toUpperCase();
        }
        return initials;
    },

    /**
     * Do an ajax request to fetch remote data
     * @param  {string}   url
     * @param  {Function} cb
     * @return {void}
     */
    get: function(url, successCb, errorCb) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var data = request.responseText;
                    if (this.isJsonString(data)) {
                        data = JSON.parse(data);
                    }
                    successCb(data);
                } else {
                    errorCb(request.status);
                }
            }
        };
        request.open('GET', url, true);
        request.send();
    },

    isJsonString: function(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },

    /**
     * Set the src attribute of the image element use to display the avatar
     * @param {string} src
     */
    setSrc: function( src )
    {
        if( src === null )
            return;

        this.trySetState({ src: src });
    },

    propTypes: {
        className: PropTypes.string,
        fgColor: PropTypes.string,
        color: PropTypes.string,
        name: PropTypes.string,
        value: PropTypes.string,
        email: PropTypes.string,
        facebookId: PropTypes.string,
        googleId: PropTypes.string,
        skypeID: PropTypes.string,
        round: PropTypes.bool,
        size: PropTypes.number
    },
    getInitialState: function() {
        return {
            src: null,
            value: null,
            triedFacebook: false,
            triedGoogle: false,
            triedSkype: false,
            triedGravatar: false,
            triedClearbit: false,
            triedTwentyIcons: false,
            triedTwentyIconsFullDomain: false,
        };
    },
    // componentWillMount: function() {
    //   this.fetch();
    // },
    componentDidMount: function() {
        this.fetch();
    },
    componentWillReceiveProps: function(newProps) {
        /**
         * This component ignores changes in `this.props.src`, `this.props.name`, and
         * `this.props.value`. This lifecycle method will allow users to change the avatars name or
         * value.
         */
        if (newProps.src && newProps.src !== this.props.src) {
            this.trySetState({ src: newProps.src });
        } else if (newProps.name && newProps.name !== this.props.name) {
            this.trySetState({ value: this.getInitials(newProps.name) });
        } else if (newProps.value && newProps.value !== this.props.value) {
            this.trySetState({ value: newProps.value });
        }
    },

    trySetState: function(hash){
        if(this.isMounted()) { //bad antipattern
            this.setState(hash);
        }
    },

    fetch: function( e ) {
        var url = null;
        var self = this;
        var tryNext = function() {
            self.fetch();
        };

        // If fetch was triggered by img onError
        // then set state src back to null so getVisual will
        // automatically switch to drawn avatar if there is no other social ID available to try
        if( e && e.type === "error" ) {
            this.state.src = null;
        }

        if( this.state.triedClearbit === false && ! this.state.url && this.props.email ) {
            this.state.triedClearbit = true;
            this.getClearbitURL( this.props.email, this.props.size, this.setSrc, tryNext);
            return;
        }

        if( this.state.triedGravatar === false && ! this.state.url && this.props.email) {
            this.state.triedGravatar = true;
            this.getGravatarURL( this.props.email, this.props.size, this.setSrc, tryNext );
            return;
        }

        if( this.state.triedFacebook === false && ! this.state.url && this.props.facebookId) {
            this.state.triedFacebook = true;
            this.getFacebookURL( this.props.facebookId , this.props.size, this.setSrc, tryNext );
            return;
        }

        if( this.state.triedGoogle === false && ! this.state.url && this.props.googleId) {
            this.state.triedGoogle = true;
            this.getGoogleURL( this.props.googleId , this.props.size, this.setSrc, tryNext );
            return;
        }

        if( this.state.triedSkype === false && ! this.state.url && this.props.skypeId) {
            this.state.triedSkype = true;
            this.getSkypeURL( this.props.skypeId , this.props.size, this.setSrc, tryNext );
            return;
        }

        if( this.state.triedTwentyIcons === false && ! this.state.url && this.props.email) {
            // Check if domain has subdomains (more than 2 parts)
            var emailDomain = this.props.email.indexOf('@') > -1 ? this.props.email.split('@')[1] : null;
            var hasSubdomain = emailDomain && emailDomain.split('.').length > 2;
            
            if( hasSubdomain && this.state.triedTwentyIconsFullDomain === false ) {
                // Try full domain first (e.g., mail.adflex.vn)
                this.state.triedTwentyIconsFullDomain = true;
                this.getTwentyIconsURL( this.props.email, this.props.size, this.setSrc, tryNext, true );
                return;
            } else {
                // Try root domain (e.g., adflex.vn) or if no subdomain, try the domain as is
                this.state.triedTwentyIcons = true;
                this.getTwentyIconsURL( this.props.email, this.props.size, this.setSrc, tryNext, false );
                return;
            }
        }

        if( this.state.src )
            return;

        if( this.props.name )
            this.trySetState({ value: this.getInitials( this.props.name ) });

        if( !this.props.name && this.props.value )
            this.trySetState({ value: this.props.value });

        if( url === null && this.props.src) {
            this.setSrc( this.parse(this.props.src, {size: this.props.size}) );
            return;
        }
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
            font: Math.floor(this.props.size/3) + 'px/100px',
            color: this.props.fgColor,
            textAlign: 'center',
            textTransform: 'uppercase',
            lineHeight: (this.props.size + Math.floor(this.props.size/10)) + 'px',
            borderRadius: (this.props.round ? 500 : 0)
        };

        if(this.state.src) {
            return (
                /* jshint ignore:start */
                <img width={ this.props.size } height={ this.props.size } style={ imageStyle } src={ this.state.src } onError={ this.fetch } />
                /* jshint ignore:end */
            );
        } else {
            return (
                /* jshint ignore:start */
                <div style={ initialsStyle }>{ this.state.value }</div>
                /* jshint ignore:end */
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
        var visual = this.getVisual();

        return (
            /* jshint ignore:start */
            <div className={this.props.className} style={ hostStyle }>
                { visual }
            </div>
            /* jshint ignore:end */
        );
    }
});

AvatarImage.defaultProps = {
    fgColor: '#FFF',
    color: null,
    name: null,
    value: null,
    email: null,
    facebookId: null,
    skypeId: null,
    googleId: null,
    round: false,
    size: 32
};

module.exports = AvatarImage;
