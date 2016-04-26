// Process @[youtube](youtubeVideoID)
// Process @[vimeo](vimeoVideoID)
// Process @[vine](vineVideoID)

'use strict';

var yt_regex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/
function youtube_parser (url) {
    var match = url.match(yt_regex);
    return match && match[7].length === 11 ? match[7] : url;
}

var vimeo_regex = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
function vimeo_parser (url) {
    var match = url.match(vimeo_regex);
    return match && typeof match[3] === 'string' ? match[3] : url;
}

var vine_regex = /^http(?:s?):\/\/(?:www\.)?vine\.co\/v\/([a-zA-Z0-9]{1,13}).*/
function vine_parser (url) {
    var match = url.match(vine_regex);
    return match && match[1].length === 11 ? match[1] : url;
}

var EMBED_REGEX = /@\[([a-zA-Z].+)\]\([\s]*(.*?)[\s]*[\)]/im;

function video_embed(md, options) {
    function video_return(state, silent) {
        var code,
            serviceEnd,
            serviceStart,
            pos,
            res,
            videoID = '',
            tokens,
            token,
            start,
            oldPos = state.pos,
            max = state.posMax;

        if (state.src.charCodeAt(state.pos) !== 0x40/* @ */) {
            return false;
        }
        if (state.src.charCodeAt(state.pos + 1) !== 0x5B/* [ */) {
            return false;
        }

        var match = EMBED_REGEX.exec(state.src);

        if(!match || match.length < 3) {
            return false;
        }

        var service = match[1];
        var videoID = match[2];
        if (service.toLowerCase() == 'youtube') {
            videoID = youtube_parser(videoID);
        } else if (service.toLowerCase() == 'vimeo') {
            videoID = vimeo_parser(videoID);
        } else if (service.toLowerCase() == 'vine') {
            videoID = vine_parser(videoID);
        } else if (!options[service]) {
            return false;
        }

        // If the videoID field is empty, regex currently make it the close parenthesis.
        if (videoID === ')') {
            videoID = '';
        }

        serviceStart = state.pos + 2;
        serviceEnd = md.helpers.parseLinkLabel(state, state.pos + 1, false);

        //
        // We found the end of the link, and know for a fact it's a valid link;
        // so all that's left to do is to call tokenizer.
        //
        if (!silent) {
            state.pos = serviceStart;
            state.posMax = serviceEnd;
            state.service = state.src.slice(serviceStart, serviceEnd);
            var newState = new state.md.inline.State(
                service,
                state.md,
                state.env,
                tokens = []
            );
            newState.md.inline.tokenize(newState);

            token = state.push('video', '');
            token.videoID = videoID;
            token.service = service;
            token.level = state.level;
        }

        state.pos = state.pos + state.src.indexOf(')', state.pos);
        state.posMax = state.tokens.length;
        return true;
    }

    return video_return;
}

function video_url(service, videoID, options) {
    switch (service) {
        case 'youtube':
            return '//www.youtube.com/embed/' + videoID;
        case 'vimeo':
            return '//player.vimeo.com/video/' + videoID;
        case 'vine':
            return '//vine.co/v/' + videoID + '/embed/' + options.vine.embed;
    }
}

function tokenize_video(md, options) {
    function tokenize_return(tokens, idx, mdopts, env, self) {
        var videoID = md.utils.escapeHtml(tokens[idx].videoID);
        var service = md.utils.escapeHtml(tokens[idx].service).toLowerCase();
        if (videoID === '') {
            return '';
        }

        return '<div class="embed-responsive"><iframe class="embed-responsive-item embed-responsive-16by9" id="' + service + 'player" type="text/html" width="' + (options[service].width) + '" height="' + (options[service].height) + '" src="' + options.url(service, videoID, options) + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>';

    }

    return tokenize_return;
}

var defaults = {
    url: video_url,
    youtube: { width: 640, height: 390 },
    vimeo: { width: 500, height: 281 },
    vine: { width: 600, height: 600, embed: 'simple' }
}

module.exports = function video_plugin(md, options) {
    if (options) {
        Object.keys(defaults).forEach(function(key) {
            if (typeof options[key] === 'undefined') {
                options[key] = defaults[key];
            }
        })
    } else options = defaults;
    md.renderer.rules.video = tokenize_video(md, options);
    md.inline.ruler.before('emphasis', 'video', video_embed(md, options));
}
