/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import createEmotion from '@emotion/css/create-instance';

import { euiStylisPrefixer } from './prefixer';

/**
 * This custom instance is needed for internal EUI components to call
 * `@emotion/css` with EUI's custom prefixer plugin
 * @see https://emotion.sh/docs/@emotion/css#custom-instances
 *
 * NOTE: This is meant to be mostly be used internally, and is not a public export
 */
export const { css, cx, cache, merge } = createEmotion({
  key: 'css',
  stylisPlugins: [euiStylisPrefixer],
  speedy: false,
});

const foo = css`
  color: red;
`;
const bar = css`
  color: blue;
`;
console.log(cx([foo, bar]));
console.log(cache);
// console.log(merge(cache.registered, css, classnames(args))

import { cache as emotionCache } from '@emotion/css';
console.log('wtf', emotionCache);
