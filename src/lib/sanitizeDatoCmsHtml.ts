function sanitizeDatoCmsHtml(html: string) {
  return html.replace(/<\/?p>\s*/g, "");
}

export default sanitizeDatoCmsHtml;
