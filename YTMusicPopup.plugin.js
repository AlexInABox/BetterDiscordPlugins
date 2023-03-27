/**
 * @name SpotifyToYTMusic
 * @version 0.0.3
 * @description Open SpotifyRPC links in YouTube Music instead of Spotify
 * @author AlexInABox
 * @authorId 428870593358594048
 * @invite vEGtfMj9tu
 * @website https://alexinabox.de/
 * @source https://github.com/AlexInABox/BetterDiscordPlugins/blob/master/SpotifyToYTMusic
 * @updateUrl https://alexinabox.de/BetterDiscordPlugins/SpotifyToYTMusic.plugin.js
 */

module.exports = class SpotifyToYTMusic {
  constructor() {
    this.eventListener = null;
  }

  start() {
    var songName;
    var artistName;
    var ytmusicApiKey = BdApi.getData('SpotifyToYTMusic', 'ytmusicApiKey');

    this.eventListener = (event) => {
      let element = event.target;
      while (element) {
        if (element.classList && (element.classList.contains('activityName-3YXl6e'))) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          BdApi.alert(SpotifyToYTMusic.name, "You have clicked on a Spotify link! If nothing happens, make sure you have the correct YTMusicAPI key set in this plugin's settings panel.");

          BdApi.showToast(element.textContent);
          //Get song name and artist name
          songName = event.target.textContent;
          getYTMusicUrl(songName, artistName, ytmusicApiKey)
            .then(ytmusicUrl => {
              if (ytmusicUrl) {
                window.open(ytmusicUrl, '_blank');
              }
            })
            .catch(error => {
              console.error('Error getting YouTube Music URL:', error);
            });
          break;
        }
        element = element.parentNode;
      }
    };

    document.addEventListener('mousedown', this.eventListener);
  }

  stop() {
    document.removeEventListener('mousedown', this.eventListener);
  }

  getSettingsPanel() {
    //add a good looking text input for the YTMusic API key
    var ytmusicApiKey = BdApi.getData('SpotifyToYTMusic', 'ytmusicApiKey');
    var panel = document.createElement('div');
    panel.innerHTML = `
      <div class="form-group">
        <label for="ytmusicApiKey">YouTube Music API Key</label>
        <input type="text" class="inputDefault-_djjkz input-cIJ7To" id="ytmusicApiKey" value="${ytmusicApiKey}">
      </div>
    `;
    panel.querySelector('#ytmusicApiKey').addEventListener('change', (event) => {
      BdApi.setData('SpotifyToYTMusic', 'ytmusicApiKey', event.target.value);
    }
    );
    return panel;
  }
};

function getYTMusicUrl(trackName, artistName, ytmusicApiKey) {
  if (artistName === undefined) {
    artistName = '';
  }
  if (trackName === undefined) {
    return Promise.reject('Track name is required');
  }
  if (ytmusicApiKey === undefined) {
    return Promise.reject('YouTube Music API key is required');
  }
  const searchQuery = `${trackName} ${artistName}`.replace(/ *\([^)]*\) */g, ''); // remove anything in parentheses
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=id&q=${encodeURIComponent(searchQuery)}&type=video&key=${ytmusicApiKey}`;

  return new Promise((resolve, reject) => {
    fetch(searchUrl)
      .then(response => response.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          const videoId = data.items[0].id.videoId;
          const videoUrl = `https://music.youtube.com/watch?v=${videoId}`;
          resolve(videoUrl);
        } else {
          resolve(null);
        }
      })
      .catch(error => {
        console.error('Error fetching YouTube Music URL:', error);
        reject(error);
      });
  });
}
