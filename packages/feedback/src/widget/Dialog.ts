import type { FeedbackComponent, FeedbackConfigurationWithDefaults, FeedbackFormData } from '../types';
import { Form } from './Form';
import { createElement as h } from './util/createElement';

interface DialogProps {
  defaultName: string;
  defaultEmail: string;
  onCancel?: (e: Event) => void;
  onClose?: () => void;
  onSubmit?: (feedback: FeedbackFormData) => void;
  options: FeedbackConfigurationWithDefaults;
}

interface DialogComponent extends FeedbackComponent<HTMLDialogElement> {
  /**
   * Shows the error message
   */
  showError: (message: string) => void;

  /**
   * Hides the error message
   */
  hideError: () => void;

  /**
   * Disable submit button so that it cannot be clicked
   */
  setSubmitDisabled: () => void;

  /**
   * Enable submit buttons so that it can be clicked
   */
  setSubmitEnabled: () => void;

  /**
   * Opens and shows the dialog and form
   */
  open: () => void;

  /**
   * Closes the dialog and form
   */
  close: () => void;
}

/**
 * Feedback dialog component that has the form
 */
export function Dialog({
  defaultName,
  defaultEmail,
  onClose,
  onCancel,
  onSubmit,
  options,
}: DialogProps): DialogComponent {
  let $el: HTMLDialogElement | null = null;

  /**
   * Handles when the dialog is clicked. In our case, the dialog is the
   * semi-transparent bg behind the form. We want clicks outside of the form to
   * hide the form.
   */
  function handleDialogClick() {
    close();

    // Only this should trigger `onClose`, we don't want the `close()` method to
    // trigger it, otherwise it can cause cycles.
    onClose && onClose();
  }

  /**
   * Close the dialog
   */
  function close() {
    if ($el) {
      $el.open = false;
    }
  }

  /**
   * Opens the dialog
   */
  function open() {
    if ($el) {
      $el.open = true;
    }
  }

  const {
    $el: $form,
    setSubmitEnabled,
    setSubmitDisabled,
    showError,
    hideError,
  } = Form({
    defaultName,
    defaultEmail,
    options,
    onSubmit,
    onCancel,
  });

  $el = h(
    'dialog',
    {
      id: 'feedback-dialog',
      className: 'dialog',
      open: true,
      onClick: handleDialogClick,
    },
    h(
      'div',
      {
        className: 'dialog__content',
        onClick: e => {
          // Stop event propagation so clicks on content modal do not propagate to dialog (which will close dialog)
          e.stopPropagation();
        },
      },
      h('h2', { className: 'dialog__header' }, options.formTitle),
      $form,
    ),
  );

  return {
    $el,
    showError,
    hideError,
    setSubmitDisabled,
    setSubmitEnabled,
    open,
    close,
  };
}