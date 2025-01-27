let stompClient = null;
const subscriptions = {};

const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const sendRequestButton = document.getElementById('sendRequestButton');
const subscribeButton = document.getElementById('subscribeButton');
const socketUrlInput = document.getElementById('socketUrl');
const apiUrlInput = document.getElementById('apiUrl');
const bodyInput = document.getElementById('body');
const subscriptionPathInput = document.getElementById('subscriptionPath');
const subscribedPathsDiv = document.getElementById('subscribedPaths');
const headersContainer = document.getElementById('headersContainer');
const addHeaderButton = document.getElementById('addHeaderButton');

// WebSocket 연결
connectButton.addEventListener('click', () => {
  const socketUrl = socketUrlInput.value;

  if (!socketUrl) {
    alert('WebSocket URL을 입력하세요.');
    return;
  }

  const socket = new SockJS(socketUrl);
  stompClient = Stomp.over(socket);

  stompClient.connect({}, (frame) => {
    console.log('Connected:', frame);
    displayMessage('WebSocket Connected: ' + frame);
    toggleConnectionState(true);
  }, (error) => {
    console.error('Connection Error:', error);
    displayMessage('WebSocket Connection Error: ' + error);
  });
});

// WebSocket 연결 해제
disconnectButton.addEventListener('click', () => {
  if (stompClient) {
    stompClient.disconnect(() => {
      console.log('Disconnected');
      displayMessage('WebSocket Disconnected');
      toggleConnectionState(false);
    });
  }
});

// API 요청 전송
sendRequestButton.addEventListener('click', () => {
  const apiUrl = apiUrlInput.value;

  if (!apiUrl) {
    alert('API URL을 입력하세요.');
    return;
  }

  const headers = getHeaders();

  if (!headers) {
    alert('헤더를 추가하세요.');
    return;
  }

  const body = bodyInput.value;

  try {
    stompClient.send(apiUrl, headers, body);
    displayMessage(`Sent API Request: URL=${apiUrl}, Headers=${JSON.stringify(headers)}, Body=${body}`);
  } catch (error) {
    displayMessage('Error Sending Message: ' + error.message);
  }
});

// 구독 등록
subscribeButton.addEventListener('click', () => {
  const subscriptionPath = subscriptionPathInput.value;

  if (!subscriptionPath) {
    alert('구독 경로를 입력하세요.');
    return;
  }

  if (subscriptions[subscriptionPath]) {
    alert('이미 구독된 경로입니다.');
    return;
  }

  // 구독 시작
  const subscription = stompClient.subscribe(subscriptionPath, (message) => {
    displaySubscriptionMessage(subscriptionPath, message.body);
  });

  // 구독 경로 저장
  subscriptions[subscriptionPath] = subscription;

  // 구독 목록 갱신
  updateSubscribedPaths();

  // 구독한 경로 표시
  displayMessage('Subscribed to: ' + subscriptionPath);
});

// 연결 상태 토글
function toggleConnectionState(connected) {
  connectButton.disabled = connected;
  disconnectButton.disabled = !connected;
  sendRequestButton.disabled = !connected;
  subscribeButton.disabled = !connected;
}

// 구독된 경로 목록 갱신
function updateSubscribedPaths() {
  subscribedPathsDiv.innerHTML = ''; // 기존 목록 초기화

  Object.keys(subscriptions).forEach((path) => {
    const subscriptionElement = document.createElement('div');
    subscriptionElement.className = 'subscription';
    subscriptionElement.id = path;

    const subscriptionHeader = document.createElement('h3');
    subscriptionHeader.textContent = path;
    subscriptionElement.appendChild(subscriptionHeader);

    const messagesDiv = document.createElement('div');
    messagesDiv.className = 'messages';
    subscriptionElement.appendChild(messagesDiv);

    subscribedPathsDiv.appendChild(subscriptionElement);
  });
}

// 구독 경로에 대한 메시지 표시
function displaySubscriptionMessage(path, message) {
  const subscriptionDiv = document.getElementById(path);

  if (subscriptionDiv) {
    const messagesDiv = subscriptionDiv.querySelector('.messages');

    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);

    messagesDiv.scrollTop = messagesDiv.scrollHeight; // 메시지 스크롤 아래로 자동 이동
  }
}

// 메시지 화면에 표시 (이 부분은 더 이상 사용되지 않음)
function displayMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  document.body.appendChild(messageElement);
  messageElement.scrollTop = messageElement.scrollHeight;
}

// 헤더 목록 가져오기
function getHeaders() {
  const headers = {};
  const headerFields = document.querySelectorAll('.header-fields');

  headerFields.forEach((field) => {
    const key = field.querySelector('.header-key').value.trim();
    const value = field.querySelector('.header-value').value.trim();

    if (key && value) {
      headers[key] = value;
    }
  });

  return Object.keys(headers).length ? headers : null;
}

// 헤더 추가
addHeaderButton.addEventListener('click', () => {
  const newHeader = document.createElement('div');
  newHeader.className = 'header-fields';

  const keyInput = document.createElement('input');
  keyInput.className = 'header-key';
  keyInput.placeholder = 'Header Key';

  const valueInput = document.createElement('input');
  valueInput.className = 'header-value';
  valueInput.placeholder = 'Header Value';

  newHeader.appendChild(keyInput);
  newHeader.appendChild(valueInput);

  headersContainer.appendChild(newHeader);
});