import parseAtts from './parse-atts';

const messages = {
  mode: {
    ja: '制限モードで表示中',
    en: 'Displayed in Restricted Mode',
  },
  description: {
    ja: ' 地図表示回数の上限に達したため、地図のズームを制限しています。ウェブページの管理者に連絡してください。',
    en: 'The map zooming is restricted because the map load has reached the limit. Please contact the administrator of the web page.',
  },
  contact: {
    ja: 'ウェブページの管理者ですか？',
    en: 'Are you an administrator?',
  },
  closeMe: {
    ja: '閉じる',
    en: 'close',
  },
};

/**
 *
 * @param {HTMLElement} container Map container
 */
export const renderLimitedView = (container) => {

  const atts = parseAtts(container);
  const lang = ( atts.lang === 'ja' || atts.lang === 'ja-JP') ? 'ja' : 'en';

  const mode = document.createElement('div');
  mode.setAttribute('class', 'geolonia__map-view-restricted-mode');
  mode.innerText = messages.mode[lang];
  container.prepend(mode);

  const message = document.createElement('p');
  message.setAttribute('class', 'geolonia__map-view-restricted-message');
  message.innerHTML = `<p>${messages.description[lang]}</p>
  <p><a href="https://app.geolonia.com" target="_blank" rel="noopener">${messages.contact[lang]}</a></p>
  <p><button id="geolonia__restricted-message-close-button">${messages.closeMe[lang]}</button></p>
  `;
  container.append(message);
  const closeMe = document.getElementById('geolonia__restricted-message-close-button');

  const closeMessage = () => message.remove();
  closeMe.addEventListener('click', closeMessage);
};
