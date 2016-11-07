
var helpers = require('../../helpers.js')

/**
 * Send an ajax request to the Spotify API
 *
 * @param dispatch obj
 * @param getState obj
 * @param endpoint params = the url params to send
 **/
const sendRequest = ( dispatch, getState, params ) => {
    return new Promise( (resolve, reject) => {   

        var url = '//ws.audioscrobbler.com/2.0/?format=json&api_key=4320a3ef51c9b3d69de552ac083c55e3&'+params

        $.ajax({
                method: 'GET',
                cache: true,
                url: url
            }).then( 
                response => resolve(response),
                (xhr, status, error) => {
                    console.error( params+' failed', xhr.responseText)
                    reject(error)
                }
            )
    })
}

export function getArtist( artist, mbid = false ){
    return (dispatch, getState) => {

        dispatch({ type: 'LASTFM_ARTIST_LOADED', data: false });

        if( mbid ){
            var params = 'method=artist.getInfo&mbid='+mbid
        }else{
            artist = encodeURIComponent( artist );
            var params = 'method=artist.getInfo&artist='+artist
        }
        sendRequest(dispatch, getState, params)
            .then(
                response => {
                    if( response.artist ){
                        dispatch({
                            type: 'LASTFM_ARTIST_LOADED',
                            data: response.artist
                        });
                    }
                }
            )
    }
}

export function getAlbum( artist, album, mbid = false ){
    return (dispatch, getState) => {

        dispatch({ type: 'LASTFM_ALBUM_LOADED', data: false });

        if( mbid ){
            var params = 'method=album.getInfo&mbid='+mbid
        }else{
            artist = encodeURIComponent( artist )
            album = encodeURIComponent( album )
            var params = 'method=album.getInfo&album='+album+'&artist='+artist
        }
        sendRequest(dispatch, getState, params)
            .then(
                response => {
                    if( response.album ){
                        dispatch({
                            type: 'LASTFM_ALBUM_LOADED',
                            data: response.album
                        });
                    }
                }
            )
    }
}

export function getTrack( artist, track ){
    return (dispatch, getState) => {

        dispatch({ type: 'LASTFM_TRACK_LOADED', data: false });
        
        artist = encodeURIComponent( artist );
        sendRequest(dispatch, getState, 'method=track.getInfo&track='+track+'&artist='+artist)
            .then(
                response => {
                    if( response.track ){
                        dispatch({
                            type: 'LASTFM_TRACK_LOADED',
                            data: response.track
                        });
                    }
                }
            )
    }
}

