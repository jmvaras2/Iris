
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loader from '../../components/Loader';
import Modal from './Modal';
import Icon from '../../components/Icon';
import Thumbnail from '../../components/Thumbnail';
import * as coreActions from '../../services/core/actions';
import * as uiActions from '../../services/ui/actions';
import * as mopidyActions from '../../services/mopidy/actions';
import * as spotifyActions from '../../services/spotify/actions';
import { sourceIcon, decodeMopidyUri } from '../../util/helpers';
import { sortItems } from '../../util/arrays';
import { I18n, i18n } from '../../locale';
import { collate } from '../../util/format';

class AddToPlaylist extends React.Component {
  componentDidMount = () => {
    const {
      spotify_library_playlists,
      mopidy_library_playlists,
      spotify_available,
      coreActions: {
        loadLibrary,
      },
      uiActions: {
        setWindowTitle,
      },
    } = this.props;

    if (!spotify_library_playlists && spotify_available) {
      loadLibrary('spotify:library:playlists');
    }

    if (!mopidy_library_playlists) {
      loadLibrary('mopidy:library:playlists');
    }

    setWindowTitle(i18n('modal.add_to_playlist.title'));
  }

  playlistSelected = (playlist_uri) => {
    const {
      coreActions: {
        addTracksToPlaylist,
      },
      uris,
    } = this.props;
    const encodedUris = uris.map((uri) => decodeMopidyUri(uri));
    addTracksToPlaylist(playlist_uri, encodedUris);
    window.history.back();
  }

  render = () => {
    const {
      uris,
      items,
      spotify_library,
      mopidy_library,
    } = this.props;

    let playlists = [
      ...(collate(spotify_library, { items }).items),
      ...(collate(mopidy_library, { items }).items),
    ].filter((playlist) => playlist.can_edit);

    playlists = sortItems(playlists, 'name');

    return (
      <Modal className="modal--add-to-playlist">
        <h1><I18n path="modal.add_to_playlist.title" /></h1>
        <h2 className="mid_grey-text">
          <I18n
            path="modal.add_to_playlist.subtitle"
            count={uris.length}
            plural={uris.length > 1 ? 's' : ''}
          />
        </h2>
        {playlists.length ? (
          <div className="list small playlists">
            {playlists.map((playlist) => (
              <div
                className="list__item"
                key={playlist.uri}
                onClick={() => this.playlistSelected(playlist.uri)}
              >
                <Thumbnail images={playlist.images} size="small" />
                <h4 className="list__item__name">{ playlist.name }</h4>
                <ul className="list__item__details details">
                  <li><Icon type="fontawesome" className="source" name={sourceIcon(playlist.uri)} /></li>
                  <li>
                    {playlist.tracks_total && (
                      <span className="mid_grey-text">
                        {`${playlist.tracks_total} tracks`}
                      </span>
                    )}
                  </li>
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <I18n path="modal.add_to_playlist.no_playlists" />
          </div>
        )}
      </Modal>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  uris: (ownProps.match.params.uris ? decodeURIComponent(ownProps.match.params.uris).split(',') : []),
  mopidy_uri_schemes: state.mopidy.uri_schemes,
  items: state.core.items,
  mopidy_library: state.core.libraries['mopidy:library:playlists'] || { items_uris: [] },
  spotify_library: state.core.libraries['spotify:library:playlists'] || { items_uris: [] },
  spotify_available: state.spotify.access_token,
  load_queue: state.ui.load_queue,
  me_id: (state.spotify.me ? state.spotify.me.id : false),
  playlists: state.core.playlists,
});

const mapDispatchToProps = (dispatch) => ({
  coreActions: bindActionCreators(coreActions, dispatch),
  uiActions: bindActionCreators(uiActions, dispatch),
  mopidyActions: bindActionCreators(mopidyActions, dispatch),
  spotifyActions: bindActionCreators(spotifyActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddToPlaylist);
