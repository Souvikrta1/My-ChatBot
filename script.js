import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

//function for showing three dots while chatbot is getting data for answers
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

//slow typing to make it look like the the bot thinking while typing
function typeText(element, text) {  //(messageDiv,parsedData)
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index)
      index++;
    } else {
      clearInterval(interval)
    }
  }, 20)
}

//making a unique id for every sibgle messages
function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timeStamp}-${hexadecimalString}`
}

//chat differentiator to see its us or its bot
function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class='chat'>
          <div class='profile'>
            <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}"/>
          </div>
          <div class='message' id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

//To get our typed data
const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight; // To put new message in view

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch data from server

  const response = await fetch('https://chatbot-server-ynng.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt') //sending our data from textarea
    })
  })
  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json(); //actual response coming from backend
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);

  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}




//on clicking the send button to submit
form.addEventListener('submit', (e) => {
  handleSubmit(e);
})

//on submitting with enter form
form.addEventListener('keyup', (e) => {
  if (e.code === 'Enter') {
    handleSubmit(e);
  }
})