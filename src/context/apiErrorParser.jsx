// apiErrorParser.js
export const getErrorMessage = (error, fallback = 'Une erreur est survenue') => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};
