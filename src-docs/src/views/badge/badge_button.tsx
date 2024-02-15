import React from 'react';

import {
  EuiBadge,
  EuiFlexGroup,
  EuiFlexItem,
} from '../../../../src/components';

export default () => (
  <EuiFlexGroup wrap responsive={false} gutterSize="xs">
    <EuiFlexItem grow={false}>
      <EuiBadge
        color="primary"
        onClick={() => {}}
        onClickAriaLabel="Example of onClick event for the button"
      >
        onClick on text within badge
      </EuiBadge>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiBadge
        color="hollow"
        iconType="cross"
        iconSide="right"
        iconOnClick={() => {}}
        iconOnClickAriaLabel="Example of onClick event for icon within the button"
      >
        onClick on icon within badge
      </EuiBadge>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiBadge
        color="success"
        iconType="cross"
        iconSide="right"
        onClick={() => {}}
        onClickAriaLabel="Example of onClick event for the button"
        iconOnClick={() => {}}
        iconOnClickAriaLabel="Example of onClick event for icon within the button"
      >
        onClick on both text and icon within badge
      </EuiBadge>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiBadge
        isDisabled={true}
        color="danger"
        onClick={() => {}}
        onClickAriaLabel="Example of disabled button badge"
        iconType="cross"
        iconSide="right"
        iconOnClick={() => {}}
        iconOnClickAriaLabel="Example of disabled button badge"
      >
        disabled button badge
      </EuiBadge>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiBadge
        color="danger"
        iconType="cross"
        iconSide="right"
        iconOnClick={() => {}}
        iconOnClickAriaLabel="Example of clickable icon button badge"
      />
    </EuiFlexItem>
  </EuiFlexGroup>
);
