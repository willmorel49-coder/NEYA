/* ============================================================
   FormField — Wrapper label + control + helper/error
   ============================================================
   Pattern :
     <FormField label="..." helper="..." error={...} required={true}>
       <Input ... /> | <Textarea ... />
     </FormField>
   ============================================================ */

import { Children, cloneElement, isValidElement, useId } from 'react';
import Eyebrow from './Eyebrow';
import Body from './Body';

export default function FormField({
  label,
  helper,
  error,
  required = false,
  children,
  style = {},
}) {
  const reactId = useId();
  const fieldId = `field-${reactId}`;
  const helperId = helper ? `${fieldId}-helper` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

  // Propagate accessibility props to a single child control if possible.
  const enhancedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    return cloneElement(child, {
      id: child.props.id || fieldId,
      'aria-describedby': child.props['aria-describedby'] || describedBy,
      'aria-invalid': child.props['aria-invalid'] ?? (!!error || undefined),
      'aria-required': child.props['aria-required'] ?? (required || undefined),
    });
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        width: '100%',
        ...style,
      }}
    >
      {label && (
        <label htmlFor={fieldId} style={{ display: 'block' }}>
          <Eyebrow color="muted">
            {label}
            {required && (
              <span aria-hidden style={{ color: 'var(--rose-700)', marginLeft: 4 }}>
                *
              </span>
            )}
          </Eyebrow>
        </label>
      )}

      {enhancedChildren}

      {helper && !error && (
        <div id={helperId}>
          <Body variant="caption">{helper}</Body>
        </div>
      )}

      {error && (
        <div id={errorId} role="alert">
          <Body
            variant="caption"
            style={{ color: 'var(--rose-700)' }}
          >
            {error}
          </Body>
        </div>
      )}
    </div>
  );
}
