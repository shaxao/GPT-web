import { createMenu } from './main.js';
import { fetchResults, loadImage, fetchGetResults } from './utils/request.js';
import { getOpenaiBaseUrl, getAuthToken, setCurrentActiveChatBox, getCurrentActiveChatBox, setActiveSessionId, getActiveSessionId } from './common.js';
// document.addEventListener('DOMContentLoaded', () => {
export async function gptsBeginTalk(path) {
  let chatBoxID = "";


  const sidebarMenu = document.getElementById("sidebar-menu");
  const backdrop = document.querySelector('.fixed.inset-0');
  backdrop.style.display = 'none'; // 隐藏背景遮罩
  document.getElementById('container').innerHTML = '';
  document.getElementById('container').style.display = 'none';
  // console.log('clear the container');
  // sidebarMenu.click();
  // 创建会话ID
  const sessionId = crypto.randomUUID();
  setActiveSessionId(sessionId);

  // 如果还没有激活的会话，设置第一个会话为激活状态
  if (getActiveSessionId() === null) {
    setActiveSessionId(sessionId);
  }

  // 创建新的会话标题
  const sessionList = document.getElementById('session-list');
  const sessionTitle = document.createElement('div');
  sessionTitle.id = "session-title";
  sessionTitle.classList.add('session-title');
  const titleTextSpan = document.createElement('span');
  titleTextSpan.id = 'title-text';
  titleTextSpan.classList.add("title-text");
  titleTextSpan.textContent = `新建聊天  #${document.querySelectorAll('.session-title').length + 1}`;
  sessionTitle.appendChild(titleTextSpan);
  sessionTitle.setAttribute('data-session-id', sessionId);
  createMenu(sessionTitle);
  // 检查session-list容器中是否有子节点
  if (sessionList.firstChild) {
    // 如果有，插入到第一个子节点之前
    sessionList.insertBefore(sessionTitle, sessionList.firstChild);
  } else {
    // 如果没有，正常追加
    sessionList.appendChild(sessionTitle);
  }

  // 创建新的聊天区域
  let chatBox = document.createElement('div');
  chatBox.classList.add('chat-box');
  chatBoxID = 'chat_' + sessionId;
  chatBox.setAttribute('id', 'chat_' + sessionId);
  chatBox.setAttribute('gizmo', path);
  chatBox.style.display = 'none';
  document.getElementById('chat-areas-container').appendChild(chatBox);
  sessionTitle.click();
  setCurrentActiveChatBox(chatBox);
  await fetcGptsContent(getCurrentActiveChatBox(), path);
  // sidebarMenu.click();
  // 如果是第一个会话，立即显示它
  // if (sessionId === getActiveSessionId()) {
  //   // console.log("第一个会话，显示");
  //   chatBox.style.display = 'block';
  // }

  // 注册点击会话标题的事件
  sessionTitle.addEventListener('click', function () {
    // 获取点击的会话ID
    const selectedSessionId = this.getAttribute('data-session-id');
    const chatContainer = document.getElementById("chat-container");
    const newContainer = document.getElementById("new-container");
    chatContainer.style.display = 'block';
    newContainer.style.display = 'none';
    // activeSessionId = selectedSessionId;
    setActiveSessionId(selectedSessionId);

    // 隐藏所有聊天区域
    const allChats = document.querySelectorAll('.chat-box');
    allChats.forEach(chat => chat.style.display = 'none');

    // 显示点击的会话对应的聊天区域
    // console.log("标题点击事件:", selectedSessionId);
    const activeChatBox = document.getElementById('chat_' + selectedSessionId);
    activeChatBox.style.display = 'block';
    // console.log('activeChatBox', activeChatBox)
    // currentActiveChatBox = activeChatBox;
    setCurrentActiveChatBox(activeChatBox);
  });

  sessionTitle.click();
}

//}


