const SUPPORT_NUMBER = import.meta.env.VITE_SUPPORT_NUMBER || ''

export const getUserErrorMessage = (consecutiveFailures) => {
  if (consecutiveFailures >= 3) {
    return SUPPORT_NUMBER
      ? `An error occurred. Please try again later or contact customer care at ${SUPPORT_NUMBER}.`
      : 'An error occurred. Please try again later or contact customer care.'
  }

  return 'An error occurred. Please try again.'
}
