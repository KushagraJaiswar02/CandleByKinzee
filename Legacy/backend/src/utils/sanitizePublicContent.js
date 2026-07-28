import xss from 'xss';

export function sanitizePublicContent(value) {
  return xss(String(value || ''), {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });
}
