module.exports = {
  spec: "src/**/*.test.js",
  recursive: true,
  require: [
    "jsdom-global/register",
    "@babel/register",
  ],
};
