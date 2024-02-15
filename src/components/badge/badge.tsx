/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, {
  AriaAttributes,
  FunctionComponent,
  HTMLAttributes,
  AnchorHTMLAttributes,
  MouseEventHandler,
  ReactNode,
  useMemo,
} from 'react';
import classNames from 'classnames';
import { CommonProps, ExclusiveUnion, PropsOf } from '../common';
import {
  useEuiTheme,
  RenderLinkOrButton,
  wcagContrastMin,
  validateHref,
} from '../../services';
import { EuiInnerText } from '../inner_text';
import { EuiIcon, IconType } from '../icon';

import { getTextColor, getColorContrast, getIsValidColor } from './color_utils';
import { euiBadgeStyles, euiBadgeIconStyles } from './badge.styles';

export const ICON_SIDES = ['left', 'right'] as const;
type IconSide = (typeof ICON_SIDES)[number];

export const COLORS = [
  'default',
  'hollow',
  'primary',
  'success',
  'accent',
  'warning',
  'danger',
] as const;
type BadgeColor = (typeof COLORS)[number];

export type WithOnClick = {
  /**
   * Will apply an onclick to the badge itself
   */
  onClick: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;

  /**
   * Aria label applied to the onClick button
   */
  onClickAriaLabel: AriaAttributes['aria-label'];
};

type WithIconOnClick = {
  /**
   * Will apply an onclick to icon within the badge
   */
  iconOnClick: MouseEventHandler<HTMLButtonElement>;

  /**
   * Aria label applied to the iconOnClick button
   */
  iconOnClickAriaLabel: AriaAttributes['aria-label'];
};

export type EuiBadgeProps = CommonProps &
  HTMLAttributes<HTMLElement> &
  Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> &
  ExclusiveUnion<WithIconOnClick, {}> &
  ExclusiveUnion<WithOnClick, {}> & {
    /**
     * Accepts any string from our icon library
     */
    iconType?: IconType;

    /**
     * The side of the badge the icon should sit
     */
    iconSide?: IconSide;

    /**
     * Accepts either our palette colors (primary, success ..etc) or a hex value `#FFFFFF`, `#000`.
     */
    color?: BadgeColor | string;
    /**
     * Will override any color passed through the `color` prop.
     */
    isDisabled?: boolean;

    /**
     * Props passed to the close button.
     */
    closeButtonProps?: Partial<PropsOf<typeof EuiIcon>>;
  };

export const EuiBadge: FunctionComponent<EuiBadgeProps> = ({
  children,
  color = 'default',
  iconType,
  iconSide = 'left',
  className,
  isDisabled: _isDisabled,
  onClick,
  iconOnClick,
  onClickAriaLabel,
  iconOnClickAriaLabel,
  closeButtonProps,
  href,
  rel,
  target,
  style,
  ...rest
}) => {
  const euiTheme = useEuiTheme();

  const isClickable = !!(onClick || href);
  const isHrefValid = !href || validateHref(href);
  const isDisabled = _isDisabled || !isHrefValid;
  const isNamedColor = COLORS.includes(color as BadgeColor);
  const hasChildren = !!children;

  const customColorStyles = useMemo(() => {
    // Named colors set their styles via Emotion CSS and not inline styles
    if (isNamedColor) return style;

    // Do our best to ensure custom colors provide sufficient contrast
    try {
      // Set dark or light text color based upon best contrast
      const textColor = getTextColor(euiTheme, color);

      // Check the contrast ratio. If it's low contrast, emit a console awrning
      const contrastRatio = getColorContrast(textColor, color);
      if (contrastRatio < wcagContrastMin) {
        console.warn(
          `Warning: ${color} badge has a low contrast of ${contrastRatio.toFixed(
            2
          )}. Should be above ${wcagContrastMin}.`
        );
      }

      return {
        backgroundColor: color,
        color: textColor,
        ...style,
      };
    } catch (err) {
      if (!getIsValidColor(color)) {
        console.warn(
          'EuiBadge expects a valid color. This can either be a three or six ' +
            `character hex value, rgb(a) value, hsv value, hollow, or one of the following: ${COLORS}. ` +
            `Instead got ${color}.`
        );
      }
    }
  }, [color, isNamedColor, style, euiTheme]);

  const styles = euiBadgeStyles(euiTheme);
  const cssStyles = [
    styles.euiBadge,
    isNamedColor && styles[color as BadgeColor],
    isClickable && !iconOnClick && styles.clickable,
    isDisabled && styles.disabled,
  ];
  const textCssStyles = [
    styles.text.euiBadge__text,
    isDisabled && styles.text.disabled,
    isClickable && !isDisabled && styles.text.clickable,
    isClickable && !isDisabled && iconOnClick && styles.text.childButton,
  ];

  const classes = classNames('euiBadge', className);

  if (onClick && !onClickAriaLabel) {
    console.warn(
      'When passing onClick to EuiBadge, you must also provide onClickAriaLabel'
    );
  }

  const optionalIcon: ReactNode = useMemo(() => {
    if (!iconType) return null;

    const styles = euiBadgeIconStyles(euiTheme);

    if (iconOnClick) {
      if (!iconOnClickAriaLabel) {
        console.warn(
          'When passing iconOnClick to EuiBadge, you must also provide iconOnClickAriaLabel'
        );
      }

      return (
        <button
          type="button"
          className="euiBadge__iconButton"
          css={styles.euiBadge__iconButton}
          aria-label={iconOnClickAriaLabel}
          disabled={isDisabled}
          title={iconOnClickAriaLabel}
          onClick={iconOnClick}
        >
          <EuiIcon
            type={iconType}
            size="s"
            color="inherit" // forces the icon to inherit its parent color
            {...closeButtonProps}
            className={classNames(
              'euiBadge__icon',
              closeButtonProps?.className
            )}
          />
        </button>
      );
    } else {
      return (
        <EuiIcon
          type={iconType}
          size={hasChildren ? 's' : 'm'}
          className="euiBadge__icon"
          css={styles.euiBadge__icon}
          color="inherit" // forces the icon to inherit its parent color
        />
      );
    }
  }, [
    iconType,
    iconOnClick,
    iconOnClickAriaLabel,
    closeButtonProps,
    isDisabled,
    hasChildren,
    euiTheme,
  ]);

  const clickableBadgeProps = {
    href,
    rel,
    target,
    onClick,
    'aria-label': isClickable ? onClickAriaLabel : undefined,
    ...rest,
  };

  return (
    <RenderLinkOrButton
      fallbackElement="span"
      className={classes}
      css={cssStyles}
      style={customColorStyles}
      isDisabled={isDisabled}
      {...(!iconOnClick && clickableBadgeProps)}
    >
      <span className="euiBadge__content" css={styles.euiBadge__content}>
        {iconSide === 'left' && optionalIcon}
        {children && (
          <EuiInnerText>
            {(ref, innerText) => (
              <RenderLinkOrButton
                fallbackElement="span"
                className="euiBadge__text"
                css={textCssStyles}
                elementRef={ref}
                title={innerText}
                {...(iconOnClick && !isDisabled && clickableBadgeProps)}
              >
                {children}
              </RenderLinkOrButton>
            )}
          </EuiInnerText>
        )}
        {iconSide === 'right' && optionalIcon}
      </span>
    </RenderLinkOrButton>
  );
};
