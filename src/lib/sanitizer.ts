export const sanitizeDescription = async (description: string) => {
  const { default: sanitizeHtml } = await import('sanitize-html');
  return sanitizeHtml(description, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
    allowedAttributes: {...sanitizeHtml.defaults.allowedAttributes, '*': ['class']},
  });
};
