/**
 * @name SpotifyToYTMusic
 * @version 0.0.5
 * @description Open SpotifyRPC links in YouTube Music instead of Spotify
 * @author AlexInABox
 * @authorId 428870593358594048
 * @invite vEGtfMj9tu
 * @website https://alexinabox.de/
 * @source https://github.com/AlexInABox/BetterDiscordPlugins/blob/main/SpotifyToYTMusic.plugin.js
 * @updateUrl https://raw.githubusercontent.com/AlexInABox/BetterDiscordPlugins/main/SpotifyToYTMusic.plugin.js
 */


module.exports = class SpotifyToYTMusic {
  constructor() {
    this.eventListener = null;
  }

  getName() {
    return "SpotifyToYTMusic";
  }

  getDescription() {
    return "Open SpotifyRPC links in YouTube Music instead of Spotify";
  }

  getVersion() {
    return "0.0.5";
  }

  getAuthor() {
    return "AlexInABox";
  }

  start() {
    var songName;
    var artistName;
    var ytmusicApiKey = BdApi.getData('SpotifyToYTMusic', 'ytmusicApiKey');

    this.eventListener = (event) => {
      let element = event.target;
      while (element) {
        if (element.classList && (element.classList.contains('anchor-1X4H4q'))) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          BdApi.alert(SpotifyToYTMusic.name, "You have clicked on a Spotify link! If nothing happens, make sure you have the correct YTMusicAPI key set in this plugin's settings panel.");

          BdApi.showToast(element.textContent);
          //Get song name and artist name
          songName = event.target.textContent;
          artistName = element.closest('div.detailsWrap-omKn0b').querySelector('a.activityName-3YXl6e').textContent;
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
        } else if (element.classList && (element.classList.contains('anchor-1X4H4q') && element.closest('div[title]'))) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          BdApi.alert(SpotifyToYTMusic.name, "You have clicked on a Spotify link! If nothing happens, make sure you have the correct YTMusicAPI key set in this plugin's settings panel.");

          BdApi.showToast(element.closest('div[title]').title);
          //Get artist name
          artistName = element.closest('div[title]').title;
          getYTMusicUrl(artistName, ytmusicApiKey)
            .then(ytmusicUrl => {
              if (ytmusicUrl) {
                window.open(ytmusicUrl, '_blank');
              }
            }
            )
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
    var ytmusicApiKey = BdApi.getData('SpotifyToYTMusic', 'ytmusicApiKey');
    var panel = document.createElement('div');
    panel.className = 'spotify-to-ytmusic-settings';

    const html = `
      <div class="textbox">
        <div class="inputWrapper-31cQZ4">
          <input type="text" class="inputDefault-_djjkz input-cIJ7To input-2VB9rf" id="ytmusicApiKey" value="${ytmusicApiKey}" placeholder="Enter your YouTube Music API Key">
        </div>
      </div>
    `;

    panel.innerHTML = html;

    // Add event listener for changes to the input
    panel.querySelector('#ytmusicApiKey').addEventListener('change', (event) => {
      BdApi.setData('SpotifyToYTMusic', 'ytmusicApiKey', event.target.value);
    });

    // Add styling
    const style = `
    .spotify-to-ytmusic-settings {
      padding: 10px;
      background-color: transparent;
      border: none;
    }
    
    .textbox {
      margin-bottom: 10px;
    }
    
    .inputWrapper-31cQZ4 {
      display: flex;
      flex-direction: column;
      position: relative;
      height: 44px;
      justify-content: flex-end;
      margin-bottom: 4px;
    }
    
    .input-2VB9rf {
      background-color: var(--background-secondary);
      border-radius: 4px;
      border: none;
      color: var(--text-normal);
      font-size: 16px;
      height: 36px;
      padding: 6px 10px;
    }
    
    .input-2VB9rf:focus, .input-2VB9rf:not(:placeholder-shown) {
      background-color: var(--background-tertiary);
    }
    `;

    const styleElem = document.createElement('style');
    styleElem.textContent = style;
    panel.appendChild(styleElem);

    return panel;
  }



};

function getYTMusicUrl(trackName, artistName, youtubeApiKey) {
  if (artistName === undefined) {
    artistName = '';
  }
  if (trackName === undefined) {
    return Promise.reject('Track name is required');
  }
  if (youtubeApiKey === undefined) {
    return Promise.reject('YouTube Data API key is required');
  }
  const searchQuery = `${trackName} ${artistName}`.replace(/ *\([^)]*\) */g, ''); // remove anything in parentheses
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&videoCategoryId=10&q=${encodeURIComponent(searchQuery)}&key=${youtubeApiKey}`;

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

function getYTMusicUrl(artistName, youtubeApiKey) {
  if (youtubeApiKey === undefined) {
    return Promise.reject('YouTube Data API key is required');
  }
  const searchQuery = `${artistName}`.replace(/ *\([^)]*\) */g, ''); // remove anything in parentheses
  const searchUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=id&forUsername=${encodeURIComponent(searchQuery)}&maxResults=1&key=${youtubeApiKey}`;

  return new Promise((resolve, reject) => {
    fetch(searchUrl)
      .then(response => response.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          const channel_id = data.items[0].id.channelId;
          const videoUrl = `https://music.youtube.com/channel/${channel_id}`;
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

