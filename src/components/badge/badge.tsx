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
  MouseEventHandler,
  Ref,
  useMemo,
  useCallback,
} from 'react';
import classNames from 'classnames';
import { CommonProps, ExclusiveUnion, PropsOf } from '../common';
import {
  useEuiTheme,
  useEuiMemoizedStyles,
  getSecureRelForTarget,
  wcagContrastMin,
} from '../../services';
import { EuiInnerText } from '../inner_text';
import { EuiIcon, IconType } from '../icon';
import { validateHref } from '../../services/security/href_validator';

import { getTextColor, getColorContrast, getIsValidColor } from './color_utils';
import { euiBadgeStyles } from './badge.styles';

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

type WithButtonProps = {
  /**
   * Will apply an onclick to the badge itself
   */
  onClick: MouseEventHandler<HTMLButtonElement>;

  /**
   * Aria label applied to the onClick button
   */
  onClickAriaLabel: AriaAttributes['aria-label'];
} & Omit<HTMLAttributes<HTMLButtonElement>, 'onClick' | 'color'>;

type WithAnchorProps = {
  href: string;
  target?: string;
  rel?: string;
} & Omit<HTMLAttributes<HTMLAnchorElement>, 'href' | 'color' | 'onClick'>;

type WithSpanProps = Omit<HTMLAttributes<HTMLSpanElement>, 'onClick' | 'color'>;

interface WithIconOnClick {
  /**
   * Will apply an onclick to icon within the badge
   */
  iconOnClick: MouseEventHandler<HTMLButtonElement>;

  /**
   * Aria label applied to the iconOnClick button
   */
  iconOnClickAriaLabel: AriaAttributes['aria-label'];
}

export type EuiBadgeProps = {
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
} & CommonProps &
  ExclusiveUnion<WithIconOnClick, {}> &
  ExclusiveUnion<
    ExclusiveUnion<WithButtonProps, WithAnchorProps>,
    WithSpanProps
  >;

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

  const isHrefValid = !href || validateHref(href);
  const isDisabled = _isDisabled || !isHrefValid;
  const isNamedColor = COLORS.includes(color as BadgeColor);

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

  const styles = useEuiMemoizedStyles(euiBadgeStyles);
  const cssStyles = [
    styles.euiBadge,
    isNamedColor && styles[color as BadgeColor],
    (onClick || href) && !iconOnClick && styles.clickable,
    isDisabled && styles.disabled,
  ];

  const classes = classNames('euiBadge', className);

  const Element = href && !isDisabled ? 'a' : 'button';
  const relObj = useMemo(() => {
    if (isDisabled) return;
    if (href) {
      return {
        href,
        target,
        rel: getSecureRelForTarget({ href, target, rel }),
      };
    }
  }, [isDisabled, href, target, rel]);

  const hasChildren = !!children;
  const optionalIcon = useMemo(() => {
    if (!iconType) return;

    const iconCssStyles = [styles.icon.euiBadge__icon, styles.icon[iconSide]];
    const iconButtonCssStyles = [
      styles.iconButton.euiBadge__iconButton,
      styles.iconButton[iconSide],
    ];
    const closeClassNames = classNames(
      'euiBadge__icon',
      closeButtonProps?.className
    );

    if (iconOnClick) {
      if (!iconOnClickAriaLabel) {
        console.warn(
          'When passing the iconOnClick props to EuiBadge, you must also provide iconOnClickAriaLabel'
        );
      }
      return (
        <button
          type="button"
          className="euiBadge__iconButton"
          css={iconButtonCssStyles}
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
            className={closeClassNames}
            css={[...iconCssStyles, closeButtonProps?.css]}
          />
        </button>
      );
    }
    return (
      <EuiIcon
        type={iconType}
        size={hasChildren ? 's' : 'm'}
        className="euiBadge__icon"
        css={iconCssStyles}
        color="inherit" // forces the icon to inherit its parent color
      />
    );
  }, [
    iconType,
    iconSide,
    iconOnClick,
    iconOnClickAriaLabel,
    closeButtonProps,
    isDisabled,
    hasChildren,
    styles,
  ]);

  if (onClick && !onClickAriaLabel) {
    console.warn(
      'When passing onClick to EuiBadge, you must also provide onClickAriaLabel'
    );
  }

  const BadgeContent = useCallback(
    ({ children }: Pick<EuiBadgeProps, 'children'>) => (
      <span className="euiBadge__content" css={styles.euiBadge__content}>
        {iconSide === 'left' && optionalIcon}
        {children}
        {iconSide === 'right' && optionalIcon}
      </span>
    ),
    [styles, iconSide, optionalIcon]
  );

  const textIsClickable = !!(onClick || href) && !isDisabled;
  const BadgeTextContent = useCallback(
    ({ children }: Pick<EuiBadgeProps, 'children'>) => {
      const textCssStyles = [
        styles.text.euiBadge__text,
        textIsClickable && styles.text.clickable,
      ];
      return children ? (
        <span className="euiBadge__text" css={textCssStyles}>
          {children}
        </span>
      ) : null;
    },
    [styles, textIsClickable]
  );

  if (iconOnClick) {
    return onClick || href ? (
      <span className={classes} css={cssStyles} style={customColorStyles}>
        <BadgeContent>
          <EuiInnerText>
            {(ref, innerText) => (
              <Element
                className="euiBadge__childButton"
                css={styles.euiBadge__childButton}
                disabled={isDisabled}
                aria-label={onClickAriaLabel}
                ref={ref}
                title={innerText}
                onClick={onClick as MouseEventHandler}
                {...relObj}
                {...(rest as HTMLAttributes<HTMLElement>)}
              >
                {children}
              </Element>
            )}
          </EuiInnerText>
        </BadgeContent>
      </span>
    ) : (
      <EuiInnerText>
        {(ref, innerText) => (
          <span
            className={classes}
            css={cssStyles}
            style={customColorStyles}
            ref={ref}
            title={innerText}
            {...rest}
          >
            <BadgeContent>
              <BadgeTextContent>{children}</BadgeTextContent>
            </BadgeContent>
          </span>
        )}
      </EuiInnerText>
    );
  } else if (onClick || href) {
    return (
      <EuiInnerText>
        {(ref, innerText) => (
          <Element
            disabled={isDisabled}
            aria-label={onClickAriaLabel}
            className={classes}
            css={cssStyles}
            style={customColorStyles}
            ref={ref as Ref<HTMLButtonElement & HTMLAnchorElement>}
            title={innerText}
            {...(relObj as HTMLAttributes<HTMLElement>)}
            {...(rest as HTMLAttributes<HTMLElement>)}
          >
            <BadgeContent>
              <BadgeTextContent>{children}</BadgeTextContent>
            </BadgeContent>
          </Element>
        )}
      </EuiInnerText>
    );
  } else {
    return (
      <EuiInnerText>
        {(ref, innerText) => (
          <span
            className={classes}
            css={cssStyles}
            style={customColorStyles}
            ref={ref}
            title={innerText}
            {...rest}
          >
            <BadgeContent>
              <BadgeTextContent>{children}</BadgeTextContent>
            </BadgeContent>
          </span>
        )}
      </EuiInnerText>
    );
  }
};
