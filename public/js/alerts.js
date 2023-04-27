// * RESPONSE ALERTS

export const showAlert = function (statusCode, message) {
  hideAlert();
  const markup = `<div class="alert alert--${statusCode}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 7000);
};

export const hideAlert = function () {
  const alert = document.querySelector('.alert');
  if (alert) alert.parentElement.removeChild(alert);
};
