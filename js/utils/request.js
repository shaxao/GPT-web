import { showAlert } from '../iconBtn.js'
export async function fetchResults(url, auth_token) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth_token}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function fetchGetResults(url, auth_token) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${auth_token}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}


export async function postResults(url, auth_token, formData) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${auth_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export async function postAudiceResults(url, auth_token, formData) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${auth_token}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const stream = new ReadableStream({
    start(controller) {
      return pump();
      function pump() {
        return reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          return pump();
        });
      }
    }
  });

  const audioUrl = URL.createObjectURL(new Blob([await new Response(stream).blob()], { type: 'audio/ogg' }));
  return audioUrl;
}

export async function postResult(url, formData) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export function fetchWithTimeout(url, options, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(showAlert('请求超时: ' + timeout + 'ms', false));
    }, timeout);

    fetch(url, options)
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}



export async function loadImage(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to load image', error);
    return null;
  }
}

/**
 * 发送文本消息
 * @param {*} data 
 * @param {*} url 
 * @param {*} authToken 
 * @param {*} controller 
 * @returns 
 */
export async function postMessage({ url, data, authToken, controller }) {

  const requestOptions = {
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'Accept': '*/*',
      'Connection': 'keep-alive'
    },
    signal: controller.signal
  };

  const resp = await fetch(url, requestOptions);
  return resp;

}
