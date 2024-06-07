import { models, baseUrl, getCookie, AUTH_TOKEN, audioKey, audioUrl, getFileExplare, getOpenaiBaseUrl, getAuthToken, Message, setActiveSessionId, getActiveSessionId, setCurrentActiveChatBox, getCurrentActiveChatBox, loadFromLocalStorage, API_URL, API_KEY } from "./common.js";
import { showAlert } from "./iconBtn.js";
import { globalModeSettings } from "./setup.js";
import { resetPreview, getImagePreviewSrc, getUploadFile, setImagePreviewSrc, setUploadFile } from "./upload.js";
import { fetchResults, postResults, fetchGetResults, postAudiceResults, postMessage, loadImage } from './utils/request.js'
export function createMenu(sessionTitle) {
  let menuIcon = document.createElement('span');
  menuIcon.classList.add("menu-icon");
  let iconImage = document.createElement('img');
  iconImage.setAttribute('src', './svg/three.svg');
  iconImage.setAttribute('alt', 'icon menu');

  // 将图标图片添加到menuIcon元素中
  menuIcon.appendChild(iconImage);
  menuIcon.onclick = function (event) {
    // 显示菜单
    const menu = document.getElementById('menu');
    // 分享会话
    const shareItem = menu.querySelector('li:nth-child(1)');
    shareItem.onclick = function () {
      menu.style.display = 'none';
      shareSession(sessionTitle.getAttribute('data-session-id'));
    };

    // // debug会话
    // const debugItem = menu.querySelector('li:nth-child(2)');
    // debugItem.onclick = function () {
    //   menu.style.display = 'none';
    //   debugSession(sessionTitle);
    // };

    // 重命名会话
    const renameItem = menu.querySelector('li:nth-child(2)');
    renameItem.onclick = function () {
      menu.style.display = 'none';
      renameSession(sessionTitle);
    };

    // 删除会话
    const deleteItem = menu.querySelector('li:nth-child(3)');
    deleteItem.onclick = function () {
      menu.style.display = 'none';
      deleteSession(sessionTitle.getAttribute('data-session-id'));
    };
    const sessionList = document.getElementById("sidebar");
    menu.style.display = 'block';
    // 计算点击位置相对于视窗的位置
    const clickY = event.clientY;
    // console.log("clickY", clickY);
    // 获取窗口的高度
    const windowHeight = sessionList.offsetHeight;
    // console.log("windowHeight", windowHeight);
    // 获取菜单的高度，假设已经设定好了
    const menuHeight = menu.offsetHeight;
    // console.log("menuHeight", menuHeight);
    // 检查点击位置和菜单高度以确定菜单是显示在menuIcon下方还是上方
    const topPos = clickY + menuHeight > windowHeight ? clickY - menuHeight - 50 : clickY - 30;
    menu.style.left = `${event.pageX - 200}px`;
    menu.style.top = `${topPos}px`;
    event.stopPropagation();
  }
  sessionTitle.appendChild(menuIcon);
  //document.getElementById('session-list').appendChild(sessionTitle);
}

// 分享会话的实现
function shareSession(sessionId) {
  console.log('Share session:', sessionId);
  alert("功能尚未实现，敬请期待");
  // 例如，可以复制会话链接到剪贴板
}

// debug会话的实现
function debugSession(sessionId) {
  console.log('Share session:', sessionId);
  alert("功能尚未实现，敬请期待");
}

// 重命名会话的实现 需要同步更新数据库数据
function renameSession(sessionTitle) {
  let titleTextSpa = sessionTitle.querySelector('.title-text');
  const currentText = titleTextSpa.textContent;
  titleTextSpa.contentEditable = 'true';

  titleTextSpa.focus();
  sessionTitle.classList.add('hide-icon');
  // 监听blur事件来应用新的名称
  titleTextSpa.onblur = function () {
    sessionTitle.classList.remove('hide-icon');
    titleTextSpa.contentEditable = 'false';
    titleTextSpa.scrollLeft = 0;
    let newText = titleTextSpa.textContent.trim();
    if (newText === '') {
      titleTextSpa.textContent = currentText;
    } else {
      titleTextSpa.textContent = newText;
    }

  }
}