async function fetcGptsContent(chatBox, path) {
  try {
    let defaultContent = chatBox.querySelector('.default-content');
    // console.log("chatBox", chatBox);
    if (defaultContent) {
      chatBox.removeChild(defaultContent);
    }
    const openaiBaseUrl = getOpenaiBaseUrl();
    const auth_token = getAuthToken();
    const url = `${openaiBaseUrl}/backend-api/gizmos/${path}`;
    const data = await fetchGetResults(url, auth_token);
    const imgUrl = await loadImage(data.gizmo.display.profile_picture_url);
    // console.log('data', imgUrl);
    let gptsContent = document.createElement('div');
    gptsContent.classList.add('gpts-content');

    // const response = await fetch('/api/default-content');

    // const data = await response.json();
    gptsContent.innerHTML = `<div class="relative">
      <div class="mb-3 h-12 w-12">
        <div class="gizmo-shadow-stroke overflow-hidden rounded-full l-35"><img
            src="${imgUrl}"
            class="h-full w-full bg-token-main-surface-secondary" alt="GPT" width="80" height="80"></div>
      </div>
    </div>
    <div class="flex flex-col items-center gap-2">
      <div class="text-center text-2xl font-medium">${data.gizmo.display.name}</div>
      <div class="flex items-center gap-1 text-token-text-tertiary">
        <div class="mt-1 flex flex-row items-center space-x-1">
          <div class="text-sm text-token-text-tertiary">创建者：${data.gizmo.author.display_name}</div>
          <div>
            <div class="my-2" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:ro4:"
              data-state="closed">
              <div class="flex items-center gap-1 rounded-xl bg-token-main-surface-secondary px-2 py-1"><svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                  class="icon-xs text-token-text-secondary">
                  <path fill="currentColor" fill-rule="evenodd"
                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m9.985-7.997a.3.3 0 0 0-.064.03c-.13.08-.347.291-.596.744-.241.438-.473 1.028-.674 1.756-.336 1.22-.567 2.759-.632 4.467h3.962c-.065-1.708-.296-3.247-.632-4.467-.201-.728-.433-1.318-.674-1.756-.25-.453-.466-.665-.596-.743a.3.3 0 0 0-.064-.031L12 4q-.003 0-.015.003M8.018 11c.066-1.867.316-3.588.705-5 .15-.544.325-1.054.522-1.513A8.01 8.01 0 0 0 4.062 11zm-3.956 2h3.956c.077 2.174.404 4.156.912 5.68q.144.435.315.833A8.01 8.01 0 0 1 4.062 13m5.957 0c.076 1.997.378 3.757.808 5.048.252.756.53 1.296.79 1.626.128.162.232.248.302.29q.049.03.066.033L12 20l.015-.003a.3.3 0 0 0 .066-.032c.07-.043.174-.13.301-.291.26-.33.539-.87.79-1.626.43-1.29.732-3.05.809-5.048zm5.963 0c-.077 2.174-.404 4.156-.912 5.68q-.144.435-.315.833A8.01 8.01 0 0 0 19.938 13zm3.956-2a8.01 8.01 0 0 0-5.183-6.513c.197.46.371.969.522 1.514.389 1.41.639 3.132.705 4.999z"
                    clip-rule="evenodd"></path>
                </svg><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"
                  class="icon-xs text-token-text-secondary">
                  <path
                    d="M11.1 0H0.9C0.661305 0 0.432387 0.0948212 0.263604 0.263604C0.0948212 0.432387 0 0.661305 0 0.9V11.1C0 11.3387 0.0948212 11.5676 0.263604 11.7364C0.432387 11.9052 0.661305 12 0.9 12H11.1C11.3387 12 11.5676 11.9052 11.7364 11.7364C11.9052 11.5676 12 11.3387 12 11.1V0.9C12 0.661305 11.9052 0.432387 11.7364 0.263604C11.5676 0.0948212 11.3387 0 11.1 0ZM3.6 10.2H1.8V4.8H3.6V10.2ZM2.7 3.75C2.49371 3.7441 2.29373 3.67755 2.12505 3.55865C1.95637 3.43974 1.82647 3.27377 1.75158 3.08147C1.67669 2.88916 1.66012 2.67905 1.70396 2.47738C1.7478 2.27572 1.8501 2.09144 1.99807 1.94758C2.14604 1.80372 2.33312 1.70666 2.53594 1.66852C2.73876 1.63038 2.94832 1.65285 3.13844 1.73313C3.32856 1.8134 3.49081 1.94793 3.60491 2.11989C3.71902 2.29185 3.77992 2.49363 3.78 2.7C3.77526 2.98221 3.659 3.25107 3.45663 3.44782C3.25426 3.64457 2.98223 3.75321 2.7 3.75ZM10.2 10.2H8.4V7.356C8.4 6.504 8.04 6.198 7.572 6.198C7.43479 6.20714 7.30073 6.24329 7.17753 6.30439C7.05433 6.36548 6.94441 6.45032 6.85409 6.55402C6.76377 6.65771 6.69483 6.77824 6.65123 6.90866C6.60762 7.03908 6.59021 7.17683 6.6 7.314C6.59702 7.34192 6.59702 7.37008 6.6 7.398V10.2H4.8V4.8H6.54V5.58C6.71552 5.313 6.95666 5.09554 7.24031 4.94846C7.52397 4.80138 7.84065 4.7296 8.16 4.74C9.09 4.74 10.176 5.256 10.176 6.936L10.2 10.2Z"
                    fill="currentColor"></path>
                </svg><span class="text-xs font-medium text-token-text-secondary">+1</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="max-w-md text-center text-sm font-normal text-token-text-primary">${data.gizmo.display.description}</div>
      <div class="mx-3 mt-12 flex max-w-3xl flex-wrap items-stretch justify-center gap-4">
      ${data.gizmo.display.prompt_starters.map(starter => `<button
        class="prompt-starter-btn relative flex w-40 flex-col gap-2 rounded-2xl border border-token-border-light px-3 pb-4 pt-3 text-left align-top text-[15px] shadow-[0_0_2px_0_rgba(0,0,0,0.05),0_4px_6px_0_rgba(0,0,0,0.02)] transition hover:bg-token-main-surface-secondary">
        <div class="prompt-starter line-clamp-3 text-gray-600 dark:text-gray-500 break-all">${starter}</div>
      </button>`).join('')}
        </div>
    </div>`;
    // defaultContent.innerHTML = `<div class="icon"><img src="${data.iconUrl}" alt="Help Icon" /></div>
    //                                <div class="text">${data.defaultText}</div>`;
    chatBox.appendChild(gptsContent);

    setTimeout(() => {
      document.querySelectorAll(".prompt-starter-btn").forEach(btn => {
        btn.addEventListener('click', function () {
          console.log('提示按钮点击');
          const messageInput = document.getElementById("message-input");
          messageInput.value = this.querySelector(".prompt-starter").textContent;
        });
      });
    }, 0);
  } catch (error) {
    console.error('Failed to fetch default content:', error);
  }
}
//}

// function onLinkClick(event) {
//
//   let target = event.target;
//   while (target && target.tagName !== 'A') {
//     target = target.parentNode;
//   }

//   if (target && target.matches('a[data-route]')) {
//     event.preventDefault();
//     const path = target.getAttribute('href');
//     history.pushState({}, '', path);
//     render(path);
//   }
// }

// // 使用事件委托将事件监听器添加到整个文档
// document.addEventListener('click', onLinkClick);

// window.addEventListener('popstate', () => {
//   render(window.location.pathname);
// });

// render(window.location.pathname);

