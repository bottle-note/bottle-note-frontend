module.exports = {
  env: {
    es6: true,
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier', 'import'],
  parserOptions: { project: './tsconfig.json' },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'plugin:prettier/recommended',
    'plugin:cypress/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:storybook/recommended',
    'plugin:@next/next/recommended',
    'next/core-web-vitals',
  ],
  ignorePatterns: [
    'src/stories/*',
    'src/__test__/**/*',
    'src/*/**.test.tsx',
    'src/*/**/***.test.tsx',
    'src/mocks',
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: true,
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-restricted-globals': 'warn',
    'react/no-array-index-key': 'warn',
    'react/style-prop-object': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',
    'class-methods-use-this': 'off', // 클래스 메서드 내에서 this를 사용하지 않아도 되도록 강제하지 않음.
    'react/function-component-definition': 'off', // 함수 컴포넌트 정의를 강제하지 않음.
    'no-return-assign': 'off', // 반환문에서 할당을 허용함.
    'no-console': ['warn', { allow: ['warn', 'error'] }], // console.warn과 console.error만 허용함.
    '@typescript-eslint/naming-convention': [
      'off',
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
      },
    ],
    'no-alert': 'off', // alert, confirm 및 prompt 사용을 허용함.
    'no-plusplus': 'off', // 증가(++) 및 감소(--) 연산자 사용을 허용함.
    'consistent-return': 'off', // 일관된 return을 강제하지 않음.
    'no-restricted-syntax': 'off', // 특정 문법 사용을 제한하지 않음.
    'guard-for-in': 'off', // for-in 반복문에서 guard 문을 강제하지 않음.
    'react/prop-types': 'off', // propTypes 사용을 강제하지 않음.
    'react/no-unused-prop-types': 'off', // 사용되지 않은 propTypes를 허용함.
    'react/react-in-jsx-scope': 'off', // JSX 사용시 React import를 강제하지 않음.
    'import/prefer-default-export': 'off', // 단일 export 시 default export를 선호하도록 강제하지 않음.
    'func-names': 'off', // 기명 함수 표현을 강제하지 않음.
    'react/require-default-props': 'off', // defaultProps를 강제하지 않음.
    'react/default-props-match-prop-types': 'off', // defaultProps가 propTypes와 일치하도록 강제하지 않음.
    'react/jsx-props-no-spreading': ['off'], // JSX에서 props spreading을 허용함.
    'react-hooks/exhaustive-deps': ['off'], // useEffect의 종속성 배열에 모든 종속성을 포함하도록 강제하지 않음.
    'linebreak-style': [
      'error',
      process.platform === 'win32' ? 'windows' : 'unix', // 플랫폼에 따른 줄바꿈 스타일을 강제함.
    ],
    'prettier/prettier': ['error', { endOfLine: 'auto' }], // prettier 규칙에 따라 endOfLine을 auto로 설정함.
    'no-underscore-dangle': 'off', // 밑줄(_)로 시작하는 이름을 허용함.
    'react/jsx-no-useless-fragment': 'off', // 불필요한 Fragment 사용을 허용함.
    'react/button-has-type': 'off', // 버튼 요소에 type 속성을 강제하지 않음.
    'import/no-named-as-default': 'off', // named export를 default export로 사용하는 것을 허용함.
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: ['state'], // 'state' 프로퍼티의 재할당을 허용함.
      },
    ],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'], // 'Link' 컴포넌트와 'to' prop를 사용하는 것을 허용함.
      },
    ],
    'jsx-a11y/no-static-element-interactions': [
      'off',
      {
        handlers: [
          'onClick',
          'onMouseDown',
          'onMouseUp',
          'onKeyPress',
          'onKeyDown',
          'onKeyUp',
        ],
      },
    ],

    'import/no-extraneous-dependencies': [
      // 프로젝트에서 필요한 의존성만을 import하도록 강제
      'error',
      {
        devDependencies: ['**/*.stories.*', '**/.storybook/**/*.*'],
        peerDependencies: true,
      },
    ],
    'import/order': [
      // import 순서 강제
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: 'next',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: 'next/**',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'pages/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: 'components/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: 'hooks/**',
            group: 'internal',
          },
          {
            pattern: 'types/**',
            group: 'internal',
          },
          {
            pattern: 'utils/**',
            group: 'internal',
          },
          {
            pattern: 'store/**',
            group: 'internal',
          },
          {
            pattern: 'constants/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: './**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'public/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['react', 'next/**'],
      },
    ],
  },
  overrides: [
    // Storybook 파일에 대한 default-exports 규칙 미적용
    {
      files: ['*.stories.@(ts|tsx|js|jsx|mjs|cjs)'],
      rules: {
        'storybook/default-exports': 'off',
      },
    },
  ],
};
