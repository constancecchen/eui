/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  FunctionComponent,
  ReactNode,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import classNames from 'classnames';

import { RenderLinkOrButton, useEuiTheme } from '../../services';
import { CommonProps } from '../common';

import { euiTabStyles, euiTabContentStyles } from './tab.styles';
import { EuiTabsContext } from './tabs_context';

export type EuiTabProps = CommonProps &
  Partial<ButtonHTMLAttributes<HTMLButtonElement>> &
  Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> & {
    isSelected?: boolean;
    disabled?: boolean;
    /**
     * Places content before the tab content/children.
     * Will be excluded from interactive effects.
     */
    prepend?: ReactNode;
    /**
     * Places content after the tab content/children.
     * Will be excluded from interactive effects.
     */
    append?: ReactNode;
  };

export const EuiTab: FunctionComponent<EuiTabProps> = ({
  isSelected,
  children,
  className,
  disabled,
  href,
  target,
  rel,
  prepend,
  append,
  ...rest
}) => {
  const { size, expand } = useContext(EuiTabsContext);
  const euiTheme = useEuiTheme();

  const classes = classNames('euiTab', className, {
    'euiTab-isSelected': isSelected,
  });

  const tabStyles = useMemo(() => euiTabStyles(euiTheme), [euiTheme]);
  const cssTabStyles = useCallback(
    (isDisabled: boolean) => [
      tabStyles.euiTab,
      expand && tabStyles.expanded,
      isDisabled && tabStyles.disabled.disabled,
      isSelected &&
        (isDisabled ? tabStyles.disabled.selected : tabStyles.selected),
    ],
    [tabStyles, expand, isSelected]
  );

  const tabContentStyles = euiTabContentStyles(euiTheme);
  const cssTabContentStyles = [
    tabContentStyles.euiTab__content,
    size && tabContentStyles[size],
  ];

  return (
    <RenderLinkOrButton
      role="tab"
      fallbackElement="button"
      aria-selected={!!isSelected}
      className={classes}
      componentCss={cssTabStyles}
      href={href}
      target={target}
      rel={rel}
      isDisabled={disabled}
      {...rest}
    >
      {prepend && <span className="euiTab__prepend">{prepend}</span>}
      <span
        className="euiTab__content eui-textTruncate"
        css={cssTabContentStyles}
      >
        {children}
      </span>
      {append && <span className="euiTab__append">{append}</span>}
    </RenderLinkOrButton>
  );
};
