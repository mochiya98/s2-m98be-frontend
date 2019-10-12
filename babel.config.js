module.exports = {
  env: {
    legacy: {
      presets: [
        [
          "@babel/preset-react",
          {
            pragma: "React.createElement", // default pragma is React.createElement
            pragmaFrag: "React.Fragment" // default is React.Fragment
            //"throwIfNamespace": false // defaults to true
          }
        ],
        [
          "@babel/preset-env",
          {
            loose: true,
            useBuiltIns: "usage",
            modules: false,
            corejs: 3
          }
        ]
      ],
      plugins: [
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-syntax-dynamic-import"
      ]
    },
    modern: {
      presets: [
        [
          "@babel/preset-react",
          {
            pragma: "React.createElement", // default pragma is React.createElement
            pragmaFrag: "React.Fragment" // default is React.Fragment
            //"throwIfNamespace": false // defaults to true
          }
        ],
        [
          "@babel/preset-env",
          {
            loose: true,
            useBuiltIns: false,
            targets: {
              esmodules: true
            }
            //corejs: 3,
          }
        ]
      ],
      plugins: [
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-syntax-dynamic-import"
      ]
    }
  }
};
