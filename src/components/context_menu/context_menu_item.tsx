/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, {
  PropsWithChildren,
  ButtonHTMLAttributes,
  FunctionComponent,
  ReactElement,
  ReactNode,
  Ref,
  useMemo,
  useCallback,
} from 'react';
import classNames from 'classnames';

import {
  useEuiTheme,
  RenderLinkOrButton,
  type RenderLinkOrButtonProps,
  cloneElementWithCss,
} from '../../services';
import { CommonProps, keysOf } from '../common';
import { EuiIcon } from '../icon';
import { EuiToolTip, EuiToolTipProps } from '../tool_tip';

import { euiContextMenuItemStyles } from './context_menu_item.styles';

export type EuiContextMenuItemIcon = ReactElement<any> | string | HTMLElement;

export type EuiContextMenuItemLayoutAlignment = 'center' | 'top' | 'bottom';

export const SIZES = ['s', 'm'] as const;

export interface EuiContextMenuItemProps
  extends PropsWithChildren,
    CommonProps {
  icon?: EuiContextMenuItemIcon;
  hasPanel?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  buttonRef?: Ref<HTMLButtonElement>;
  /**
   * Required if using a tooltip. Add an optional tooltip on hover
   */
  toolTipContent?: ReactNode;
  /**
   * Optional configuration to pass to the underlying [EuiToolTip](/#/display/tooltip).
   * Accepts any prop that EuiToolTip does, except for `content` and `children`.
   */
  toolTipProps?: Partial<Omit<EuiToolTipProps, 'content' | 'children'>>;
  href?: string;
  target?: string;
  rel?: string;
  /**
   * How to align icon with content of button
   */
  layoutAlign?: EuiContextMenuItemLayoutAlignment;
  /**
   * Reduce the size to `s` when in need of a more compressed menu
   */
  size?: (typeof SIZES)[number];
}

type Props = CommonProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'onClick' | 'disabled'
  > &
  EuiContextMenuItemProps;

const layoutAlignToClassNames: {
  [align in EuiContextMenuItemLayoutAlignment]: string | null;
} = {
  center: null,
  top: 'euiContextMenu__itemLayout--top',
  bottom: 'euiContextMenu__itemLayout--bottom',
};

export const LAYOUT_ALIGN = keysOf(layoutAlignToClassNames);

export const EuiContextMenuItem: FunctionComponent<Props> = ({
  children,
  className,
  hasPanel,
  icon,
  buttonRef,
  disabled,
  layoutAlign = 'center',
  toolTipContent,
  toolTipProps,
  href,
  target,
  rel,
  size = 'm',
  ...rest
}) => {
  const classes = classNames('euiContextMenuItem', className);

  const euiTheme = useEuiTheme();
  const styles = useMemo(() => euiContextMenuItemStyles(euiTheme), [euiTheme]);
  const cssStyles = useCallback(
    (isDisabled: boolean) => [
      styles.euiContextMenuItem,
      styles.sizes[size],
      styles.layoutAlign[layoutAlign],
      isDisabled && styles.disabled,
    ],
    [styles, size, layoutAlign]
  );

  const iconNode = useMemo(() => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return (
        <EuiIcon
          type={icon}
          size="m"
          className="euiContextMenu__icon"
          css={styles.euiContextMenu__icon}
          color="inherit" // forces the icon to inherit its parent color
        />
      );
    } else {
      // Assume it's already an instance of an icon.
      return cloneElementWithCss(icon as ReactElement, {
        css: styles.euiContextMenu__icon,
      });
    }
  }, [icon, styles]);

  const arrowNode = useMemo(() => {
    if (hasPanel) {
      return (
        <EuiIcon
          type="arrowRight"
          size="m"
          className="euiContextMenu__arrow"
          css={styles.euiContextMenuItem__arrow}
        />
      );
    }
  }, [hasPanel, styles]);

  const Content = useCallback(
    ({ children }: Pick<Props, 'children'>) => {
      const textStyles = [
        styles.text.euiContextMenuItem__text,
        size === 's' && styles.text.s,
      ];
      return (
        <>
          {iconNode}
          <span className="euiContextMenuItem__text" css={textStyles}>
            {children}
          </span>
          {arrowNode}
        </>
      );
    },
    [iconNode, arrowNode, size, styles]
  );

  const elementProps: RenderLinkOrButtonProps = {
    fallbackElement: 'div',
    elementRef: buttonRef,
    componentCss: cssStyles,
    className: classes,
    href,
    target,
    rel,
    isDisabled: disabled,
    hasToolTip: !!toolTipContent,
    ...rest,
  };

  if (toolTipContent) {
    const anchorClasses = classNames(
      'eui-displayBlock',
      toolTipProps?.anchorClassName
    );
    return (
      <EuiToolTip
        position="right"
        {...toolTipProps}
        anchorClassName={anchorClasses}
        content={toolTipContent}
      >
        <RenderLinkOrButton {...elementProps}>
          <Content>{children}</Content>
        </RenderLinkOrButton>
      </EuiToolTip>
    );
  } else {
    return (
      <RenderLinkOrButton {...elementProps}>
        <Content>{children}</Content>
      </RenderLinkOrButton>
    );
  }
};
