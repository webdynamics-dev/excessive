import { showAlert } from './alerts.js';

const questionType = document.getElementById('type');
const question = document.getElementById('question');
const name = document.getElementById('name');
const email = document.getElementById('email');
const submit = document.getElementById('submit-question');

submit.addEventListener('click', async (e) => {
  if (
    questionType.validity.valid &&
    question.validity.valid &&
    email.validity.valid
  ) {
    const result = await fetch('/api/v1/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: questionType.value,
        question: question.value,
        name: name.value,
        email: email.value,
      }),
    });

    const data = await result.json();

    showAlert(data.status, data.message);
  } else {
    showAlert('fail', 'All mandatory fields must be filled in');
  }
});
