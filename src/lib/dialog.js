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
export const openDialog = (container) => {
  const atts = parseAtts(container);
  const lang = ( atts.lang === 'ja' || atts.lang === 'ja-JP') ? 'ja' : 'en';

  // mode label on left top
  const mode = document.createElement('div');
  mode.setAttribute('class', 'geolonia__map-view-restricted-mode');
  mode.innerText = messages.mode[lang];
  container.prepend(mode);

  // closable dialog container
  const dialog = document.createElement('div');
  dialog.setAttribute('class', 'geolonia__map-view-restricted-message');

  // heading text
  const description = document.createElement('p');
  description.innerText = messages.description[lang];
  dialog.append(description);

  // link to geolonia official
  const link = document.createElement('p');
  link.innerHTML = `<a href="https://docs.geolonia.com/embed-api/#制限モードについて" target="_blank" rel="noopener">${messages.contact[lang]}</a>`;
  dialog.append(link);

  // close button
  const closeButtonContainer = document.createElement('p');
  const closeButton = document.createElement('button');
  closeButton.innerText = messages.closeMe[lang];
  closeButton.addEventListener('click', () => dialog.remove());
  closeButtonContainer.append(closeButton);
  dialog.append(closeButtonContainer);

  container.append(dialog);
};
