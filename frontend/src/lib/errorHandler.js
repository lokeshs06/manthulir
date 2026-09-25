import i18n from '../i18n';

export const getApiErrorMessage = (error) => {
  if (!error) return i18n.t('errors.UNKNOWN_ERROR');

  // If already a localized string or object with code
  if (typeof error === 'string') return error;

  const apiError = error.response?.data?.error;
  if (apiError?.code) {
    const translationKey = `errors.${apiError.code}`;
    if (i18n.exists(translationKey)) {
      return i18n.t(translationKey);
    }
    if (apiError.message) {
      return apiError.message;
    }
  }

  // Network errors
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return i18n.t('errors.NETWORK_ERROR');
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return i18n.t('errors.UNKNOWN_ERROR');
};
