/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FunctionComponent, PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { css, keyframes } from '@emotion/react';
import createCache from '@emotion/cache';

import { EuiProvider } from '../../components/provider';

import { euiStylisPrefixer } from './prefixer';

describe('euiStylisPrefixer', () => {
  const cacheWithPrefixer = createCache({
    key: 'test',
    stylisPlugins: [euiStylisPrefixer],
  });

  const wrapper: FunctionComponent<PropsWithChildren> = ({ children }) => (
    <EuiProvider
      globalStyles={false}
      utilityClasses={false}
      cache={cacheWithPrefixer}
    >
      {children}
    </EuiProvider>
  );

  const getStyleCss = (label: string) => {
    const styleEl = Array.from(
      document.querySelectorAll('style[data-emotion]')
    ).find((el) => el?.textContent?.includes(label)) as HTMLStyleElement;
    if (!styleEl) return;

    // Make output styles a little easier to read
    return styleEl
      .textContent!.replace('{', ' {\n')
      .replace(/;/g, ';\n')
      .replace(/:/g, ': ');
  };

  describe('does prefix', () => {
    // TODO
  });

  describe('does not prefix', () => {
    test('animation CSS', () => {
      const testAnimation = keyframes`
        from { opacity: 0; }
        to { opacity: 1; }
      `;
      render(
        <div
          css={css`
            label: no-animation-prefixes;
            animation: ${testAnimation};
            animation-name: test;
            animation-delay: 1s;
            animation-direction: reverse;
            animation-duration: 50ms;
            animation-fill-mode: both;
            animation-iteration-count: infinite;
            animation-play-state: paused;
            animation-timing-function: ease-in-out;
          `}
        />,
        { wrapper }
      );

      expect(getStyleCss('no-animation-prefixes')).toMatchInlineSnapshot(`
        ".test-1aw2200-no-animation-prefixes {
        animation: animation-1flhruc;
        animation-name: test;
        animation-delay: 1s;
        animation-direction: reverse;
        animation-duration: 50ms;
        animation-fill-mode: both;
        animation-iteration-count: infinite;
        animation-play-state: paused;
        animation-timing-function: ease-in-out;
        }"
      `);
      expect(getStyleCss('@keyframes')).toBeTruthy();
      expect(getStyleCss('@-webkit-keyframes')).toBeFalsy();
    });
    test('misc selectors', () => {
      render(
        <div
          css={css`
            ::placeholder,
            :read-only,
            :read-write {
              color: red;
            }
          `}
        />,
        { wrapper }
      );

      expect(getStyleCss('::-moz-placeholder')).toBeFalsy();
      expect(getStyleCss(':-moz-read-only')).toBeFalsy();
      expect(getStyleCss(':-moz-read-write')).toBeFalsy();
    });
  });

  describe('default Emotion cache', () => {
    it('prefixes extra CSS that the EUI plugin does not', () => {
      render(
        <EuiProvider>
          <div
            css={css`
              label: test-default-cache;
              animation: something;
              ::placeholder {
                color: red;
              }
            `}
          />
        </EuiProvider>
      );

      expect(getStyleCss('test-default-cache')).toMatchInlineSnapshot(`
        ".css-a8wwb0-test-default-cache {
        -webkit-animation: something;
        animation: something;
      `);
      expect(getStyleCss('::-moz-placeholder')).toBeTruthy();
    });
  });
});