// 删除会话的实现
function deleteSession(sessionId) {
  // console.log('Delete session:', sessionId);
  let sessionTitle = document.querySelector(`[data-session-id="${sessionId}"]`);
  let chatBox = document.getElementById('chat_' + sessionId);
  sessionTitle.remove();
  chatBox.remove();

  // 如果删除的是当前活跃的会话，需要选择一个新的会话作为活跃会话
  if (getActiveSessionId() === sessionId) {
    let allTitles = document.querySelectorAll('.session-title');
    if (allTitles.length > 0) {
      allTitles[0].click(); // 选择一个新的会话作为活跃会话
    } else {
      // activeSessionId = null; // 没有其他会话可选
      setActiveSessionId(null);
    }
  }
}
document.addEventListener("DOMContentLoaded", function () {
  /**
   * upload.js
   */
  const sendButton = document.getElementById("send-button");
  const messageInput = document.getElementById("message-input");
  const seatchBtn = document.getElementById("searchbtn");
  const dropdownContent = document.getElementById("dropdown-content");
  const openaiBaseUrl = globalModeSettings.webProxyUrl;
  const auth_token = globalModeSettings.accessToken;

  let userPath = "./svg/avatar-user.svg";
  let systemPath = "./svg/logo.svg";
  let systemName = "更勤奋更聪明的GPT4";

  // 放大图片功能
  const modal = document.getElementById("img-modal");
  const modalImg = document.getElementById("img01");
  const closeModal = document.getElementById("close-modal");

  // 当enter、发送按钮时应当是发送状态，再次enter、点击发送终止
  let isSend = false;
  let isFirstFlag = true;

  // 侧边栏伸缩
  var sidebar = document.getElementById('sidebar');
  var chatContainer = document.getElementById('chat-container');
  var toggleButton = document.getElementById('toggle-sidebar');
  var isRightArrow = false;

  //代码解释器
  const debugIcon = document.querySelector('.debug-icon');
  const codePython = document.getElementById('code-python');
  const toggleCode = document.getElementById("toggle-code");

  const audiopbtn = document.getElementById("audiopbtn");

  // 是否需要后端服务
  let isOnlyWeb = true;

  let chatBoxID = "";
  let isSearch = false;
  let globalSessionTitle = null;


  // 初始化默认会话和标题
  const sessionId = crypto.randomUUID();
  var currentActiveChatBox = getCurrentActiveChatBox();
  setActiveSessionId(sessionId);



  async function fetchSessionData() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + auth_token);
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Host", "chat.oaifree.com");
    myHeaders.append("Connection", "keep-alive");

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    if (openaiBaseUrl === '' || openaiBaseUrl === null) {
      try {

      } catch (error) {
        onsole.log('error', error)
      }
      const data = await fetchGetResults(`${baseUrl}/api/findTitle/0/28`, getCookie(AUTH_TOKEN));
      updateSessionTitle(data.data);
    } else {
      fetch(openaiBaseUrl + "/backend-api/conversations?offset=0&limit=28&order=updated", requestOptions)
        .then(response => response.json())
        .then(result => {
          // console.log(result);
          updateSessionTitle(result.items);
        })
        .catch(error => console.log('error', error));
    }


  }

  function updateSessionTitle(sessions) {
    sessions.forEach((session, index) => {
      // 创建会话标题元素
      // console.log(session)
      const sessionList = document.getElementById('session-list');
      let sessionTitle = document.createElement('div');
      sessionTitle.id = "session-title-" + session.id;
      sessionTitle.classList.add('session-title');
      sessionTitle.setAttribute('data-session-id', session.id); // 保存会话 ID 作为数据属性

      // 创建标题文本元素并设置内容
      let titleTextSpan = document.createElement('span');
      titleTextSpan.id = 'title-text-' + session.id;
      titleTextSpan.classList.add("title-text");
      titleTextSpan.textContent = session.title;

      var headTitleDiv = document.querySelector('.head-title');
      var spanElement = headTitleDiv.querySelector('span');
      spanElement.textContent = session.title;
      // 将标题文本元素添加到会话标题元素中
      sessionTitle.appendChild(titleTextSpan);

      createMenu(sessionTitle);
      sessionList.appendChild(sessionTitle);

      // 创建新的聊天区域
      let chatBox = document.createElement('div');
      chatBox.classList.add('chat-box');
      chatBoxID = 'chat_' + session.id;
      chatBox.setAttribute('id', 'chat_' + session.id);
      chatBox.style.display = 'none'; // 默认不显示，除非是第一个会话
      document.getElementById('chat-areas-container').appendChild(chatBox);
      // fetchDefaultContent(chatBox);

      // 如果是第一个会话，立即显示它
      if (session.id === getActiveSessionId()) {
        // console.log("第一个会话，显示");
        chatBox.style.display = 'block';
      }

      // 注册点击会话标题的事件
      sessionTitle.addEventListener('click', function () {
        // 更新head标题
        var headTitleDiv = document.querySelector('.head-title');
        var spanElement = headTitleDiv.querySelector('span');
        spanElement.textContent = session.title;
        const defaultContent = getCurrentActiveChatBox().querySelector('.default-content');
        if (defaultContent) {
          defaultContent.remove();
        }
        // 获取点击的会话ID
        const selectedSessionId = this.getAttribute('data-session-id');
        const chatContainer = document.getElementById("chat-container");
        const newContainer = document.getElementById("new-container");
        chatContainer.style.display = 'block';
        newContainer.style.display = 'none';
        // activeSessionId = selectedSessionId;
        setActiveSessionId(selectedSessionId);
        console.log('selectedSessionId', selectedSessionId)
        // 隐藏所有聊天区域
        const allChats = document.querySelectorAll('.chat-box');
        allChats.forEach(chat => chat.style.display = 'none');

        // 显示点击的会话对应的聊天区域
        const activeChatBox = document.getElementById('chat_' + selectedSessionId);
        activeChatBox.style.display = 'block';
        console.log('activeChatBox', activeChatBox)
        if (getCurrentActiveChatBox() === activeChatBox) {
          return;
        }
        // currentActiveChatBox = activeChatBox;
        setCurrentActiveChatBox(activeChatBox);
        const currentActiveChatBox = getCurrentActiveChatBox();
        currentActiveChatBox.innerHTML = "";
        fetchAndDisplayMessages(selectedSessionId, currentActiveChatBox);
        scrollChat();
      });
      // sessionTitle.click();
    });
  }

  // TUDO 需要时实现聊天记录的读取。点击服务器获取的标题事件，然后根据id获取聊天记录 目前的问题是只显示发送的消息，需要排查
  /**
   * 聊天记录读取  
   */
  async function fetchAndDisplayMessages(id, chatBox) {
    if (openaiBaseUrl === '' || openaiBaseUrl === null) {
      const data = await fetchGetResults(`${baseUrl}/api/findConver/${id}`, getCookie(AUTH_TOKEN));
      displayMessages(data.data, chatBox);
    } else {
      const data = await fetchGetResults(`${openaiBaseUrl}/backend-api/conversation/${id}`, auth_token);
      displayMessages(data.mapping, chatBox);
    }
  }

  function displayMessages(mapping, chatBox, processedIds = new Set()) {
    console.log('mapping', mapping);
    const sortedIds = Object.keys(mapping).sort((a, b) => {
      return new Date(mapping[a].message.createTime) - new Date(mapping[b].message.createTime);
    });

    sortedIds.forEach(id => {
      if (processedIds.has(id)) {
        return; // 如果已处理过此ID，跳过以避免重复处理
      }
      processedIds.add(id); // 标记此ID为已处理

      const node = mapping[id];
      // console.log("node:", node);
      if (node.message && node.message.content.parts && node.message.content.parts.length > 0 && node.message.content.parts[0] !== "") {
        const contentParts = node.message.content.parts;
        const role = node.message.author.role;
        if (role === "user") {
          displayUserMessage(contentParts.join(""), chatBox);
        } else {
          displayReceivedMessage(contentParts.join(""), chatBox);
        }
      }

      // 递归处理子消息
      node.children.forEach(childId => {
        if (mapping[childId]) {
          displayMessages({ [childId]: mapping[childId] }, chatBox, processedIds);
        }
      });
    });
  }

  function displayUserMessage(message, chatBox) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("receive-message-container");
    const avatarContainer = createAvatarAndUserName({ isUser: true, imgPath: userPath });
    messageContainer.appendChild(avatarContainer);

    const userMessageElement = document.createElement("div");
    userMessageElement.classList.add("message");

    const htmlMessage = marked.parse(message.replace(/\n/g, '  \n'));
    const textElement = document.createElement("div");
    textElement.classList.add("sent-message", "received");
    textElement.innerHTML = htmlMessage;
    userMessageElement.appendChild(textElement);
    messageContainer.appendChild(userMessageElement);

    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function displayReceivedMessage(message, chatBox) {
    const receiveMessageContainer = document.createElement("div");
    receiveMessageContainer.classList.add("receive-message-container");
    const avatarContainer = createAvatarAndUserName({ isUser: false, name: systemName, imgPath: systemPath });
    receiveMessageContainer.appendChild(avatarContainer);
    const replyElement = document.createElement("div");
    replyElement.classList.add("border-style");
    // console.log('message', message);

    // 自定义解析函数
    const sections = parseMessageSections(message);

    sections.forEach(section => {
      const messages = section.content.replace(/\\s/g, ' ').replace(/\\n/g, '\n')
      // console.log('section:', messages)
      if (section.isCode) {
        // console.log("是代码块")
        const codeElement = document.createElement("div");
        codeElement.classList.add("code-container");
        const codeBlock = document.createElement("code");
        const [codeType, ...codeLines] = messages.split('\n');
        codeBlock.className = `language-${codeType.trim()}`;
        codeBlock.classList.add('match-braces');
        codeBlock.textContent = codeLines.join('\n');
        const preElement = document.createElement("pre");
        preElement.appendChild(codeBlock);
        codeElement.appendChild(preElement);
        Prism.highlightElement(codeBlock);
        replyElement.appendChild(codeElement);
      } else {
        // console.log("不是代码块")
        const textElement = document.createElement("div");
        const message = marked.parse(messages);
        textElement.innerHTML = message;
        textElement.classList.add("received");
        replyElement.appendChild(textElement);
      }
    });

    receiveMessageContainer.appendChild(replyElement);
    chatBox.appendChild(receiveMessageContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
    createIcon(replyElement, receiveMessageContainer, chatBox, message);
  }

  // 解析消息文本，区分代码块和普通文本
  function parseMessageSections(text) {
    const sections = [];
    const lines = text.split(/(```)/);
    let currentContent = [];
    let isCode = false;

    lines.forEach(line => {
      // console.log('line', line);
      if (line === ('```')) {
        isCode = !isCode;
        return;
      }
      if (isCode) {
        currentContent.push(line)
        sections.push({ isCode: true, content: currentContent.join('\n') });
        currentContent = [];
      } else {
        currentContent.push(line)
        sections.push({ isCode: false, content: currentContent.join('\n') });
        currentContent = [];
      }
      // if (line.startsWith('```') || isCode === true) {
      //   isCode = !isCode;
      //   if (isCode) {
      //     // 结束当前代码块

      //     isCode = false;
      //   } else {
      //     // 开始一个新的代码块
      //     if (currentContent.length > 0) {
      //       // 添加之前的普通文本为一个段落

      //     }
      //     isCode = true;
      //   }
      // } else {
      //   currentContent.push(line);
      // }
    });

    if (currentContent.length > 0) {
      sections.push({ isCode: isCode, content: currentContent.join('\n') });
    }

    return sections;
  }




  // 调用函数以加载和显示聊天记录
  fetchAndDisplayMessages();


  fetchSessionData();


  const sessionList = document.getElementById('session-list');
  let sessionTitle = document.createElement('div');
  sessionTitle.id = "session-title";
  sessionTitle.classList.add('session-title');
  let titleTextSpan = document.createElement('span');
  titleTextSpan.id = 'title-text';
  titleTextSpan.classList.add("title-text");
  titleTextSpan.textContent = `新建聊天`;
  sessionTitle.appendChild(titleTextSpan);
  sessionTitle.setAttribute('data-session-id', sessionId);
  sessionList.insertBefore(sessionTitle, sessionList.firstChild);
  globalSessionTitle = sessionTitle;
  createMenu(sessionTitle);



  document.getElementById("user-set").addEventListener('click', function () {
    // 显示菜单
    const userSet = document.getElementById('user-set');
    const menu = document.getElementById('login-menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
      menu.style.display = 'flex';
      menu.style.width = `${userSet.offsetWidth}px`;
    } else {
      menu.style.display = 'none';
    }
    // 分享会话
    const emailItem = menu.querySelector('li:nth-child(1)');
    emailItem.onclick = function () {
      menu.style.display = 'none';
    };

    // const logOutItem = menu.querySelector('li:nth-child(2)');
    // logOutItem.onclick = function () {
    //   menu.style.display = 'none';
    //   logOutItem();
    // };
    const sessionList = document.getElementById("sidebar");
    // menu.style.display = 'block';
    event.stopPropagation();
  });

  // 创建菜单

  // createMenu(sessionTitle);
  // document.getElementById('session-list').appendChild(sessionTitle);

  let chatBox = document.createElement('div');
  chatBox.classList.add('chat-box');
  chatBoxID = 'chat_' + sessionId;
  chatBox.setAttribute('id', 'chat_' + sessionId);
  chatBox.style.display = 'block'; // 默认不显示，除非是第一个会话
  document.getElementById('chat-areas-container').appendChild(chatBox);
  setCurrentActiveChatBox(chatBox);
  // currentActiveChatBox = chatBox;

  let defaultContentGlobal = null;
  // 从服务器获取默认内容并显示
  async function fetchDefaultContent(chatBox) {
    try {
      let defaultContent = document.createElement('div');
      defaultContent.classList.add('default-content');
      // const response = await fetch('/api/default-content');
      // const data = await response.json();
      defaultContent.innerHTML = `<div class="chat-icon"><img style:"height: 40px;width: 40px;" src="./svg/chat-gpt.svg" alt="Help Icon" /></div>
                            <div class="chat-text">今天能帮您些什么?</div>`;
      // defaultContent.innerHTML = `<div class="icon"><img src="${data.iconUrl}" alt="Help Icon" /></div>
      //                                <div class="text">${data.defaultText}</div>`;
      defaultContentGlobal = defaultContent;
      chatBox.appendChild(defaultContent);
    } catch (error) {
      console.error('Failed to fetch default content:', error);
    }
  }

  fetchDefaultContent(getCurrentActiveChatBox());


  document.getElementById('addChat').addEventListener('click', function () {
    // 创建会话ID
    const sessionId = crypto.randomUUID();
    isFirstFlag = true;

    // 如果还没有激活的会话，设置第一个会话为激活状态
    if (getActiveSessionId() === null) {
      // activeSessionId = sessionId;
      setActiveSessionId(sessionId);
    }

    // 更新hear值
    var headTitleDiv = document.querySelector('.head-title');
    var spanElement = headTitleDiv.querySelector('span');
    spanElement.textContent = '新建聊天';

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
    setActiveSessionId(sessionId);
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
    chatBox.style.display = 'none'; // 默认不显示，除非是第一个会话
    document.getElementById('chat-areas-container').appendChild(chatBox);
    setCurrentActiveChatBox(chatBox);
    fetchDefaultContent(getCurrentActiveChatBox());

    // 如果是第一个会话，立即显示它
    if (sessionId === getActiveSessionId()) {
      // console.log("第一个会话，显示");
      chatBox.style.display = 'block';
    }

    // 注册点击会话标题的事件
    sessionTitle.addEventListener('click', function () {
      // 更新Head标题
      var headTitleDiv = document.querySelector('.head-title');
      var spanElement = headTitleDiv.querySelector('span');
      spanElement.textContent = titleTextSpan.textContent;
      // 获取点击的会话ID
      const selectedSessionId = this.getAttribute('data-session-id');
      const chatContainer = document.getElementById("chat-container");
      const newContainer = document.getElementById("new-container");
      chatContainer.style.display = 'block';
      newContainer.style.display = 'none';
      // activeSessionId = selectedSessionId;
      setActiveSessionId(selectedSessionId);
      globalSessionTitle = sessionTitle;
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
      scrollChat();
    });

    sessionTitle.click();
  });

  // 注册点击会话标题的事件
  sessionTitle.addEventListener('click', function () {
    var headTitleDiv = document.querySelector('.head-title');
    var spanElement = headTitleDiv.querySelector('span');
    spanElement.textContent = titleTextSpan.textContent;
    // 获取点击的会话ID
    const selectedSessionId = this.getAttribute('data-session-id');
    const chatContainer = document.getElementById("chat-container");
    const newContainer = document.getElementById("new-container");
    chatContainer.style.display = 'block';
    newContainer.style.display = 'none';
    setActiveSessionId(selectedSessionId);
    globalSessionTitle = sessionTitle;
    // 隐藏所有聊天区域
    const allChats = document.querySelectorAll('.chat-box');
    allChats.forEach(chat => chat.style.display = 'none');

    // 显示点击的会话对应的聊天区域
    // console.log("标题点击事件:", selectedSessionId);
    const activeChatBox = document.getElementById('chat_' + selectedSessionId);
    activeChatBox.style.display = 'block';
    currentActiveChatBox = activeChatBox;
  });


  debugIcon.addEventListener('click', function () {
    codePython.classList.add('open');
  });

  toggleCode.addEventListener('click', function () {
    codePython.classList.remove('open');
  });

  /**
   * 滚轮监控
   */

  // 创建按钮元素
  function scrollChat() {
    let scrollButton = document.createElement('button');
    scrollButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
        class="icon-md m-1 text-token-text-primary">
        <path fill="currentColor" fill-rule="evenodd"
        d="M12 21a1 1 0 0 1-.707-.293l-7-7a1 1 0 1 1 1.414-1.414L11 17.586V4a1 1 0 1 1 2 0v13.586l5.293-5.293a1 1 0 0 1 1.414 1.414l-7 7A1 1 0 0 1 12 21"
        clip-rule="evenodd"></path>
    </svg>`;
    scrollButton.classList.add('cursor-pointer', 'absolute', 'z-10', 'rounded-full', 'bg-clip-padding', 'border', 'text-token-text-secondary', 'border-token-border-light', 'right-1/2', 'juice:translate-x-1/2', 'bg-token-main-surface-primary', 'bottom-5');
    scrollButton.style.display = 'none';
    const inputArea = document.querySelector('.input-area');
    const rect = inputArea.getBoundingClientRect();
    scrollButton.style.bottom = `${window.innerHeight - rect.top + 20}px`;;
    // 添加按钮到容器
    const chatBox = getCurrentActiveChatBox();
    const chatContent = document.getElementById('chat-content');
    chatBox.appendChild(scrollButton);

    // 按钮点击事件：滚动到chat-content的底部
    scrollButton.addEventListener('click', function () {
      chatContent.scrollTop = chatBox.scrollHeight;
    });

    // 检测滚动条位置，以判断是否显示按钮
    chatContent.addEventListener('scroll', function () {
      // console.log('scrool', chatContent.scrollHeight);
      // console.log('chatContent', chatContent.scrollTop);
      // console.log('chatBox', chatContent.clientHeight);
      const isAtBottom = chatContent.scrollHeight - (chatContent.scrollTop + chatContent.clientHeight) < 1;
      scrollButton.style.display = isAtBottom ? 'none' : 'block';
    });
  }

  scrollChat();



  /**
   * 移动元素
   */

  let isDragging = false;
  let offsetX, offsetY;


  codePython.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - codePython.getBoundingClientRect().left;
    offsetY = e.clientY - codePython.getBoundingClientRect().top;
    codePython.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      codePython.style.left = e.clientX - offsetX + 'px';
      codePython.style.top = e.clientY - offsetY + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    codePython.style.cursor = 'move';
  });





  toggleButton.addEventListener('click', function () {
    var isCollapsed = sidebar.classList.contains('sidebar-collapsed');
    isRightArrow = !isRightArrow;
    console.log("isCollapsed", isCollapsed);
    if (isRightArrow) {
      // 应用向右的箭头样式
      toggleButton.classList.add('right-arrow');
    } else {
      toggleButton.classList.remove('right-arrow');
    }
    if (isCollapsed) {
      sidebar.classList.remove('sidebar-collapsed');
      chatContainer.classList.remove('chat-container-full');
      chatContainer.style.transition = `translateY(0.15rem) rotate(0deg) translateZ(0px)`;
      chatContainer.style.width = `calc(100% - 300px)`;
    } else {
      sidebar.classList.add('sidebar-collapsed');
      chatContainer.classList.add('chat-container-full');
      chatContainer.style.marginLeft = "0";
    }
  });

  //let selectedFile;
  let cursorElement = null;
  // 初始化textarea高度
  messageInput.style.height = `${messageInput.scrollHeight}px`;


  messageInput.addEventListener('input', function () {
    this.style.height = 'auto';
    // messageInput.style.height = messageInput.scrollHeight + 'px';
    var maxHeight = 600;
    this.style.height = Math.min(this.scrollHeight, maxHeight) + 'px';
  });

  document.getElementById("dropbtn").addEventListener("mouseover", function () {
    var button = document.getElementById("dropbtn");
    var text = button.getAttribute("data-text");
    console.log("data-text:", text);
    button.textContent = text;
  });
  document.getElementById("dropbtn").addEventListener("mouseout", function () {
    var button = document.getElementById("dropbtn");
    button.innerHTML = '';
    // if (dropbtn.getAttribute("data-text") === "gpt-4-vision-preview") {
    //   uploadbtn.style.display = "inline-block"; // 显示上传按钮
    // } else {
    //   uploadbtn.style.display = "none";
    // }
    button.appendChild(document.createElement("img")).src = "./svg/robot.svg";
  });
  document.getElementById('uploadbtn').addEventListener('click', function () {
    document.getElementById('fileInput').click();
  });

  // document.getElementById('fileInput').addEventListener('change', function (event) {
  //   selectedFile = event.target.files[0];
  // });


  document.addEventListener('click', function (e) {
    // console.log("点击事件:", e);
    // console.log(e.target.alt);
    // console.log("tagname:", e.target.tagName);
    if (e.target.tagName === "IMG" && !e.target.alt.includes("icon") && !e.target.alt.includes("GPT")) {
      // console.log("点击图片:");
      modal.style.display = "block";
      modalImg.src = e.target.src;
      // e.stopPropagation()
    }
    // 如果点击的地方不是菜单或三点图标，则关闭菜单
    if (!event.target.closest('.session-title') && !event.target.closest('#menu')) {
      document.getElementById('menu').style.display = 'none';
      document.getElementById('login-menu').style.display = 'none';
    }
    if (!event.target.closest('login-menu')) {
      document.getElementById('login-menu').style.display = 'none';
    }
    if (!event.target.closest('result-item')) {
      document.getElementById('results-container').style.display = 'none';
    }
    const modalContainer = document.getElementById('modalContainer');
    if (event.target === modalContainer) {
      modalContainer.style.display = 'none';
    }
  });

  closeModal.onclick = function () {
    modal.style.display = "none";
  }

  modal.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  }

  // 填充模型到下拉菜单
  models.forEach(model => {
    const modelDiv = document.createElement("div");
    modelDiv.textContent = model;
    modelDiv.addEventListener("click", function () {
      document.getElementById("dropbtn").setAttribute("data-text", model);
      document.getElementById("dropbtn").textContent = model;
      dropdownContent.classList.remove("show");
      var modelSelect = document.getElementById("model-select");
      for (var i = 0; i < modelSelect.options.length; i++) {
        if (modelSelect.options[i].text === model) {
          modelSelect.selectedIndex = i;
          break;
        }
      }
    });
    dropdownContent.appendChild(modelDiv);
  });

  // 点击下拉按钮时切换下拉内容的显示状态
  document.getElementById("dropbtn").addEventListener("click", function () {
    dropdownContent.classList.toggle("show");
  });

  // 点击下拉内容以外的地方时隐藏下拉内容
  window.onclick = function (event) {
    if (!event.target.matches('#dropbtn')) {
      if (dropdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
      }
    }
  }
  // 获取当前时间
  function getCurrentTimeString() {
    const now = new Date();
    return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + "-" +
      now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
  }


  /**
   * 光标跟随模块
   * 
   **/
  function getLastTextNode(dom) {
    const children = dom.childNodes;
    for (let i = children.length - 1; i >= 0; i--) {
      const node = children[i];
      //console.log("node:", node.nodeValue);
      if ((node.nodeValue != "mhchat" && node.nodeValue != "provided by ") && node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() != "") {
        //console.log("TEXT_NODE:", node.nodeValue);
        return node;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        console.log("ELEMENT_NODE:", node.nodeType);
        const last = getLastTextNode(node);
        if (last) {
          return last;
        }
      }
    }
    return null;
  }

  /**
   * 更新光标位置
   * @param {*} messageElement 
   */
  function updateCursorPosition(messageElement) {
    const lastText = getLastTextNode(messageElement);
    //console.log("lastTet", lastText);
    const textNode = document.createTextNode("\u200b");
    if (lastText) {
      lastText.parentElement.appendChild(textNode);
    } else {
      messageElement.appendChild(textNode);
    }
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 0);
    const rect = range.getBoundingClientRect();
    //console.log("rect:", rect);
    const chatRect = chatBox.getBoundingClientRect();
    if (rect.top <= (chatRect.bottom - rect.height)) {
      // 在可见范围内，更新光标位置
      cursor.style.left = `${rect.left}px`;
      cursor.style.top = `${rect.top}px`;
      cursor.style.display = 'block';
    } else {
      // 已滚动到输入区域下方，隐藏光标
      cursor.style.display = 'none';
    }
    textNode.remove();
  }

  // 监听滚动事件来修正光标位置
  // chatBox.addEventListener('scroll', function () {
  //   updateCursorPosition(cursorElement);
  // });

  let cursor = document.createElement('div');
  cursor.classList.add('cursor');
  cursor.style.display = 'none';
  document.body.appendChild(cursor);

  let controller = null;

  function errorMessage(chatBoxOne, errorMessageText, parentElement, receiveMEssageElement, messageId) {
    const codeElement = document.createElement("div");
    codeElement.classList.add("message", "code-container");
    const codeBlock = document.createElement("code");
    codeBlock.className = `language-json`;
    codeBlock.textContent = errorMessageText;
    const preElement = document.createElement("pre");
    preElement.appendChild(codeBlock);
    codeElement.appendChild(preElement);
    Prism.highlightElement(codeBlock);
    parentElement.appendChild(codeElement);
    receiveMEssageElement.appendChild(parentElement);
    if (messageId) {
      chatBoxOne.setAttribute("message-id", messageId);
      receiveMEssageElement.setAttribute("message-id", messageId)
    } else {
      const messageId = crypto.randomUUID();
      chatBoxOne.setAttribute("message-id", messageId);
      receiveMEssageElement.setAttribute("message-id", messageId)
    }
    chatBoxOne.appendChild(receiveMEssageElement);
    chatBoxOne.scrollTop = chatBoxOne.scrollHeight;
  }
  function createAvatarAndUserName({ isUser, name = "ChatGPT", imgPath }) {
    // 创建头像和用户名容器
    // const avatarContainer = document.createElement("div");
    // avatarContainer.classList.add(isUser ? "avatar-and-username-container" : "avatar-system-container");
    // avatarContainer.classList.add("avatar-system-container");

    // 创建用户名元素
    // const usernameElement = document.createElement("div");
    // usernameElement.textContent = isUser ? "您" : name; // 设置用户名
    // usernameElement.classList.add(isUser ? "username" : "system-name");

    // 创建头像元素
    // const avatarElement = document.createElement("img");
    // avatarElement.src = imgPath; // 设置头像图片地址
    // avatarElement.classList.add(isUser ? "avatar-image" : "system-image");
    // avatarElement.classList.add("bg-token-main-surface-secondary");
    // avatarElement.alt = "icon";

    // 将用户名和头像添加到头像容器
    // avatarContainer.appendChild(avatarElement);
    // avatarContainer.appendChild(usernameElement);
    // if (isUser) {
    //   avatarContainer.appendChild(usernameElement);
    //   avatarContainer.appendChild(avatarElement);
    // } else {

    // }
    // 创建顶级 div 元素
    const topDiv = document.createElement('div');
    topDiv.className = 'pt-0.5 juice:pt-0';

    // 创建 gizmo-bot-avatar div 元素
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'gizmo-bot-avatar flex h-8 w-8 items-center justify-center overflow-hidden rounded-full juice:h-8 juice:w-8';

    // 创建内部 div 元素
    const innerDiv = document.createElement('div');
    innerDiv.className = 'relative p-1 rounded-sm flex items-center justify-center bg-token-main-surface-primary text-token-text-primary h-8 w-8';

    // 创建 SVG 元素
    let svg;
    if (isUser) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('t', '1716598422668');
      svg.setAttribute('class', 'icon');
      svg.setAttribute('viewBox', '0 0 1024 1024');
      svg.setAttribute('version', '1.1');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('p-id', '15779');
      svg.setAttribute('width', '41');
      svg.setAttribute('height', '41');

      // 创建 path 元素
      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttribute('d', 'M512.06 515.95m-448.95 0a448.95 448.95 0 1 0 897.9 0 448.95 448.95 0 1 0-897.9 0Z');
      path1.setAttribute('fill', '#FFA000');
      path1.setAttribute('p-id', '15780');

      const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path2.setAttribute('d', 'M337.47 715.49h349.18c0-88.1-71.79-149.64-174.59-149.64s-174.59 61.54-174.59 149.64z m374.12 25H312.53v-49.94c0-62.36 82.05-149.65 199.53-149.65s199.53 87.29 199.53 149.65z');
      path2.setAttribute('fill', '#FFFFFF');
      path2.setAttribute('p-id', '15781');

      const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path3.setAttribute('d', 'M512.06 516a124.71 124.71 0 1 1 124.7-124.71A124.86 124.86 0 0 1 512.06 516z m0-224.47a99.77 99.77 0 1 0 99.76 99.76 99.88 99.88 0 0 0-99.76-99.81zM512.06 738.52L461 602.39l31.05-59h40l31.06 59zM488.29 604.1l23.77 63.4 23.77-63.4L517 568.32h-9.89z');
      path3.setAttribute('fill', '#FFFFFF');
      path3.setAttribute('p-id', '15782');

      // 组装 SVG 结构
      svg.appendChild(path1);
      svg.appendChild(path2);
      svg.appendChild(path3);
    } else {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '41');
      svg.setAttribute('height', '41');
      svg.setAttribute('viewBox', '0 0 41 41');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('class', 'icon-md');
      svg.setAttribute('role', 'img');

      // 创建 text 元素
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '-9999');
      text.setAttribute('y', '-9999');
      text.textContent = 'ChatGPT';

      // 创建 path 元素
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z');
      path.setAttribute('fill', 'currentColor');

      // 组装 SVG 结构
      svg.appendChild(text);
      svg.appendChild(path);
    }

    // 将 SVG 添加到内部 div
    innerDiv.appendChild(svg);

    // 将内部 div 添加到 avatar div
    avatarDiv.appendChild(innerDiv);

    // 将 avatar div 添加到顶级 div
    topDiv.appendChild(avatarDiv);

    return topDiv;
  }
  // 发起文本请求
  async function postMessageAndHandleResponse(url, formData, chatBoxset, timeout = 120000) {
    // 初始化消息容器，包含头像、用户名和加载动画
    let isCodeBlock = false;
    const receiveMessageContainer = document.createElement("div");
    const avatarContainer = createAvatarAndUserName({ isUser: false, imgPath: systemPath });
    receiveMessageContainer.appendChild(avatarContainer);

    receiveMessageContainer.classList.add("receive-message-container");
    const replyElement = document.createElement("div");
    replyElement.classList.add("border-style");
    const spinnerElement = document.createElement("div");
    spinnerElement.classList.add("spinner");
    const chatBoxOne = chatBoxset;
    replyElement.appendChild(spinnerElement);
    receiveMessageContainer.appendChild(replyElement);
    chatBoxOne.appendChild(receiveMessageContainer);
    const chatContent = document.getElementById('chat-content');
    chatContent.scrollTop = chatBoxOne.scrollHeight;
    const formDataMessageJson = formData.get('messageJson');
    const parsedMessageRe = JSON.parse(formDataMessageJson);
    const content = parsedMessageRe.content;
    // console.log(chatBoxOne);
    // 设置超时逻辑
    const timeoutId = setTimeout(() => {
      // const replyElement = document.createElement("div");
      // replyElement.classList.add("border-style");
      controller.abort();
      sendButton.style.backgroundImage = '';
      sendButton.innerText = '发送';
      isSend = false;
      spinnerElement.remove();
      // const receiveMessageContainer = document.createElement("div");
      // receiveMessageContainer.classList.add("receive-message-container");
      replyElement.classList.add(!isCodeBlock ? "code-container" : "received");
      const errorMessageText = "{'请求超时，请重试!!'}";
      cursor.style.display = 'none';
      errorMessage(chatBoxOne, errorMessageText, replyElement, receiveMessageContainer);
    }, timeout);
    controller && controller.abort();
    controller = new AbortController();
    const model = parsedMessageRe.model;
    try {
      let resp;
      if (isOnlyWeb) {
        if (loadFromLocalStorage(API_KEY) === null || loadFromLocalStorage(API_URL) === null) {
          sendButton.style.backgroundImage = '';
          sendButton.innerText = '发送';
          isSend = false;
          spinnerElement.remove();
          cursor.style.display = 'none';
          errorMessage(chatBoxOne, '请输入apiUrl或者key', replyElement, receiveMessageContainer);
          return;
        }

        const data = JSON.stringify({
          "model": model,
          "messages": [
            {
              "role": "system",
              "content": "你是一个经过优秀训练并且具备思考能力的人工智能大模型，你会积极的、主动的、引导性的、耐心的回答用户的问题"
            },
            {
              "role": "user",
              "content": content
            }
          ],
          "stream": true,
          "temperature": globalModeSettings.tempertaure,
          "top_p": globalModeSettings.topP,
          "max_tokens": globalModeSettings.maxTokens
        });
        resp = await postMessage({
          authToken: loadFromLocalStorage(API_KEY),
          data: data,
          url: `${loadFromLocalStorage(API_URL)}/v1/chat/completions`,
          controller: controller
        });
      } else {
        resp = await fetch(url, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${getCookie(AUTH_TOKEN)}`
          },
          signal: controller.signal
        });
      }


      clearTimeout(timeoutId);



      console.log("请求的模型:", model);
      if (model === "GPT4 Turbo" || model === "Claude 3 (Opus)") {
        const response = await resp.text();
        console.log("非流式回复:", response);
        const parts = response.split(/(```)/);
        let isCodeBlock = false;
        let partNumber = 0;
        const replyElement = document.createElement("div");
        let replyBakElement = document.createElement("div");
        let codeElement = document.createElement("div");
        replyElement.classList.add("message", isCodeBlock ? "code-container" : "received");
        parts.forEach(part => {
          if (part === '```') {
            isCodeBlock = !isCodeBlock;
            return;
          }

          if (isCodeBlock) {
            partNumber += 1;
            const lines = part.split('\n');
            const codeType = lines[0];
            const codeContent = lines.slice(1).join('\n');
            console.log("codeType:" + codeType);
            codeElement = document.createElement("div");
            codeElement.classList.add("message", isCodeBlock ? "code-container" : "received");
            const codeBlock = document.createElement("code");
            codeBlock.className = `language-${codeType}`;
            codeBlock.textContent = codeContent;
            const preElement = document.createElement("pre");
            preElement.appendChild(codeBlock);
            codeElement.appendChild(preElement);
            Prism.highlightElement(codeBlock);
            replyElement.appendChild(codeElement);
            chatBoxOne.appendChild(replyElement);
            // 在这里调用Prism.highlightElement   
          } else {
            partNumber += 1;
            const message = marked.parse(part);
            if (partNumber >= 2) {
              replyBakElement = document.createElement("div");
              replyBakElement.innerHTML = message;
              replyElement.appendChild(replyBakElement);
              chatBoxOne.appendChild(replyElement);
            } else {
              replyElement.innerHTML = message;
              chatBoxOne.appendChild(replyElement);
            }

          }
          chatBoxOne.appendChild(replyElement);
          replyElement.dataset.message = content;
          replyElement.setAttribute("data-text", a);
          createIcon(replyElement, receiveMessageContainer, chatBoxOne, a);
          // createMyLogo(replyElement, receiveMessageContainer, chatBoxOne);
        });
        partNumber = 0;
        chatBoxOne.scrollTop = chatBoxOne.scrollHeight;
        cursor.style.display = 'none';
        sendButton.style.backgroundImage = '';
        sendButton.innerText = '发送';
        isSend = false;
      } else {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder('utf-8');


        let accumulatedText = '';
        let a = '';
        let c = '';
        let b = '';
        let pos;
        let codeCount = 0;
        let codeType = "";
        let message = "";

        const lastContent = content || '';
        let codeElement = document.createElement("div");
        let replyBakElement = document.createElement("div");
        let codeBlock = document.createElement("code");
        let preElement = document.createElement("pre");


        console.log("id:", chatBoxOne.getAttribute("id"));
        // let o = 0;
        while (true) {
          const { done, value } = await reader.read();
          spinnerElement.remove();
          replyElement.classList.add(isCodeBlock ? "code-container" : "received");
          if (done) {
            console.log('a:', a);
            console.log('c:', c);
            replyElement.dataset.message = lastContent;
            replyElement.setAttribute("data-text", a);
            createIcon(replyElement, receiveMessageContainer, chatBoxOne, a);
            // createMyLogo(replyElement, receiveMessageContainer, chatBoxOne);
            chatContent.scrollTop = chatBoxOne.scrollHeight;
            cursor.style.display = 'none';
            sendButton.style.backgroundImage = '';
            sendButton.innerText = '发送';
            isSend = false;
            break;
          }

          const textChunk = decoder.decode(value);
          // console.log('textChunk:', textChunk);
          accumulatedText += textChunk;
          // 每个消息以两个换行符结尾
          while ((pos = accumulatedText.indexOf("\n\n")) !== -1) {
            message = accumulatedText.substring(0, pos).trim();
            accumulatedText = accumulatedText.substring(pos + 2);
            // console.log('message更新前:', message);
            if (isOnlyWeb) {
              // console.log('accumulatedText更新后:', accumulatedText);
              if (message === '[DONE]') break;
              if (message.startsWith('data:')) {
                // const messageText = message.substring('data:'.length).trim();
                // console.log('messageText:', messageText);
                const messageJson = JSON.parse(message.replace("data: ", "").trim());
                // console.log('messageJsonss:', messageJson);
                if (Object.keys(messageJson.choices[0].delta).length === 0) {
                  break;
                }
                const [{ delta: { content } = {} } = {}] = messageJson.choices || [];
                if (!content) {
                  continue;
                }
                message = content;
              } else {
                continue;
              }

            }
            //console.log('message:', message);
            if (message.startsWith("error:")) {
              // 提取 "error:" 之后的部分
              const errorMessageText = message.substring("error:".length).trim();
              try {
                // 将 errorMessageText 转换为 JSON 对象
                const errorJson = JSON.parse(errorMessageText);

                // 提取 messageId 的值
                const messageId = errorJson.messageId;
                console.log('parentId:', messageId);

                // 删除 parentId 字段
                delete errorJson.messageId;

                // 将修改后的 JSON 对象转换回字符串
                const cleanedErrorMessageText = JSON.stringify(errorJson);
                cursor.style.display = 'none';
                console.log('cleanedErrorMessageText:', cleanedErrorMessageText);
                errorMessage(chatBoxOne, cleanedErrorMessageText, replyElement, receiveMessageContainer, messageId);
                return;
              } catch (error) {
                cursor.style.display = 'none';
                console.error('Failed to parse JSON:', error);
                sendButton.style.backgroundImage = '';
                sendButton.innerText = '发送';
                isSend = false;
                errorMessage(chatBoxOne, 'Failed to parse JSON', replyElement, receiveMessageContainer);
                return;
              }

            }
            // accumulatedText = accumulatedText.substring(pos + 2);

            message = message.replace(/\\s/g, ' ').replace(/\\n/g, '\n');

            if (message.startsWith('data:')) {
              const messageText = message.substring('data:'.length).trim();
              const messageJson = JSON.parse(messageText);
              console.log('messageJson:', messageJson);
              const messageId = messageJson.messageId;
              chatBoxOne.setAttribute("message-id", messageId);
              if (messageJson.conversationId) {
                const conversationId = messageJson.conversationId;
                setActiveSessionId(conversationId);
                globalSessionTitle.setAttribute('data-session-id', conversationId);
                // const url = `${globalModeSettings.webProxyUrl}/backend-api/conversation/gen_title/${conversationId}`;
                // const payloadString = '{"message_id": "' + messageId + '"}';
                const titleVo = {
                  messageId: messageId,
                  conversationId: conversationId,
                  isFirstFlag: true,
                  apiKey: globalModeSettings.accessToken,
                  baseUrl: globalModeSettings.webProxyUrl,
                  isWeb: true
                };
                try {
                  const data = await postResults(`${baseUrl}/api/gen_title`, getCookie(AUTH_TOKEN), titleVo);
                  const existingTitleTextSpan = globalSessionTitle.querySelector('#title-text');
                  if (existingTitleTextSpan) {
                    isFirstFlag = false;
                    const typingSpeed = 100;
                    existingTitleTextSpan.textContent = '';
                    typeWriter(existingTitleTextSpan, data.data, typingSpeed);
                    var headTitleDiv = document.querySelector('.head-title');
                    var spanElement = headTitleDiv.querySelector('span');
                    spanElement.textContent = '';
                    typeWriter(spanElement, filteredMessage, 100);
                  }
                } catch (error) {
                  isFirstFlag = true;
                  console.error('web标题生成异常', error);
                }
              }
              // 检查元素数量是否为 1
              if (messageJson.isFirstFlag) {
                console.log('glabalModelSettoong', globalModeSettings);
                const apiKey = globalModeSettings.apiKey;
                const url = globalModeSettings.baseUrl;
                console.log(apiKey);
                const titleVo = {
                  messageId: messageId,
                  conversationId: getActiveSessionId(),
                  isFirstFlag: messageJson.isFirstFlag,
                  apiKey: apiKey,
                  baseUrl: url,
                  isWeb: false,
                  content: a
                };
                try {
                  const data = await postResults(`${baseUrl}/api/gen_title`, getCookie(AUTH_TOKEN), titleVo);
                  const existingTitleTextSpan = globalSessionTitle.querySelector('#title-text');
                  if (existingTitleTextSpan) {
                    isFirstFlag = false;
                    const typingSpeed = 100;
                    existingTitleTextSpan.textContent = '';
                    typeWriter(existingTitleTextSpan, data.data, typingSpeed);
                    var headTitleDiv = document.querySelector('.head-title');
                    var spanElement = headTitleDiv.querySelector('span');
                    spanElement.textContent = '';
                    typeWriter(spanElement, filteredMessage, 100);
                  }
                } catch (error) {
                  isFirstFlag = true;
                  console.error('标题生成异常:', error);
                } finally {
                  receiveMessageContainer.setAttribute('message-id', messageId);
                  break;
                }
              }
              receiveMessageContainer.setAttribute('message-id', messageId);
              break;
            }

            //代码块开始 第一次进入（只有reply已完成）和后续的代码(存在replyBak并且已完成)
            if (message === '```') {
              console.log('message:', message);
              codeCount = 1;
              isCodeBlock = true;
              // console.log("isCode Change:" + isCodeBlock + ",count:" + codeCount);
              codeElement.dataset.message = lastContent;
              codeElement = document.createElement("div");
              codeBlock = document.createElement("code");
              preElement = document.createElement("pre");
              continue;
              //代码块结束
            } else if ((message === '``' || message === '`') && codeCount === 2) {
              console.log('message:', message);
              isCodeBlock = false;
              codeCount = 3;
              continue;
            } else if (codeCount === 1) {
              console.log('message:', message);
              codeCount = 2;
              // console.log('code Type message1:', message);
              codeType = message;
              codeElement.classList.add(isCodeBlock ? "code-container" : "received");
              codeBlock.className = `language-${codeType}`;
              codeBlock.classList.add("match-braces");
            } else if (codeCount === 2) {
              console.log('message:', message);
              codeBlock.textContent += message;
              preElement.appendChild(codeBlock);
              codeElement.appendChild(preElement);
              // 在这里调用Prism.highlightElement处理代码高亮
              updateCursorPosition(codeElement);
              Prism.highlightElement(codeBlock);
              // 将处理完成的replyElement添加到消息框
              replyElement.remove();
              replyElement.appendChild(codeElement);
              receiveMessageContainer.appendChild(replyElement);
              chatBoxOne.appendChild(receiveMessageContainer);
            }

            if (isCodeBlock) {
              c += message;
            } else {
              a += message;
              // 代码块结束后，又是一个新的文本容器
              if (codeCount === 3) {
                b = '';
                replyBakElement = document.createElement("div");

                codeCount = 4;
                continue;
              } else if (codeCount === 4) {
                b += message;
                replyBakElement.classList.add("message", isCodeBlock ? "code-container" : "received");
                const reply = marked.parse(b);
                replyBakElement.innerHTML = reply;
                replyElement.appendChild(replyBakElement);
                receiveMessageContainer.appendChild(replyElement);
                updateCursorPosition(replyBakElement);
                chatBoxOne.appendChild(receiveMessageContainer);
              } else {
                // replyElement.classList.add("message", isCodeBlock ? "code-container" : "received");
                const b = marked.parse(a);
                replyElement.innerHTML = b;
                //lastTextNode = getLastTextNode(replyElement);
                cursorElement = replyElement;
                if (message != "消息不能为空") {
                  updateCursorPosition(replyElement);
                }
                receiveMessageContainer.appendChild(replyElement);
                chatBoxOne.appendChild(receiveMessageContainer);
              }
            }
            chatContent.scrollTop = chatBoxOne.scrollHeight;
          }
        }
      }
    } catch (error) {
      console.log('请求发送失败', error);
      cursor.style.display = 'none';
      sendButton.style.backgroundImage = '';
      sendButton.innerText = '发送';
      isSend = false;
      clearTimeout(timeoutId);
      controller.abort();
      spinnerElement.remove();
      const receiveMessageContainer = document.createElement("div");
      receiveMessageContainer.classList.add("receive-message-container");
      const errorMessageText = "{'请求异常，请重试!!'}";
      errorMessage(chatBoxOne, errorMessageText, replyElement, receiveMessageContainer);
    }
  }

  function typeWriter(element, text, speed) {
    let index = 0;
    function type() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  /**
   * 文本转语音
   * @param {*} message 
   * @param {*} selectVoice 
   * @param {*} vocieButton 
   */
  async function audioMessage(message, selectVoice, vocieButton) {
    try {
      vocieButton.querySelector('.voice').classList.add('loading');
      vocieButton.querySelector('.voice').innerHTML = '';
      let raw, url, auth_token;

      const formData = new FormData();
      // console.log('message', message);
      formData.append("message", message);
      formData.append("selectVoice", selectVoice);
      if (isOnlyWeb) {
        url = `${audioUrl}/v1/audio/speech`;
        auth_token = audioKey;
        raw = JSON.stringify({
          "model": "tts-1",
          "input": message,
          "voice": selectVoice,
          "response_format": "opus"
        });
      } else {
        url = `${baseUrl}/api/audio`;
        auth_token = getCookie(AUTH_TOKEN);
      }

      const audioUrls = await postAudiceResults(url, auth_token, isOnlyWeb ? raw : formData);
      // const audioUrl = URL.createObjectURL(audiceBlob);
      const audio = new Audio(audioUrls);
      audio.play();
    } catch (error) {
      showAlert('音频获取失败: ' + error, false);
    } finally {
      // const loadingElement = vocieButton.getElementById('voice');
      // loadingElement.classList.remove('loading');
      vocieButton.innerHTML = `
    <span class="flex h-[30px] w-[30px] items-center justify-center voice">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z" fill="currentColor">
      </svg>
    </span>
  `;
    }
  }

  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 图片生成
  async function imageGeaeration(url, formData, chatBoxset) {
    const receiveMessageContainer = document.createElement("div");
    const avatarContainer = createAvatarAndUserName({ isUser: false, imgPath: systemPath });
    receiveMessageContainer.appendChild(avatarContainer);

    receiveMessageContainer.classList.add("receive-message-container");
    const replyElement = document.createElement("div");
    replyElement.classList.add("border-style");
    const spinnerElement = document.createElement("div");
    spinnerElement.classList.add("spinner");
    const chatBoxOne = chatBoxset;
    replyElement.appendChild(spinnerElement);
    receiveMessageContainer.appendChild(replyElement);
    chatBoxOne.appendChild(receiveMessageContainer);
    const chatContent = document.getElementById('chat-content');
    chatContent.scrollTop = chatBoxOne.scrollHeight;
    const formDataMessageJson = formData.get('messageJson');
    const parsedMessageRe = JSON.parse(formDataMessageJson);
    const lastContent = parsedMessageRe.content;
    try {
      let imageSrc;
      let promot;
      if (isOnlyWeb) {
        const data = JSON.stringify({
          "model": parsedMessageRe.model,
          "prompt": lastContent,
          "n": 1,
          "size": "1024x1024"
        });
        const resp = await postMessage({
          authToken: loadFromLocalStorage(API_KEY),
          data: data,
          url: url
        });
        const textResponse = await resp.json();
        console.log(textResponse);
        imageSrc = textResponse.data[0].url || textResponse.error.message;
        promot = textResponse.data[0].revised_prompt || "";
      } else {
        const resp = await fetch(url, {
          method: 'post',
          headers: {
            'Authorization': `Bearer ${getCookie(AUTH_TOKEN)}`
          },
          body: formData
        });
        imageSrc = await resp.text();
      }

      // const isImageUrl = imageSrc.match(/\.(jpeg|webp|jpg|gif|png|svg)(\?|$)/) != null;
      // console.log('是否是图片:' + isImageUrl)

      if (isValidUrl(imageSrc)) {
        const imgElement = document.createElement("img");
        const imageUrl = await loadImage(imageSrc);
        spinnerElement.remove();
        imgElement.src = imageUrl;
        imgElement.style.maxWidth = "60%";
        replyElement.classList.add("message", "received");
        replyElement.textContent = promot;
        replyElement.dataset.message = lastContent;
        replyElement.setAttribute("data-text", promot);
        // createMyLogo(replyElement, receiveMessageContainer, chatBoxOne);
        replyElement.appendChild(imgElement);
      } else {
        spinnerElement.remove();
        replyElement.classList.add("message", "received");
        // console.log("image message", errorMessage);
        replyElement.dataset.message = lastContent;
        //replyElement.innerHTML = marked.parse(imageSrc);
        const codeBlock = document.createElement("code");
        const preElement = document.createElement("pre");
        codeBlock.className = `language-JSON`;
        codeBlock.textContent = imageSrc;
        preElement.appendChild(codeBlock);
        replyElement.appendChild(preElement);
        Prism.highlightElement(codeBlock);
        // createIcon(replyElement);
      }
      chatContent.scrollTop = chatBoxOne.scrollHeight;
      sendButton.style.backgroundImage = '';
      sendButton.innerText = '发送';
      isSend = false;
      receiveMessageContainer.appendChild(replyElement);
      chatBox.appendChild(receiveMessageContainer);
      createIcon(replyElement, receiveMessageContainer, chatBoxOne, null);
    } catch (error) {
      sendButton.style.backgroundImage = '';
      sendButton.innerText = '发送';
      isSend = false;
      spinnerElement.remove();
      const receiveMessageContainer = document.createElement("div");
      receiveMessageContainer.classList.add("receive-message-container");
      errorMessage(chatBoxOne, error, replyElement, receiveMessageContainer);
    }
    // createMyLogo(replyElement);
  }
  // 标识容器
  // function createMyLogo(messageElement, parentElement, chatBoxOne) {
  //   const providedByText = document.createElement("div");
  //   providedByText.innerHTML = 'provided by <span class="highlight">mhchat</span>';
  //   providedByText.classList.add("provided-by");
  //   messageElement.appendChild(providedByText);
  //   parentElement.appendChild(messageElement);
  //   chatBoxOne.appendChild(parentElement);
  // }

  /**
   * 创建接收消息容器按钮
   * @param {*} messageElement 
   * @param {*} parentElement 
   * @param {*} chatBoxOne 
   * @param {*} message 
   */
  function createIcon(messageElement, parentElement, chatBoxOne, message) {
    const actionsContainer = document.createElement("div");
    actionsContainer.classList.add("message-actions");

    // 创建声音播放按钮
    const vocieButton = document.createElement('button');
    vocieButton.className = 'rounded-lg text-token-text-secondary hover:bg-token-main-surface-secondary';
    vocieButton.innerHTML = `
    <span class="flex h-[30px] w-[30px] items-center justify-center voice">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z" fill="currentColor">
        </path>
      </svg>
    </span>
`;

    vocieButton.onclick = async function () {
      const existingContainer = document.querySelector('.language-select-container');
      if (existingContainer) {
        existingContainer.remove();
        return;
      }

      // 创建选择容器
      const voiceSelectContainer = document.createElement('div');
      voiceSelectContainer.className = 'language-select-container';

      const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
      voices.forEach(voice => {
        const voiceButton = document.createElement('button');
        voiceButton.className = 'language-button';
        voiceButton.textContent = voice;
        voiceButton.onclick = function () {
          const selectVoice = voice.toLowerCase();
          audioMessage(message, selectVoice, vocieButton);
          voiceSelectContainer.remove();
        };
        voiceSelectContainer.appendChild(voiceButton);
      });

      document.body.appendChild(voiceSelectContainer);

      const buttonRect = vocieButton.getBoundingClientRect();
      voiceSelectContainer.style.position = 'absolute';
      voiceSelectContainer.style.top = `${buttonRect.bottom + window.scrollY}px`;
      voiceSelectContainer.style.left = `${buttonRect.left + window.scrollX}px`;
    }


    // 创建复制按钮
    const copyButton = document.createElement('button');
    copyButton.className = 'rounded-lg text-token-text-secondary hover:bg-token-main-surface-secondary';
    copyButton.innerHTML = `
    <span class="flex h-[30px] w-[30px] items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md-heavy">
            <path fill="currentColor" fill-rule="evenodd" d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" clip-rule="evenodd"></path>
        </svg>
    </span>
`;
    copyButton.onclick = function () {
      copyMessageToClipboard(messageElement);
      copyButton.innerHTML = `
        <span class="flex h-[30px] w-[30px] items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md-heavy"><path fill="currentColor" fill-rule="evenodd" d="M18.063 5.674a1 1 0 0 1 .263 1.39l-7.5 11a1 1 0 0 1-1.533.143l-4.5-4.5a1 1 0 1 1 1.414-1.414l3.647 3.647 6.82-10.003a1 1 0 0 1 1.39-.263" clip-rule="evenodd"></path></svg>
        </span>
    `;
      setTimeout(function () {
        copyButton.innerHTML = `
            <span class="flex h-[30px] w-[30px] items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md-heavy">
                    <path fill="currentColor" fill-rule="evenodd" d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" clip-rule="evenodd"></path>
                </svg>
            </span>
        `;
      }, 2000);
    };


    // 创建重发按钮
    // const resendButton = document.createElement("button");
    // resendButton.classList.add("icon-button");
    // resendButton.innerHTML = '<i class="fas fa-redo"></i>';
    // resendButton.onclick = function () { resendMessageContent(messageElement); };
    const resendButton = document.createElement('button');
    resendButton.className = 'rounded-lg text-token-text-secondary hover:bg-token-main-surface-secondary';
    resendButton.innerHTML = `
    <span class="flex h-[30px] w-[30px] items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md-heavy">
            <path fill="currentColor" d="M3.07 10.876C3.623 6.436 7.41 3 12 3a9.15 9.15 0 0 1 6.012 2.254V4a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1H15a1 1 0 1 1 0-2h1.957A7.15 7.15 0 0 0 12 5a7 7 0 0 0-6.946 6.124 1 1 0 1 1-1.984-.248m16.992 1.132a1 1 0 0 1 .868 1.116C20.377 17.564 16.59 21 12 21a9.15 9.15 0 0 1-6-2.244V20a1 1 0 1 1-2 0v-4a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H7.043A7.15 7.15 0 0 0 12 19a7 7 0 0 0 6.946-6.124 1 1 0 0 1 1.116-.868"></path>
        </svg>
    </span>
`;

    resendButton.onclick = function () {
      resendMessageContent(messageElement);
    };

    // 创建翻译按钮
    const traButton = document.createElement('button');
    traButton.className = 'rounded-lg text-token-text-secondary hover:bg-token-main-surface-secondary';
    traButton.innerHTML = `
    <span class="flex h-[30px] w-[30px] items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 1024 1024" class="icon-md-heavy">
    <path fill="currentColor" d="M414.254545 595.781818H172.218182c-86.109091 0-155.927273-67.490909-155.927273-148.945454V218.763636C16.290909 137.309091 86.109091 69.818182 172.218182 69.818182h242.036363c86.109091 0 155.927273 67.490909 155.927273 148.945454v228.072728c-2.327273 81.454545-69.818182 148.945455-155.927273 148.945454zM172.218182 137.309091c-48.872727 0-86.109091 34.909091-86.109091 81.454545v228.072728c0 44.218182 39.563636 81.454545 86.109091 81.454545h242.036363c48.872727 0 86.109091-34.909091 86.109091-81.454545V218.763636c0-44.218182-39.563636-81.454545-86.109091-81.454545H172.218182z" fill="#666666"></path>
    <path fill="currentColor" d="M837.818182 861.090909H595.781818c-90.763636 0-155.927273-69.818182-155.927273-167.563636v-141.963637c0-18.618182 16.290909-34.909091 34.909091-34.909091s34.909091 16.290909 34.909091 34.909091v141.963637c0 58.181818 34.909091 100.072727 86.109091 100.072727H837.818182c48.872727 0 86.109091-34.909091 86.109091-81.454545v-228.072728c0-44.218182-39.563636-81.454545-86.109091-81.454545H544.581818c-18.618182 0-34.909091-16.290909-34.909091-34.909091s16.290909-34.909091 34.909091-34.909091H837.818182c86.109091 0 155.927273 67.490909 155.927273 148.945455v228.072727c0 86.109091-69.818182 151.272727-155.927273 151.272727zM262.981818 847.127273c-102.4 0-183.854545-74.472727-183.854545-167.563637 0-18.618182 16.290909-34.909091 34.909091-34.909091s34.909091 16.290909 34.909091 34.909091c0 55.854545 51.2 100.072727 116.363636 100.072728 18.618182 0 34.909091 16.290909 34.909091 34.909091-4.654545 18.618182-18.618182 32.581818-37.236364 32.581818zM861.090909 281.6c-18.618182 0-34.909091-16.290909-34.909091-34.909091 0-55.854545-51.2-100.072727-116.363636-100.072727-18.618182 0-34.909091-16.290909-34.909091-34.909091s16.290909-34.909091 34.909091-34.909091c102.4 0 183.854545 74.472727 183.854545 167.563636 2.327273 20.945455-11.636364 37.236364-32.581818 37.236364z"></path>
    <path fill="currentColor" d="M660.945455 686.545455h-39.563637l88.436364-165.236364h41.890909l88.436364 165.236364h-41.89091l-23.272727-46.545455h-93.090909l-20.945454 46.545455z m69.818181-139.636364l-37.236363 72.145454H768l-37.236364-72.145454z"></path>
    <path fill="currentColor" d="M286.254545 200.145455h23.272728v39.563636H395.636364V349.090909h-23.272728v-13.963636h-62.836363v76.8h-23.272728v-76.8H223.418182v13.963636h-23.272727v-109.381818h86.10909V200.145455z m-62.836363 116.363636h62.836363v-55.854546H223.418182v55.854546z m86.109091 0H372.363636v-55.854546h-62.836363v55.854546z"></path>
</svg>
    </span>
`;


    traButton.onclick = function () {
      // 检查是否已经存在语言选择容器
      const existingContainer = document.querySelector('.language-select-container');
      if (existingContainer) {
        existingContainer.remove(); // 如果存在，移除它
        return;
      }

      // 创建语言选择容器
      const languageSelectContainer = document.createElement('div');
      languageSelectContainer.className = 'language-select-container';

      const languages = ['中文', '俄语', '英语', '法语', '德语', '日语', '韩语', '西班牙语'];
      languages.forEach(language => {
        const languageButton = document.createElement('button');
        languageButton.className = 'language-button';
        languageButton.textContent = language;
        languageButton.onclick = function () {
          const selectedLanguage = language.toLowerCase();
          const messageContent = messageElement.textContent;
          translateMessage(messageContent, selectedLanguage, chatBoxOne);
          languageSelectContainer.remove();
        };
        languageSelectContainer.appendChild(languageButton);
      });

      document.body.appendChild(languageSelectContainer);

      const buttonRect = traButton.getBoundingClientRect();
      languageSelectContainer.style.position = 'absolute';
      languageSelectContainer.style.top = `${buttonRect.bottom + window.scrollY}px`;
      languageSelectContainer.style.left = `${buttonRect.left + window.scrollX}px`;
    };

    actionsContainer.appendChild(vocieButton);
    actionsContainer.appendChild(copyButton);
    actionsContainer.appendChild(resendButton);
    actionsContainer.appendChild(traButton);
    messageElement.appendChild(actionsContainer);
    parentElement.appendChild(messageElement);
    // chatBoxOne.appendChild(parentElement);
  }


  /**
   * 创建发送消息容器按钮
   * @param {*} params 
   */
  function createSendMessageIcon(params) {
    const {
      messageElement = null,
      parentElement = null,
      chatBox = null,
      messageRe = null,
      globalSetJson = null,
      message = null
    } = params;

    const actionsContainer = document.createElement("div");
    actionsContainer.classList.add("message-send-actions");

    const copyButton = document.createElement('button');
    copyButton.className = 'rounded-lg text-token-text-secondary hover:bg-token-main-surface-secondary';
    copyButton.innerHTML = `
    <span class="flex h-[30px] w-[30px] items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md-heavy">
        <path fill="currentColor" fill-rule="evenodd" d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" clip-rule="evenodd"></path>
      </svg>
    </span>
    `;
    copyButton.onclick = function () {
      copyMessageToClipboard(messageElement);
      copyButton.innerHTML = `
      <span class="flex h-[30px] w-[30px] items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md-heavy"><path fill="currentColor" fill-rule="evenodd" d="M18.063 5.674a1 1 0 0 1 .263 1.39l-7.5 11a1 1 0 0 1-1.533.143l-4.5-4.5a1 1 0 1 1 1.414-1.414l3.647 3.647 6.82-10.003a1 1 0 0 1 1.39-.263" clip-rule="evenodd"></path></svg>
      </span>
      `;
      setTimeout(function () {
        copyButton.innerHTML = `
        <span class="flex h-[30px] w-[30px] items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md-heavy">
                <path fill="currentColor" fill-rule="evenodd" d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" clip-rule="evenodd"></path>
            </svg>
        </span>
    `;
      }, 2000);
    };

    // 创建翻译按钮
    const traButton = document.createElement('button');
    traButton.className = 'rounded-lg text-token-text-secondary hover:bg-token-main-surface-secondary';
    traButton.innerHTML = `
    <span class="flex h-[30px] w-[30px] items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 1024 1024" class="icon-md-heavy">
        <path fill="currentColor" d="M414.254545 595.781818H172.218182c-86.109091 0-155.927273-67.490909-155.927273-148.945454V218.763636C16.290909 137.309091 86.109091 69.818182 172.218182 69.818182h242.036363c86.109091 0 155.927273 67.490909 155.927273 148.945454v228.072728c-2.327273 81.454545-69.818182 148.945455-155.927273 148.945454zM172.218182 137.309091c-48.872727 0-86.109091 34.909091-86.109091 81.454545v228.072728c0 44.218182 39.563636 81.454545 86.109091 81.454545h242.036363c48.872727 0 86.109091-34.909091 86.109091-81.454545V218.763636c0-44.218182-39.563636-81.454545-86.109091-81.454545H172.218182z" fill="#666666"></path>
        <path fill="currentColor" d="M837.818182 861.090909H595.781818c-90.763636 0-155.927273-69.818182-155.927273-167.563636v-141.963637c0-18.618182 16.290909-34.909091 34.909091-34.909091s34.909091 16.290909 34.909091 34.909091v141.963637c0 58.181818 34.909091 100.072727 86.109091 100.072727H837.818182c48.872727 0 86.109091-34.909091 86.109091-81.454545v-228.072728c0-44.218182-39.563636-81.454545-86.109091-81.454545H544.581818c-18.618182 0-34.909091-16.290909-34.909091-34.909091s16.290909-34.909091 34.909091-34.909091H837.818182c86.109091 0 155.927273 67.490909 155.927273 148.945455v228.072727c0 86.109091-69.818182 151.272727-155.927273 151.272727zM262.981818 847.127273c-102.4 0-183.854545-74.472727-183.854545-167.563637 0-18.618182 16.290909-34.909091 34.909091-34.909091s34.909091 16.290909 34.909091 34.909091c0 55.854545 51.2 100.072727 116.363636 100.072728 18.618182 0 34.909091 16.290909 34.909091 34.909091-4.654545 18.618182-18.618182 32.581818-37.236364 32.581818zM861.090909 281.6c-18.618182 0-34.909091-16.290909-34.909091-34.909091 0-55.854545-51.2-100.072727-116.363636-100.072727-18.618182 0-34.909091-16.290909-34.909091-34.909091s16.290909-34.909091 34.909091-34.909091c102.4 0 183.854545 74.472727 183.854545 167.563636 2.327273 20.945455-11.636364 37.236364-32.581818 37.236364z"></path>
        <path fill="currentColor" d="M660.945455 686.545455h-39.563637l88.436364-165.236364h41.890909l88.436364 165.236364h-41.89091l-23.272727-46.545455h-93.090909l-20.945454 46.545455z m69.818181-139.636364l-37.236363 72.145454H768l-37.236364-72.145454z"></path>
        <path fill="currentColor" d="M286.254545 200.145455h23.272728v39.563636H395.636364V349.090909h-23.272728v-13.963636h-62.836363v76.8h-23.272728v-76.8H223.418182v13.963636h-23.272727v-109.381818h86.10909V200.145455z m-62.836363 116.363636h62.836363v-55.854546H223.418182v55.854546z m86.109091 0H372.363636v-55.854546h-62.836363v55.854546z"></path>
      </svg>
    </span>
    `;


    traButton.onclick = function () {
      // 检查是否已经存在语言选择容器
      const existingContainer = document.querySelector('.language-select-container');
      if (existingContainer) {
        existingContainer.remove();
        return;
      }

      // 创建语言选择容器
      const languageSelectContainer = document.createElement('div');
      languageSelectContainer.className = 'language-select-container';

      const languages = ['中文', '俄语', '英语', '法语', '德语', '日语', '韩语', '西班牙语'];
      languages.forEach(language => {
        const languageButton = document.createElement('button');
        languageButton.className = 'language-button';
        languageButton.textContent = language;
        languageButton.onclick = function () {
          const selectedLanguage = language.toLowerCase();
          const messageContent = messageElement.textContent;
          translateMessage(messageContent, selectedLanguage, chatBoxOne);
          languageSelectContainer.remove();
        };
        languageSelectContainer.appendChild(languageButton);
      });

      document.body.appendChild(languageSelectContainer);

      const buttonRect = traButton.getBoundingClientRect();
      languageSelectContainer.style.position = 'absolute';
      languageSelectContainer.style.top = `${buttonRect.bottom + window.scrollY}px`;
      languageSelectContainer.style.left = `${buttonRect.left + window.scrollX}px`;
    };

    const editButton = document.createElement('button');
    editButton.className = 'rounded-lg text-token-text-secondary hover:bg-token-main-surface-secondary';
    editButton.innerHTML = `
    <span class="flex h-[30px] w-[30px] items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 1024 1024" class="icon-md-heavy">
        <path fill="currentColor" d="M752.896 944.6912H267.4176c-98.816 0-179.2-80.384-179.2-179.2V270.9504c0-98.816 80.384-179.2 179.2-179.2h242.176c14.1312 0 25.6 11.4688 25.6 25.6s-11.4688 25.6-25.6 25.6h-242.176c-70.6048 0-128 57.3952-128 128v494.5408c0 70.6048 57.3952 128 128 128h485.4784c70.6048 0 128-57.3952 128-128v-246.6816c0-14.1312 11.4688-25.6 25.6-25.6s25.6 11.4688 25.6 25.6v246.6816c0 98.816-80.384 179.2-179.2 179.2z"></path>
        <path fill="currentColor" d="M439.7056 641.8432a41.5744 41.5744 0 0 1-28.8768-11.6736c-10.8544-10.3424-15.3088-25.2416-11.9296-39.8848l33.5872-145.7152a42.5472 42.5472 0 0 1 11.2128-20.2752l317.6448-317.6448c37.376-37.376 98.2016-37.376 135.5776 0l30.208 30.208c18.1248 18.1248 28.0576 42.1888 28.0576 67.7888s-9.984 49.664-28.0576 67.7888a25.61536 25.61536 0 0 1-36.1984 0 25.61536 25.61536 0 0 1 0-36.1984c8.448-8.448 13.056-19.6608 13.056-31.5904s-4.6592-23.1424-13.056-31.5904l-30.208-30.208c-17.408-17.408-45.7216-17.408-63.1808 0L481.7408 458.6496l-29.5424 128.1536 122.4704-34.304 218.112-218.112a25.61536 25.61536 0 0 1 36.1984 0 25.61536 25.61536 0 0 1 0 36.1984l-219.8016 219.8016c-5.12 5.12-11.4688 8.8064-18.3808 10.752l-139.6224 39.1168c-3.7888 1.0752-7.6288 1.5872-11.4688 1.5872z"></path>
        <path fill="currentColor" d="M854.0672 334.7456c-6.6048 0-13.2608-2.56-18.2784-7.68a25.5744 25.5744 0 0 1 0.3072-36.1984l7.424-7.2704c10.0864-9.9328 26.2656-9.7792 36.1984 0.3072s9.7792 26.3168-0.3072 36.1984l-7.424 7.2704a25.1392 25.1392 0 0 1-17.92 7.3728z"></path>
    </svg>
    <span>
    `;
    editButton.onclick = function (event) {
      messageElement.removeChild(actionsContainer);
      createSendIcon(messageElement, parentElement, chatBox, messageRe, globalSetJson, message);
    };

    actionsContainer.appendChild(copyButton);
    actionsContainer.appendChild(traButton);
    actionsContainer.appendChild(editButton);
    messageElement.appendChild(actionsContainer);
    parentElement.appendChild(messageElement);
    // chatBoxOne.appendChild(parentElement);
  }

  /**
   * 翻译按钮处理函数
   * @param {*} message 
   * @param {*} language 
   * @param {*} chatBoxOne 
   */
  function translateMessage(message, language, chatBoxOne) {
    // console.log(`Translating message: "${message}" to ${language}`);
    const messageId = crypto.randomUUID();
    const selectmodel = document.getElementById("dropbtn").dataset.text;
    const formData = new FormData();
    const messageRe = new Message();
    messageRe.conversationId = getActiveSessionId();
    messageRe.messageId = messageId;
    messageRe.model = selectmodel;
    messageRe.content = `将下述文字翻译成${language}:` + message;
    const globalSetJson = JSON.stringify(globalModeSettings);
    const messageJson = JSON.stringify(messageRe);
    // console.log("globalSetJson", sendMessage);
    formData.append('globalSetJson', globalSetJson);
    formData.append('messageJson', messageJson);
    postMessageAndHandleResponse(`${baseUrl}/api/tran`, formData, chatBoxOne);
  }

  /**
   * 复制按钮处理函数
   * @param {*} messageElement 
   */
  function copyMessageToClipboard(messageElement) {
    // 获取消息文本
    const messageText = messageElement.getAttribute("data-text") ? null : messageElement.textContent.trim();
    // 复制到剪贴板
    // console.log('messageText', messageText);
    navigator.clipboard.writeText(messageText).then(function () {
    }, function (err) {
      alert('复制失败：', err);
    });
  }
  // 重发逻辑
  function resendMessageContent(messageElement) {
    const lastContent = messageElement.dataset.message.trim();
    // console.log("lastContent:" + lastContent);
    sendMessage(lastContent, getCurrentActiveChatBox());
  }
  function appendTextToChat(text) {
    // 使用marked解析Markdown格式的文本
    const htmlContent = marked.parse(text);
    const divElement = document.createElement("div");
    divElement.innerHTML = htmlContent;
    chatBox.appendChild(divElement);
  }

  /**
   * 创建文件展示
   */
  function createFileShow(file, userMessageElement) {

    var container = document.createElement("div");
    container.setAttribute("id", "container2");


    var fileIcon = document.createElement("div");
    fileIcon.setAttribute("id", "fileIcon2");


    var fileIconI = document.createElement("i");
    fileIconI.setAttribute("class", "fa fa-file");
    fileIconI.setAttribute("aria-hidden", "true");


    var fileName = document.createElement("div");
    fileName.setAttribute("id", "fileName2");


    var viewFileIcon = document.createElement("div");
    viewFileIcon.setAttribute("id", "viewFile2");
    viewFileIcon.classList.add("view-file-icon");


    var viewFileI = document.createElement("i");
    viewFileI.setAttribute("class", "fas fa-eye");


    fileIcon.appendChild(fileIconI);


    viewFileIcon.appendChild(viewFileI);


    container.style.display = 'inline-block';
    setTimeout(() => { container.classList.add('visible'); }, 10);
    viewFileIcon.style.display = "inline-block";
    fileIcon.textContent = '📄';
    fileIcon.style.display = 'inline-block';
    fileName.textContent = file.name;
    fileName.style.display = 'inline-block';

    // 将所有创建的元素插入到container div中
    container.appendChild(fileIcon);
    container.appendChild(fileName);
    container.appendChild(viewFileIcon);
    // 插入消息容器
    userMessageElement.appendChild(container);
    var fileText = getFileExplare(file);
    var fileContent = marked.parse(fileText);
    viewFileIcon.onclick = (function (content) {
      return function () {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.getElementById("fileContent").innerHTML = content;
        var fileModal = document.getElementById("fileModal");
        fileModal.style.display = "block";
      };
    })(fileContent);
  }

  /**
   * 发送消息容器编辑按钮
   * @param {*} userMessageElement 
   * @param {*} messageContainer 
   * @param {*} chatBox 
   * @param {*} messageRe 
   * @param {*} globalSetJson 
   * @param {*} oldMessage 
   * @returns 
   */
  function createSendIcon(userMessageElement, messageContainer, chatBox, messageRe, globalSetJson, oldMessage) {
    if (userMessageElement.querySelector(".message-actions")) {
      return;
    }
    userMessageElement.setAttribute('contenteditable', 'true');
    const actionsContainer = document.createElement("div");
    actionsContainer.classList.add("message-actions");

    const resendButton = document.createElement('button');
    resendButton.className = 'rounded-lg text-token-text-secondary hover:bg-token-main-surface-secondary';
    resendButton.innerHTML = `
    <span class="flex h-[30px] w-[30px] items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" class="icon-md-heavy" width="24" height="24">
        <path fill="currentColor" d="M393.7 915c-7.5 0-15-2.4-21.3-7.5L12.8 619.9c-14.7-11.8-17.1-33.3-5.3-48 11.8-14.7 33.3-17.1 48-5.3l333 266.4 574.8-711.4c11.8-14.7 33.3-16.9 48-5.1 14.7 11.8 16.9 33.3 5.1 48L420.2 902.4c-6.7 8.3-16.6 12.6-26.5 12.6z" />
      </svg>
    </span>
`;
    resendButton.onclick = function (event) {
      event.stopPropagation();
      userMessageElement.setAttribute('contenteditable', 'false');
      // 从父元素中移除 actionsContainer
      userMessageElement.removeChild(actionsContainer);
      createSendMessageIcon({
        messageElement: userMessageElement,
        parentElement: messageContainer,
        chatBox: chatBox,
        messageRe: messageRe,
        globalSetJson: globalSetJson,
        message: oldMessage
      })
      const message = userMessageElement.textContent || "";
      messageRe.content = message;
      const parentId = chatBox.getAttribute('message-id');
      // console.log('parent-id', parentId);
      messageRe.parentId = parentId;
      const updatedFormData = new FormData();
      updatedFormData.append('globalSetJson', globalSetJson);
      updatedFormData.append('messageJson', JSON.stringify(messageRe));
      postMessageAndHandleResponse(`${baseUrl}/api/base`, updatedFormData, chatBox);
    };

    const cancelButton = document.createElement('button');
    cancelButton.className = 'rounded-lg text-token-text-secondary hover:bg-token-main-surface-secondary';
    cancelButton.innerHTML = `
    <span class="flex h-[30px] w-[30px] items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" class="icon-md-heavy" width="24" height="24">
        <path fill="currentColor" d="M842.947458 778.116917 576.847937 512.013303 842.946434 245.883083c8.67559-8.674567 13.447267-20.208251 13.43908-32.477692-0.008186-12.232602-4.7727-23.715121-13.414521-32.332383-8.655124-8.677637-20.149922-13.450337-32.384571-13.4575-12.286838 0-23.808242 4.771677-32.474622 13.434987L512.019443 447.143876 245.88206 181.050496c-8.66331-8.66331-20.175505-13.434987-32.416294-13.434987-12.239765 0-23.75196 4.770653-32.414247 13.43294-8.66024 8.636704-13.428847 20.12434-13.437034 32.356942-0.008186 12.269441 4.76349 23.803125 13.437034 32.476669l266.135336 266.13022L181.050496 778.11794c-8.664334 8.66331-13.43601 20.173458-13.43601 32.41527 0 12.239765 4.7727 23.752983 13.437034 32.417317 8.662287 8.66331 20.173458 13.43294 32.413224 13.43294 12.240789 0 23.754007-4.770653 32.416294-13.43294l266.134313-266.100544 266.101567 266.100544c8.66331 8.66331 20.185738 13.43294 32.4429 13.43294 12.265348-0.008186 23.74889-4.771677 32.369222-13.412474C860.81643 825.081555 860.821547 795.991006 842.947458 778.116917z" />
      </svg>
    <span>
`;
    cancelButton.onclick = function (event) {
      event.stopPropagation();
      userMessageElement.setAttribute('contenteditable', 'false');
      if (actionsContainer) {
        console.log("Removing actionsContainer");
        userMessageElement.removeChild(actionsContainer);
        userMessageElement.textContent = oldMessage;
        createSendMessageIcon({
          messageElement: userMessageElement,
          parentElement: messageContainer,
          chatBox: chatBox,
          messageRe: messageRe,
          globalSetJson: globalSetJson,
          message: oldMessage
        })
      } else {
        console.log("actionsContainer not found");
      }
    };

    actionsContainer.appendChild(cancelButton);
    actionsContainer.appendChild(resendButton);
    userMessageElement.appendChild(actionsContainer);
    messageContainer.appendChild(userMessageElement);
    userMessageElement.focus();
  }


  // 发送消息逻辑
  async function sendMessage(lastContent, chatBox) {
    defaultContentGlobal.style.display = 'none';
    // console.log('chatBox', chatBox)
    // 文件解析后的内容
    const messageId = crypto.randomUUID();
    const explare = getFileExplare();
    const uploadFile = getUploadFile();
    const imagePreviewSrc = getImagePreviewSrc();
    // console.log("explare: ", explare);
    // console.log("globalModeSettings.baseUrl:", globalModeSettings.baseUrl);
    resetPreview();
    let message = messageInput.value || ""; // 如果没有输入，则默认为 ""
    //message = lastContent ? lastContent : message;
    const selectmodel = document.getElementById("dropbtn").dataset.text;
    // console.log("消息内容：" + message);
    // console.log("选中的模型:" + selectmodel);
    if (message || message === "") {
      const messageNum = chatBox.childNodes;
      // console.log("消息的数量:", messageNum.length);
      // 只有新创建的会话容器才会自动改变标题
      if (messageNum.length === 0) {
        const chatBoxId = chatBox.getAttribute("id");
        const sessionId = chatBoxId.substring(5);
        const sessionTitle = document.querySelector(`[data-session-id="${sessionId}"]`);
        const sessionTitleSpan = sessionTitle.querySelector(".title-text");
        // 使用正则表达式匹配message中的所有字母和汉字
        const matches = message.match(/[a-zA-Z\u4e00-\u9fa5]/g) || [];
        // 将匹配到的字符数组转换为字符串，并限制长度为前8个字符
        const filteredMessage = matches.slice(0, 8).join('');
        sessionTitleSpan.textContent = filteredMessage;
      }
      // 创建消息容器
      const messageContainer = document.createElement("div");
      // messageContainer.classList.add("message-container");receive-message-container
      messageContainer.classList.add("receive-message-container");
      messageContainer.setAttribute('message-id', messageId);
      const avatarContainer = createAvatarAndUserName({ isUser: true, imgPath: userPath });

      // 创建并添加时间戳
      // const timestampElement = document.createElement("div");
      // timestampElement.textContent = getCurrentTimeString();
      // timestampElement.classList.add("timestamp");
      // messageContainer.appendChild(timestampElement)

      // 将头像容器添加到消息容器的顶部
      messageContainer.appendChild(avatarContainer);
      // 创建实际消息元素
      const userMessageElement = document.createElement("div");
      // console.log("imagePreviewSrc2:", imagePreviewSrc);
      const isImageUrl = imagePreviewSrc != "";

      if (isImageUrl && selectmodel === "gpt-4-vision-preview") {
        // 如果是图片链接，使用<img>标签显示图片
        const imageUrl = imagePreviewSrc;
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.style.maxWidth = "150px";
        userMessageElement.appendChild(imgElement);
      }
      if (explare !== "") {
        // console.log("uploadFile: ", uploadFile);
        createFileShow(uploadFile, userMessageElement);
      }
      //userMessageElement.textContent = message;
      const textElement = document.createElement("div");
      textElement.classList.add("sent-message");
      if (lastContent || lastContent === "") {
        textElement.innerText = lastContent;
      } else {
        textElement.innerText = message;
      }
      userMessageElement.appendChild(textElement);
      userMessageElement.classList.add("message", "received");
      messageContainer.appendChild(userMessageElement);
      const formData = new FormData();
      const messageRe = new Message();
      messageRe.conversationId = getActiveSessionId();
      messageRe.messageId = messageId;
      messageRe.model = selectmodel;
      const gizmo = chatBox.getAttribute('gizmo') || "";
      messageRe.gizmo = gizmo;
      messageRe.contentType = 'text';
      messageRe.isSearch = isSearch;
      if (!chatBox.querySelector('.receive-message-container')) {
        isFirstFlag = true;
        messageRe.firstFlag = isFirstFlag;
      }
      // if (isSearch && isOnlyWeb) {
      //   const data = await search(message, 5);
      //   console.log('搜索: ', data);
      // }
      chatBox.appendChild(messageContainer); //userMessageElement
      const parentId = chatBox.getAttribute('message-id');
      // console.log('parent-id', parentId);
      messageRe.parentId = parentId;
      const file = uploadFile;
      //console.log("selectedFile:", file);
      const sendMessage = JSON.stringify(message);
      if (file) {
        formData.append('file', file);
      }
      if (lastContent || lastContent === "") {
        messageRe.content = lastContent;
      } else {
        messageRe.content = explare + "\n" + sendMessage;
      }
      // formData.append('model', selectmodel);
      const globalSetJson = JSON.stringify(globalModeSettings);
      const messageJson = JSON.stringify(messageRe);
      // console.log("globalSetJson", sendMessage);
      formData.append('globalSetJson', globalSetJson);
      formData.append('messageJson', messageJson);
      //console.log("formData", formData.get("file"));
      if (selectmodel === "dall-e-3" || selectmodel === "midjourney" || selectmodel === "stable-diffusion") {
        imageGeaeration(isOnlyWeb ? `${loadFromLocalStorage(API_URL)}/v1/images/generations` : `${baseUrl}/api/gen`, formData, chatBox);
      } else {
        postMessageAndHandleResponse(`${baseUrl}/api/base`, formData, chatBox);
      }

      // userMessageElement.addEventListener('click', () => {
      //   console.log('修改');
      // });
      createSendMessageIcon({
        messageElement: userMessageElement,
        parentElement: messageContainer,
        chatBox: chatBox,
        messageRe: messageRe,
        globalSetJson: globalSetJson,
        message: message
      });
      userMessageElement.addEventListener('blur', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        userMessageElement.focus();
      });
      messageInput.value = '';
      // 强制触发input事件处理器来重置高度
      messageInput.dispatchEvent(new Event('input'));
      resetPreview();
      setImagePreviewSrc("");
      setUploadFile("");
      chatBox.setAttribute('message-id', messageId);
    }
  }






  seatchBtn.addEventListener("click", function () {
    this.classList.toggle("clicked");
    isSearch = !isSearch;
    if (isSearch) {
      showAlert('联网已开启！', true);
    } else {
      showAlert('联网已关闭！', true);
    }

    // 获取输入框的值
  });

  // /**
  // * 搜索
  // * @param {*} value 
  // * @param {*} maxResults 
  // * @returns 
  // */
  // async function search(value, maxResults) {
  //   try {
  //     const response = await fetch(`https://search.qipusong.site/search?q=${value}&max_results=${maxResults}`);
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     // console.log("data:", data);
  //     return JSON.stringify(data); // 转化为字符串
  //   } catch (error) {
  //     // console.error("Could not fetch the data:", error);
  //   }
  // }

  /**
   * 声音转文本
   */
  let mediaRecorder;
  let audioChunks = [];
  audiopbtn.addEventListener('click', async function () {
    this.classList.toggle("clicked");
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      // console.log("Starting recording...");
      showAlert('麦克风已开启！', true);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(audioStream);
        mediaRecorder.start();

        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          audioChunks = [];
          await sendAudioToServer(audioBlob);
          this.classList.remove("clicked");
        };
        setTimeout(() => {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, 60000);
      } catch (err) {
        showAlert('处理异常: ' + err, false)
        this.classList.remove("clicked");
        // console.error('Error starting recording:', err);
      }
    } else if (mediaRecorder.state === 'recording') {
      // console.log("Stopping recording...");
      mediaRecorder.stop();
      this.classList.remove("clicked");
    }
  });

  async function sendAudioToServer(audioBlob) {
    const formData = new FormData();
    if (isOnlyWeb) {
      formData.append("file", audioBlob, "audio.wav");
      formData.append("model", "whisper-1");
      fetch(`${audioUrl}/v1/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${audioKey}`
        },
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          console.log('语音：', data);
          messageInput.value = data.text;
        })
        .catch((error) => {
          showAlert('请求错误: ' + error, false);
        });
    } else {
      formData.append("audio", audioBlob, "audio.wav");
      fetch(`${baseUrl}/api/talk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getCookie(AUTH_TOKEN)}`
        },
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          showAlert(data.msg, true);
          messageInput.value = data.data;
        })
        .catch((error) => {
          showAlert('请求错误: ' + error, false);
        });
    }
  }

  sendButton.addEventListener("click", function () {
    isSend = !isSend;
    const currentActiveChatBox = getCurrentActiveChatBox();
    if (currentActiveChatBox) {
      const defaultContent = currentActiveChatBox.querySelector('.default-content');
      const gptsContent = currentActiveChatBox.querySelector('.gpts-content');

      if (defaultContent) {
        defaultContent.remove();
      }
      if (gptsContent) {
        gptsContent.remove();
      }
    }

    if (isSend) {
      sendButton.style.backgroundImage = `url("../svg/interp.svg")`;
      sendButton.innerText = '';
      sendMessage(undefined, chatBox);
    } else {
      // 终止请求
      controller.abort();
      sendButton.style.backgroundImage = '';
      sendButton.innerText = '发送';
    }

  });

  messageInput.addEventListener('keydown', function (e) {
    const currentActiveChatBox = getCurrentActiveChatBox();
    if (e.key === 'Enter' && !e.shiftKey) {
      // 如果按下Enter而没有按Shift，阻止默认行为并调用发送消息的函数
      e.preventDefault();
      isSend = !isSend;
      const defaultContent = currentActiveChatBox.querySelector('.default-content');
      const gptsContent = currentActiveChatBox.querySelector('.gpts-content');
      if (defaultContent) {
        defaultContent.remove();
      }
      if (gptsContent) {

        gptsContent.remove();
      }
      // 点击发送状态转图片否则显示文字
      if (isSend) {
        sendButton.style.backgroundImage = `url("../svg/interp.svg")`;
        sendButton.innerText = '';
        sendMessage(undefined, currentActiveChatBox);
      } else {
        // 终止请求
        controller.abort();
        sendButton.style.backgroundImage = '';
        sendButton.innerText = '发送';
      }

    } else if (e.key === 'Enter' && e.shiftKey) {
      // 如果同时按下Shift和Enter，允许默认行为，即在文本框内换行
      // 不需要写代码来特别处理这种情况，因为它是<textarea>的默认行为
    }
  });
  // messageInput.addEventListener("keypress", function (event) {
  //   if (event.key === "Enter") {
  //     event.preventDefault(); // 阻止默认的回车事件
  //     sendMessage();
  //   }
  // });
});