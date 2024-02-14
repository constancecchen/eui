/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FunctionComponent, MouseEventHandler, useMemo } from 'react';

import { EuiAccordionProps } from '../accordion';
import { EuiAccordionButton } from './accordion_button';
import { EuiAccordionArrow } from './accordion_arrow';

type _EuiAccordionTriggerProps = Pick<
  EuiAccordionProps,
  | 'arrowDisplay'
  | 'arrowProps'
  | 'buttonElement'
  | 'buttonClassName'
  | 'buttonProps'
  | 'buttonContent'
  | 'buttonContentClassName'
  | 'extraAction'
  | 'isDisabled'
> & {
  isOpen: boolean;
  ariaControlsId: string;
  buttonId: string;
  onToggle: MouseEventHandler;
};

export const EuiAccordionTrigger: FunctionComponent<
  _EuiAccordionTriggerProps
> = ({
  arrowDisplay: _arrowDisplay,
  arrowProps,
  buttonElement = 'button',
  buttonProps,
  buttonClassName,
  buttonContent,
  buttonContentClassName,
  buttonId,
  ariaControlsId,
  isDisabled,
  isOpen,
  onToggle,
  extraAction,
}) => {
  // Force visibility of arrow button icon if button element is not interactive
  const buttonIsInteractive = buttonElement === 'button';
  const arrowDisplay =
    _arrowDisplay === 'none' && !buttonIsInteractive ? 'left' : _arrowDisplay;

  const passedArrowProps = {
    arrowDisplay,
    arrowProps,
    isOpen,
    onClick: onToggle,
    isDisabled,
    'aria-controls': ariaControlsId,
    'aria-expanded': isOpen,
    'aria-labelledby': buttonId,
    tabIndex: buttonIsInteractive ? -1 : 0,
  };

  const passedButtonProps = {
    buttonElement,
    buttonProps,
    buttonClassName,
    buttonContentClassName,
    children: buttonContent,
    arrowDisplay,
    isDisabled,
    id: buttonId,
    'aria-controls': ariaControlsId,
    // `aria-expanded` is only a valid attribute on interactive controls - axe-core throws a violation otherwise
    'aria-expanded': buttonIsInteractive ? isOpen : undefined,
    onClick: isDisabled ? undefined : onToggle,
  };

  const optionalAction = useMemo(() => {
    return extraAction ? (
      <div
        className="euiAccordion__optionalAction"
        css={{ flexShrink: 0, label: 'euiAccordion' }}
      >
        {extraAction}
      </div>
    ) : null;
  }, [extraAction]);

  return (
    <div
      className="euiAccordion__triggerWrapper"
      css={{ display: 'flex', alignItems: 'center' }}
    >
      {arrowDisplay === 'left' && <EuiAccordionArrow {...passedArrowProps} />}
      <EuiAccordionButton {...passedButtonProps} />
      {optionalAction}
      {arrowDisplay === 'right' && <EuiAccordionArrow {...passedArrowProps} />}
    </div>
  );
};
