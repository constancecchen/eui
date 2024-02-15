/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, {
  FunctionComponent,
  ReactNode,
  Ref,
  HTMLAttributes,
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  LabelHTMLAttributes,
  useMemo,
} from 'react';
import classNames from 'classnames';

import {
  useEuiTheme,
  useGeneratedHtmlId,
  validateHref,
  RenderLinkOrButton,
} from '../../services';

import { CommonProps, ExclusiveUnion } from '../common';

import { EuiBetaBadge } from '../badge/beta_badge';
import { IconType } from '../icon';
import { EuiRadio, EuiCheckbox } from '../form';
import { EuiToolTip, EuiToolTipProps } from '../tool_tip';

import {
  euiKeyPadMenuItemStyles,
  euiKeyPadMenuItemChildStyles,
} from './key_pad_menu_item.styles';

export type EuiKeyPadMenuItemCommonProps = {
  /**
   * One will be generated if not provided
   */
  id?: string;
  /**
   * Pass an EuiIcon, preferrably `size="l"`
   */
  children: ReactNode;
  isDisabled?: boolean;
  /**
   * Indicate if an item is the current one.
   * Be sure to use `true` AND `false` when acting as a toggle to ensure the attribute is added for both states
   */
  isSelected?: boolean;
  /**
   * The text to display beneath the icon
   */
  label: ReactNode;
};

type EuiKeyPadMenuItemPropsForUncheckable = HTMLAttributes<HTMLElement> &
  Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'type'> &
  Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> & {
    /**
     * Beta badges are unavailable if the item is checkable
     */
    checkable?: never;
    /**
     * Add a badge to the card to label it as "Beta" or other non-GA state
     */
    betaBadgeLabel?: string;
    /**
     * Supply an icon type if the badge should just be an icon
     */
    betaBadgeIconType?: IconType;
    /**
     * Add a description to the beta badge (will appear in a tooltip)
     */
    betaBadgeTooltipContent?: ReactNode;
    /**
     * Extends the wrapping EuiToolTip props when `betaBadgeLabel` is provided
     */
    betaBadgeTooltipProps?: Partial<
      Omit<EuiToolTipProps, 'title' | 'content' | 'delay'>
    >;
    /**
     * Use `onClick` instead when the item is not `checkable`
     */
    onChange?: never;
    buttonRef?: Ref<HTMLButtonElement | HTMLAnchorElement>;
  };

export type EuiKeyPadMenuItemCheckableType = 'single' | 'multi';

type EuiKeyPadMenuItemPropsForCheckable = Omit<
  LabelHTMLAttributes<HTMLLabelElement>,
  'onChange'
> & {
  /**
   * Use `onChange` instead when the item is `checkable`
   */
  onClick?: never;
} & ExclusiveUnion<
    {
      /**
       * Type `'single'` renders the item as a `<label>` and
       * adds a radio element.
       */
      checkable: 'single';
      /**
       * The `name` attribute for radio inputs;
       * Required in order to group properly
       */
      name: string;
      /**
       * The value of the radio input for 'single'
       */
      value?: string;
      /**
       * Single: Returns the `id` of the clicked option and the `value`
       */
      onChange: (id: string, value?: any) => void;
    },
    {
      /**
       * Type `'multi'` renders the item as a `<label>` and
       * adds a checkbox.
       */
      checkable: 'multi';
      /**
       * Multi: Returns the `id` of the clicked option
       */
      onChange: (id: string) => void;
    }
  >;

export type EuiKeyPadMenuItemProps = CommonProps &
  EuiKeyPadMenuItemCommonProps &
  ExclusiveUnion<
    EuiKeyPadMenuItemPropsForCheckable,
    EuiKeyPadMenuItemPropsForUncheckable
  >;

