module.exports = {
  extension: [ "ts", "tsx", "js", "jsx" ],
  spec: "src/**/*.test.ts",
  recursive: true,
  require: [
    "jsdom-global/register",
    "ts-node/register",
  ],
};
