/** @type {import("prettier").Config} */
export default {
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  singleQuote: true,
  printWidth: 100,
  tailwindStylesheet: './src/styles/global.css',
  overrides: [
    { files: '*.astro', options: { parser: 'astro' } },
    // Content placeholders are written "[like this]"; keep content files in double quotes.
    { files: ['*.yaml', '*.yml', '*.md', '*.mdx'], options: { singleQuote: false } },
  ],
};