export const EuiKeyPadMenuItem: FunctionComponent<EuiKeyPadMenuItemProps> = ({
  id,
  isSelected,
  isDisabled: _isDisabled,
  label,
  children,
  className,
  betaBadgeLabel,
  betaBadgeTooltipContent,
  betaBadgeIconType,
  betaBadgeTooltipProps,
  href,
  rel,
  target,
  buttonRef,
  // Checkable props
  checkable,
  name,
  value,
  disabled,
  onChange,
  ...rest
}) => {
  const isHrefValid = !href || validateHref(href);
  const isDisabled = !!(disabled || _isDisabled || !isHrefValid);

  const euiTheme = useEuiTheme();
  const styles = euiKeyPadMenuItemStyles(euiTheme);
  const cssStyles = [
    styles.euiKeyPadMenuItem,
    !isDisabled ? styles.enabled : styles.disabled.disabled,
    isSelected && (!isDisabled ? styles.selected : styles.disabled.selected),
  ];

  const classes = classNames('euiKeyPadMenuItem', className);

  const itemId = useGeneratedHtmlId({ conditionalId: id });
  const childStyles = useMemo(
    () => euiKeyPadMenuItemChildStyles(euiTheme),
    [euiTheme]
  );

  const checkableElement = useMemo(() => {
    if (!checkable) return;

    const cssStyles = [
      childStyles.euiKeyPadMenuItem__checkableInput,
      !isSelected && isDisabled && childStyles.hideCheckableInput,
      !isSelected && !isDisabled && childStyles.showCheckableInputOnInteraction,
    ];

    const sharedProps = {
      id: itemId,
      className: 'euiKeyPadMenuItem__checkableInput',
      css: cssStyles,
      checked: isSelected,
      disabled: isDisabled,
      name,
    };

    if (checkable === 'single') {
      return (
        <EuiRadio
          {...sharedProps}
          value={value as string}
          onChange={() => onChange!(itemId, value)}
        />
      );
    } else {
      return (
        <EuiCheckbox {...sharedProps} onChange={() => onChange!(itemId)} />
      );
    }
  }, [
    checkable,
    isDisabled,
    isSelected,
    onChange,
    value,
    name,
    itemId,
    childStyles,
  ]);

  const betaBadge = useMemo(() => {
    if (!betaBadgeLabel) return;

    return (
      <EuiBetaBadge
        // Since we move the tooltip contents to a wrapping EuiToolTip,
        // this badge is purely visual therefore we can safely hide it from screen readers
        aria-hidden="true"
        size="s"
        color="subdued"
        className="euiKeyPadMenuItem__betaBadge"
        css={childStyles.euiKeyPadMenuItem__betaBadge}
        label={betaBadgeLabel.charAt(0)}
        iconType={betaBadgeIconType}
      />
    );
  }, [betaBadgeLabel, betaBadgeIconType, childStyles]);

  const inner = (
    <span
      className="euiKeyPadMenuItem__inner"
      css={childStyles.euiKeyPadMenuItem__inner}
    >
      {checkable ? checkableElement : betaBadge}
      <span
        className="euiKeyPadMenuItem__icon"
        css={childStyles.euiKeyPadMenuItem__icon}
      >
        {children}
      </span>
      <span
        className="euiKeyPadMenuItem__label"
        css={childStyles.euiKeyPadMenuItem__label}
      >
        {label}
      </span>
    </span>
  );

  const button = checkable ? (
    <label htmlFor={itemId} className={classes} css={cssStyles}>
      {inner}
    </label>
  ) : (
    <RenderLinkOrButton
      className={classes}
      css={cssStyles}
      fallbackElement="button"
      elementRef={buttonRef}
      isDisabled={isDisabled}
      href={href}
      rel={rel}
      target={target}
      linkProps={{ 'aria-current': isSelected }}
      buttonProps={{ 'aria-pressed': isSelected }}
      {...rest}
    >
      {inner}
    </RenderLinkOrButton>
  );

  return betaBadgeLabel ? (
    <EuiToolTip
      {...betaBadgeTooltipProps}
      title={betaBadgeLabel}
      content={betaBadgeTooltipContent}
      delay="long"
    >
      {button}
    </EuiToolTip>
  ) : (
    button
  );
};
