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
 * @param {GeoloniaMapConfig['RestrictedMode']} labels and whether show links
 */
export const openDialog = (container, config) => {
  const atts = parseAtts(container);
  const lang = ( atts.lang === 'ja' || atts.lang === 'ja-JP') ? 'ja' : 'en';

  if (config.labels.mode !== '') {
    const mode = document.createElement('div');
    mode.setAttribute('class', 'geolonia__map-view-restricted-mode');
    mode.innerText = config.labels.mode || messages.mode[lang];
    container.prepend(mode);
  }

  const dialog = document.createElement('div');
  dialog.setAttribute('class', 'geolonia__map-view-restricted-message');

  const description = document.createElement('p');
  description.innerText = config.labels.description || messages.description[lang];
  dialog.append(description);

  if (config.showLink) {
    const link = document.createElement('p');
    link.innerHTML = `<a href="https://app.geolonia.com" target="_blank" rel="noopener">${messages.contact[lang]}</a>`;
    dialog.append(link);
  }

  const closeButtonContainer = document.createElement('p');
  dialog.append(closeButtonContainer);

  const closeButton = document.createElement('button');
  closeButton.innerText = messages.closeMe[lang];
  container.append(dialog);

  closeButtonContainer.append(closeButton);

  const closeMessage = () => dialog.remove();
  closeButton.addEventListener('click', closeMessage);
};
