/**
 * 点击GPTS，会显示GPTS页面。
 * 在这里选择GPTS
 * 会有一个搜索框帮助快速搜素找到需要的模型
 * 对模型进行分类排序
 * 将GPTS都绑定模型名字，选中进入新建会话，将固定的GPT-z-gizdemo替换为对应的模型名称
 */

// 获取侧边栏菜单和聊天容器的元素
import { getOpenaiBaseUrl, getAuthToken } from "./common.js"
import { globalModeSettings } from "./setup.js"
import { gptsBeginTalk } from "./app.js"
import { showAlert } from "./iconBtn.js";


// const scrollHandler = debounce(() => {
//   console.log('scroll');
// }, 100);

// window.addEventListener('scroll', scrollHandler);

document.addEventListener("DOMContentLoaded", function () {
  const sidebarMenu = document.getElementById("sidebar-menu");
  const chatContainer = document.getElementById("chat-container");
  const newContainer = document.getElementById("new-container");


  // 为侧边栏菜单添加点击事件监听器
  sidebarMenu.addEventListener('click', function () {
    // console.log("进入GPTS", chatContainer.style);
    // 切换聊天容器和新容器的显示状态
    if (chatContainer.style.display !== 'none') {
      chatContainer.style.display = 'none';
      newContainer.style.display = 'block';
      createGPTs();
    } else {
      chatContainer.style.display = 'block';
      newContainer.style.display = 'none';
    }
  });

  const items = document.querySelectorAll(".new-container-main-fenlei-build-item");
  let activeItem = null; // 用于跟踪当前活动的项目
  // const container = document.querySelector(".new-container");
  const searchInput = document.getElementById('search-input')

  searchInput.addEventListener('focus', showRecentSearches);
  searchInput.addEventListener('click', showRecentSearches);

  function showRecentSearches() {
    const openaiBaseUrl = globalModeSettings.webProxyUrl;
    const url = `${openaiBaseUrl}/public-api/gizmos/discovery/recent?limit=3`;
    fetchResults(url, globalModeSettings.accessToken).then(results => {
      displayResults(results.list.items, document.getElementById('results-container'), true);
    }).catch(error => {
      console.error('Error fetching the results:', error);
      document.getElementById('results-container').innerHTML = '加载失败，请重试';
    });
  }

  searchInput.addEventListener('input', debounce(function () {
    const openaiBaseUrl = getOpenaiBaseUrl();
    const input = this.value.trim();
    if (input) {
      const url = `${openaiBaseUrl}/backend-api/gizmos/search?q=${encodeURIComponent(input)}`;
      fetchResults(url, getAuthToken()).then(results => {
        displayResults(results.items, document.getElementById('results-container'), false);
      }).catch(error => {
        console.error('Error fetching the results:', error);
        document.getElementById('results-container').innerHTML = '加载失败，请重试';
      });
    } else {
      document.getElementById('results-container').style.display = 'none';
    }
  }, 300)); // 使用防抖来减少请求频率

  async function fetchResults(url, auth_token) {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${auth_token}`
      }
    });
    const data = await response.json();
    return data; // 假设返回的数据结构中有一个`items`数组
  }

  function displayResults(results, container, isRecent) {
    container.innerHTML = ''; // 清空现有结果
    if (results.length === 0) {
      container.style.display = 'none';
    } else {
      results.forEach(item => {
        // console.log("item", item);
        const div = document.createElement('div');
        div.className = 'result-item';
        // 创建图片元素
        item = isRecent ? item.resource : item;
        const img = document.createElement('img');
        if (item.gizmo.display.profile_picture_url) {
          img.alt = 'Profile Picture GPT';
          img.style.width = '30px';
          img.style.height = '30px';
          img.style.marginRight = '10px';
        }

        // 创建文本节点
        const text = document.createTextNode(item.gizmo.display.name);
        if (item.gizmo.display.profile_picture_url) {
          fetch(item.gizmo.display.profile_picture_url)
            .then(response => response.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              img.src = url;
            })
            .catch(error => console.error('Failed to load image', error));
        }
        div.appendChild(img);
        div.appendChild(text);

        div.addEventListener('click', () => {
          // console.log("gpts搜索文本")
          selectResult(item.gizmo.id);
        });
        container.appendChild(div);
      });
      container.style.zIndex = '10000';

      var fenleiContainer = document.querySelector('.new-container-main-fenlei');
      fenleiContainer.style.zIndex = '1';
      container.style.display = 'block';

    }
  }
  /**
 * GPS初始化
 */
  async function createGPTs() {
    const openaiBaseUrl = getOpenaiBaseUrl();
    const url = `${openaiBaseUrl}/public-api/gizmos/discovery_anon`;
    let data;
    const loading = document.createElement('div');
    loading.className = 'loading';
    document.body.appendChild(loading);
    try {
      loading.classList.add('show');
      data = await fetchResults(url, getAuthToken());
      loading.classList.remove('show');
    } catch (error) {
      showAlert('请求错误: ' + error, false);
      loading.classList.remove('show');
      return;
    }

    const container = document.getElementById('new-container-main');

    data.cuts.forEach(cut => {
      let currentCursor = 6;
      // console.log(cut.info.display_type)
      // 创建info部分
      const area = document.createElement('div');
      area.className = 'new-container-main-area';

      const infoDiv = document.createElement('div');
      infoDiv.tabIndex = 0;
      infoDiv.style.opacity = 1;
      infoDiv.style.transform = 'none';

      const title = document.createElement('div');
      title.className = 'text-xl font-medium md:text-2xl';
      title.textContent = cut.info.title;
      title.id = cut.info.title === 'Featured' ? 'featured' : cut.info.title.toLowerCase();

      const description = document.createElement('div');
      description.className = 'text-sm text-token-text-tertiary md:text-base';
      description.textContent = cut.info.description;

      infoDiv.appendChild(title);
      infoDiv.appendChild(description);

      area.appendChild(infoDiv);

      // 创建list部分
      const gridContainer = document.createElement('div');
      gridContainer.className = 'mb-10 mt-4 new-container-main-area-grid';

      const grid = document.createElement('div');
      grid.className = cut.info.title === 'Featured' ? 'grid grid-cols-2 gap-x-1.5 gap-y-1 md:gap-x-2 md:gap-y-1.5 lg:grid-cols-2 lg:gap-x-3 lg:gap-y-2.5' : 'grid grid-cols-3 gap-x-1.5 gap-y-1 md:gap-x-2 md:gap-y-1.5 lg:grid-cols-2 lg:gap-x-3 lg:gap-y-2.5';
      let i = 0;
      const addItemToGrid = (item) => {
        i++;
        const gridItem = document.createElement('div');
        gridItem.className = cut.info.title === 'Featured' ? 'new-container-main-area-grid-item' : 'new-container-main-area-grid-item2';
        gridItem.tabIndex = 0;
        gridItem.style.opacity = 1;
        gridItem.style.transform = 'none';

        if (cut.info.title !== 'Featured') {
          const partNumberContainer = document.createElement('div');
          partNumberContainer.className = 'text-md flex w-8 shrink-0 items-center justify-center font-semibold ';
          partNumberContainer.textContent = i;
          gridItem.appendChild(partNumberContainer);
        }

        const imgContainer = document.createElement('div');
        imgContainer.className = cut.info.title === 'Featured' ? 'h-16 w-16 flex-shrink-0 md:h-24 md:w-24' : 'h-12 w-12 flex-shrink-0';

        const img = document.createElement('img');
        if (item.resource.gizmo.display.profile_picture_url) {
          fetch(item.resource.gizmo.display.profile_picture_url)
            .then(response => response.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              img.src = url;
            })
            .catch(error => console.error('Failed to load image', error));
        }
        img.alt = 'GPT';
        img.className = 'h-full w-full bg-token-main-surface-secondary';

        imgContainer.appendChild(img);

        const textContainer = document.createElement('div');
        textContainer.className = 'flex flex-col grid-text';

        const name = document.createElement('div');
        name.className = 'font-medium line-clamp-2 md:text-lg';
        name.textContent = item.resource.gizmo.display.name;

        const desc = document.createElement('span');
        desc.className = 'text-xs line-clamp-2 md:line-clamp-3';
        desc.textContent = item.resource.gizmo.display.description;
        desc.style.marginTop = cut.info.title === 'Featured' ? '8px' : '0px';

        const author = document.createElement('div');
        author.className = 'mt-1 flex justify-start gap-1 text-xs font-light text-token-text-tertiary line-clamp-1';

        const authorInfo = document.createElement('div');
        authorInfo.className = 'mt-1 flex flex-row items-center space-x-1';

        const authorName = document.createElement('div');
        authorName.className = 'text-token-text-tertiary text-xs';
        authorName.textContent = `By ${item.resource.gizmo.author.display_name}`;

        authorInfo.appendChild(authorName);
        author.appendChild(authorInfo);

        textContainer.appendChild(name);
        textContainer.appendChild(desc);
        textContainer.appendChild(author);

        gridItem.appendChild(imgContainer);
        gridItem.appendChild(textContainer);

        grid.appendChild(gridItem);
        gridItem.addEventListener('click', () => {
          // console.log("gpts搜索文本")
          selectResult(item.resource.gizmo.id);
        });
      };

      cut.list.items.forEach(addItemToGrid);

      gridContainer.appendChild(grid);
      area.appendChild(gridContainer);

      if (cut.info.title !== 'Featured') {
        const button = document.createElement('button');
        button.className = 'btn2 relative btn-neutral mt-2 h-10 w-full focus:ring-0 focus:ring-offset-0 md:mt-3 new-container-main-area-button';
        button.innerHTML = '<div class="flex w-full gap-2 items-center justify-center">更多</div>';
        area.appendChild(button);
        button.addEventListener('click', async () => {
          try {
            button.classList.add('loading');
            button.innerHTML = '';
            const url = `${openaiBaseUrl}/public-api/gizmos/discovery/${cut.info.id}?cursor=${currentCursor}&limit=6&locale=global`;
            const moreData = await fetchResults(url, getAuthToken());
            moreData.list.items.forEach(addItemToGrid);
            currentCursor += 6;
            button.classList.remove('loading');
            button.innerHTML = '<div class="flex w-full gap-2 items-center justify-center">更多</div>';
            area.removeChild(button);
            gridContainer.appendChild(button);
          } catch (error) {
            console.error("Failed to fetch more results:", error);
            button.classList.remove('loading');
            button.innerHTML = '<div class="flex w-full gap-2 items-center justify-center">更多</div>';
            area.removeChild(button);
            gridContainer.appendChild(button);
          }
        });
      }

      container.appendChild(area);
    });
    addScrollListener();
  }



  /**
   * GPTS搜索详情
   */
  async function fetchData(id) {
    const openaiBaseUrl = getOpenaiBaseUrl();
    const auth_token = getAuthToken();
    try {
      const response = await fetch(`${openaiBaseUrl}/backend-api/gizmos/${id}/about`, {
        headers: {
          "Authorization": `Bearer ${auth_token}`
        }
      });
      const data = await response.json();
      renderData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  // 图片加载函数
  async function loadImage(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to load image', error);
      return null;
    }
  }

  async function renderData(data) {
    const openaiBaseUrl = getOpenaiBaseUrl();
    const auth_token = getAuthToken();
    // console.log("renderData function called");
    let gizmoMore = "";
    try {
      const response = await fetch(`${openaiBaseUrl}/backend-api/gizmo_creators/${data.gizmo.author.user_id}/gizmos`, {
        headers: {
          "Authorization": `Bearer ${auth_token}`
        }
      });
      gizmoMore = await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    const profilePicUrl = await loadImage(data.gizmo.display.profile_picture_url);
    const moreItemsPicUrls = await Promise.all(
      gizmoMore.items.map(async (gizmo) => {
        return {
          url: gizmo.gizmo.display.profile_picture_url,
          src: await loadImage(gizmo.gizmo.display.profile_picture_url),
          name: gizmo.gizmo.display.name,
          description: gizmo.gizmo.display.description,
          num_conversations_str: gizmo.gizmo.vanity_metrics.num_conversations_str
        };
      })
    );
    const container = document.getElementById('container');
    container.innerHTML = `
        <div data-state="open" class="fixed inset-0 bg-black/50 dark:bg-black/80" style="pointer-events: auto;">
            <div class="grid h-full w-full grid-cols-[10px_1fr_10px] overflow-y-auto grid-rows-[minmax(10px,_1fr)_auto_minmax(10px,_1fr)] md:grid-rows-[minmax(20px,_1fr)_auto_minmax(20px,_1fr)]">
                <div role="dialog" id="radix-:rba:" aria-describedby="radix-:rbc:" aria-labelledby="radix-:rbb:" data-state="open"
                    class="popover relative left-1/2 col-auto col-start-2 row-auto row-start-2 w-full -translate-x-1/2 rounded-2xl bg-token-main-surface-primary text-left shadow-xl flex flex-col focus:outline-none min-h-[80vh] h-[calc(100vh-25rem)] max-w-md flex max-w-xl flex-col"
                    tabindex="-1" style="pointer-events: auto;">
                    <div class="flex-grow overflow-y-auto">
                        <div class="relative flex h-me overflow-y-auto flex-col gap-2 px-2 py-4">
                            <div class="relative flex flex-grow flex-col gap-4 overflow-y-auto px-6 pb-4 pt-16">
                                <div class="absolute top-0">
                                    <div class="fixed left-4 right-4 z-10 flex min-h-[64px] items-start justify-end gap-4 bg-gradient-to-b from-token-main-surface-primary to-transparent px-2">
                                        <button type="button" id="radix-:rbd:" aria-haspopup="menu" aria-expanded="false" data-state="closed"
                                            class="text-token-text-primary border border-transparent inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-white px-3 text-sm dark:transparent dark:bg-transparent leading-none outline-none cursor-pointer hover:bg-token-main-surface-secondary dark:hover:bg-token-main-surface-secondary focus-visible:bg-token-main-surface-secondary radix-state-active:text-token-text-secondary radix-disabled:cursor-auto radix-disabled:bg-transparent radix-disabled:text-token-text-tertiary dark:radix-disabled:bg-transparent focus:border-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-sm text-token-text-tertiary hover:text-token-text-secondary">
                                                <path fill="currentColor" fill-rule="evenodd"
                                                    d="M3 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0m7 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0m7 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0" clip-rule="evenodd"></path>
                                            </svg>
                                        </button>
                                        <button class=" relative ">
                                            <div class="flex w-full gap-2 items-center justify-center">
                                                <button class=" btn text-token-text-tertiary btn-secondary border-0 hover:bg-token-main-surface-secondary hover:text-token-text-secondary" id = "closeGpts">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M6.34315 6.34338L17.6569 17.6571M17.6569 6.34338L6.34315 17.6571" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                                <div class="absolute bottom-4">
                                    <div class="fixed left-4 right-4 z-10 flex min-h-[64px] items-end bg-gradient-to-t from-token-main-surface-primary to-transparent px-2">
                                        <div class="flex flex-grow flex-col items-center" >
                                            <a target="_self" class="btn relative btn-dark h-12 w-full" as="link" id="beginChat" href="#" data-route>
                                                <div class="flex w-full gap-2 items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-lg">
                                                        <path fill="currentColor" fill-rule="evenodd"
                                                            d="M12 4a8 8 0 0 0-5.687 13.627 1 1 0 0 1 .147 1.217L5.766 20H12a8 8 0 1 0 0-16M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10H4a1 1 0 0 1-.857-1.515l1.218-2.03A9.96 9.96 0 0 1 2 12" clip-rule="evenodd"></path>
                                                    </svg>
                                                    开始聊天
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex h-full flex-col items-center justify-center text-token-text-primary !h-fit">
                                    <div class="relative">
                                        <div class="mb-3 h-12 w-12 !h-20 !w-20">
                                            <div class="gizmo-shadow-stroke overflow-hidden rounded-full">
                                                <img src="${profilePicUrl}" class="h-full w-full bg-token-main-surface-secondary" alt="GPT" width="80" height="80">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col items-center gap-2">
                                        <div class="text-center text-2xl font-medium">${data.gizmo.display.name}</div>
                                        <div class="flex items-center gap-1 text-token-text-tertiary">
                                            <div class="mt-1 flex flex-row items-center space-x-1">
                                                <div class="text-sm text-token-text-tertiary">创建者：${data.gizmo.author.display_name}</div>
                                                <div>
                                                    <div class="my-2" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:rbf:" data-state="closed">
                                                        <div class="flex items-center gap-1 rounded-xl bg-token-main-surface-secondary px-2 py-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-xs text-token-text-secondary">
                                                                <path fill="currentColor" fill-rule="evenodd"
                                                                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m9.985-7.997a.3.3 0 0 0-.064.03c-.13.08-.347.291-.596.744-.241.438-.473 1.028-.674 1.756-.336 1.22-.567 2.759-.632 4.467h3.962c-.065-1.708-.296-3.247-.632-4.467-.201-.728-.433-1.318-.674-1.756-.25-.453-.466-.665-.596-.743a.3.3 0 0 0-.064-.031L12 4q-.003 0-.015.003M8.018 11c.066-1.867.316-3.588.705-5 .15-.544.325-1.054.522-1.513A8.01 8.01 0 0 0 4.062 11zm-3.956 2h3.956c.077 2.174.404 4.156.912 5.68q.144.435.315.833A8.01 8.01 0 0 1 4.062 13m5.957 0c.076 1.997.378 3.757.808 5.048.252.756.53 1.296.79 1.626.128.162.232.248.302.29q.049.03.066.033L12 20l.015-.003a.3.3 0 0 0 .066-.032c.07-.043.174-.13.301-.291.26-.33.539-.87.79-1.626.43-1.29.732-3.05.809-5.048zm5.963 0c-.077 2.174-.404 4.156-.912 5.68q-.144.435-.315.833A8.01 8.01 0 0 0 19.938 13zm3.956-2a8.01 8.01 0 0 0-5.183-6.513c.197.46.371.969.522 1.514.389 1.41.639 3.132.705 4.999z" clip-rule="evenodd"></path>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="max-w-md text-center text-sm font-normal text-token-text-primary">${data.gizmo.display.description}</div>
                                    </div>
                                </div>
                                <div class="flex justify-center">
                                    <div class="flex flex-col justify-center items-center gap-2 border-l border-token-border-heavy first:border-0 w-48 mt-4 px-2">
                                        <div class="flex flex-row items-center gap-1.5 pt-1 text-xl font-medium text-center leading-none">
                                            <svg width="24" height="24" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm">
                                                <path d="M15.6961 2.70609C17.4094 -0.33367 21.7868 -0.333671 23.5002 2.70609L27.237 9.33591C27.3648 9.56271 27.585 9.72268 27.8402 9.77418L35.3003 11.2794C38.7207 11.9695 40.0734 16.1327 37.7119 18.7015L32.5613 24.3042C32.3851 24.4958 32.301 24.7547 32.3309 25.0133L33.2046 32.5734C33.6053 36.0397 30.0639 38.6127 26.891 37.1605L19.971 33.9933C19.7342 33.885 19.4621 33.885 19.2253 33.9933L12.3052 37.1605C9.1324 38.6127 5.59103 36.0397 5.99163 32.5734L6.86537 25.0133C6.89526 24.7547 6.81116 24.4958 6.63496 24.3042L1.48438 18.7015C-0.877157 16.1327 0.475528 11.9695 3.89596 11.2794L11.356 9.77418C11.6113 9.72268 11.8314 9.56271 11.9593 9.33591L15.6961 2.70609Z" fill="currentColor"></path>
                                            </svg>4.3
                                        </div>
                                        <div class="text-xs text-token-text-tertiary">评级 (1K+)</div>
                                    </div>
                                    <div class="flex flex-col justify-center items-center gap-2 border-l border-token-border-heavy first:border-0 w-48 mt-4 px-2">
                                        <div class="flex flex-row items-center gap-1.5 pt-1 text-xl font-medium text-center leading-none">#11</div>
                                        <div class="text-xs text-token-text-tertiary">属于Education</div>
                                    </div>
                                    <div class="flex flex-col justify-center items-center gap-2 border-l border-token-border-heavy first:border-0 w-48 mt-4 px-2">
                                        <div class="flex flex-row items-center gap-1.5 pt-1 text-xl font-medium text-center leading-none">100K+</div>
                                        <div class="text-xs text-token-text-tertiary">对话</div>
                                    </div>
                                </div>
                                <div class="flex flex-col">
                                    <div class="font-bold mt-6">对话开场白</div>
                                    <div class="mt-4 grid grid-cols-2 gap-x-1.5 gap-y-2">
                                        ${data.gizmo.display.prompt_starters.map(starter => `
                                        <div class="flex" tabindex="0">
                                            <a class="group relative ml-2 h-14 flex-grow rounded-xl border border-token-border-medium bg-token-main-surface-primary px-4 hover:bg-token-main-surface-secondary focus:outline-none" href="${data.gizmo.short_url}?q=${starter}" data-route>
                                                <div class="flex h-full items-center">
                                                    <div class="line-clamp-2 text-sm">${starter}</div>
                                                </div>
                                                <div class="absolute -bottom-px -left-2 h-3 w-4 border-b border-token-border-medium bg-token-main-surface-primary group-hover:bg-token-main-surface-secondary">
                                                    <div class="h-3 w-2 rounded-br-full border-b border-r border-token-border-medium bg-token-main-surface-primary"></div>
                                                </div>
                                                <div class="absolute bottom-0 right-2 top-0 hidden items-center group-hover:flex">
                                                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-token-main-surface-primary">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-md text-token-text-primary">
                                                            <path fill="currentColor" fill-rule="evenodd"
                                                                d="M12 4a8 8 0 0 0-5.687 13.627 1 1 0 0 1 .147 1.217L5.766 20H12a8 8 0 1 0 0-16M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10H4a1 1 0 0 1-.857-1.515l1.218-2.03A9.96 9.96 0 0 1 2 12" clip-rule="evenodd"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>`).join('')}
                                    </div>
                                </div>
                                <div class="flex flex-col">
                                    <div class="font-bold mt-6 mb-2">功能</div>
                                    <div class="flex flex-row items-start gap-2 py-1 text-sm">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm mt-0.5 text-green-600">
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M18.0633 5.67375C18.5196 5.98487 18.6374 6.607 18.3262 7.06331L10.8262 18.0633C10.6585 18.3093 10.3898 18.4678 10.0934 18.4956C9.79688 18.5234 9.50345 18.4176 9.29289 18.2071L4.79289 13.7071C4.40237 13.3166 4.40237 12.6834 4.79289 12.2929C5.18342 11.9023 5.81658 11.9023 6.20711 12.2929L9.85368 15.9394L16.6738 5.93664C16.9849 5.48033 17.607 5.36263 18.0633 5.67375Z" fill="currentColor"></path>
                                        </svg>
                                        <div>数据分析</div>
                                    </div>
                                    <div class="flex flex-row items-start gap-2 py-1 text-sm">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm mt-0.5 text-green-600">
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M18.0633 5.67375C18.5196 5.98487 18.6374 6.607 18.3262 7.06331L10.8262 18.0633C10.6585 18.3093 10.3898 18.4678 10.0934 18.4956C9.79688 18.5234 9.50345 18.4176 9.29289 18.2071L4.79289 13.7071C4.40237 13.3166 4.40237 12.6834 4.79289 12.2929C5.18342 11.9023 5.81658 11.9023 6.20711 12.2929L9.85368 15.9394L16.6738 5.93664C16.9849 5.48033 17.607 5.36263 18.0633 5.67375Z" fill="currentColor"></path>
                                        </svg>
                                        <div>浏览</div>
                                    </div>
                                </div>
                                <div class="flex flex-col">
                                    <div class="mb-2">
                                        <div class="font-bold mt-6">评级</div>
                                    </div>
                                    ${data.review_stats.by_rating.map((rating, index) => `
                                    <div class="flex flex-row items-center gap-2 py-1 text-xl font-medium">
                                        <div class="icon-lg relative">
                                            <svg width="24" height="24" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-lg text-green-500">
                                                <path d="M15.6961 2.70609C17.4094 -0.33367 21.7868 -0.333671 23.5002 2.70609L27.237 9.33591C27.3648 9.56271 27.585 9.72268 27.8402 9.77418L35.3003 11.2794C38.7207 11.9695 40.0734 16.1327 37.7119 18.7015L32.5613 24.3042C32.3851 24.4958 32.301 24.7547 32.3309 25.0133L33.2046 32.5734C33.6053 36.0397 30.0639 38.6127 26.891 37.1605L19.971 33.9933C19.7342 33.885 19.4621 33.885 19.2253 33.9933L12.3052 37.1605C9.1324 38.6127 5.59103 36.0397 5.99163 32.5734L6.86537 25.0133C6.89526 24.7547 6.81116 24.4958 6.63496 24.3042L1.48438 18.7015C-0.877157 16.1327 0.475528 11.9695 3.89596 11.2794L11.356 9.77418C11.6113 9.72268 11.8314 9.56271 11.9593 9.33591L15.6961 2.70609Z" fill="currentColor"></path>
                                            </svg>
                                            <div class="absolute inset-0 flex items-center justify-center text-[11px] text-white">${5 - index}</div>
                                        </div>
                                        <div class="h-2.5 flex-grow overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                            <div class="h-full bg-green-500" style="width: ${rating * 100}%;"></div>
                                        </div>
                                    </div>`).join('')}
                                </div>
                                <div class="flex flex-col">
                                    <div class="mb-2">
                                        <div class="font-bold mt-6">由 ${data.gizmo.author.display_name} 创建的更多项</div>
                                    </div>
                                    <div class="no-scrollbar group flex min-h-[104px] items-center space-x-2 overflow-x-auto overflow-y-hidden">
                                        ${moreItemsPicUrls.map(gizmo => `
                                        <a href="/g/${gizmo.url}" class="h-fit min-w-fit rounded-xl bg-token-main-surface-secondary px-1 py-4 md:px-3 md:py-4 lg:px-3" data-route>
                                            <div class="flex w-full flex-grow items-center gap-4 overflow-hidden">
                                                <div class="h-12 w-12 flex-shrink-0">
                                                    <div class="gizmo-shadow-stroke overflow-hidden rounded-full">
                                                        <img src="${gizmo.src}" class="h-full w-full bg-token-main-surface-secondary" alt="GPT" width="80" height="80">
                                                    </div>
                                                </div>
                                                <div class="overflow-hidden text-ellipsis break-words">
                                                    <span class="line-clamp-2 text-sm font-medium leading-tight">${gizmo.name}</span>
                                                    <span class="line-clamp-3 text-xs">${gizmo.description}</span>
                                                    <div class="mt-1 flex items-center gap-1 text-ellipsis whitespace-nowrap pr-1 text-xs text-token-text-tertiary">
                                                        <div class="mt-1 flex flex-row items-center space-x-1">
                                                            <div class="text-token-text-tertiary text-xs">创建者：${data.gizmo.author.display_name}</div>
                                                        </div>
                                                        <span class="text-[8px]">•</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="h-3 w-3">
                                                            <path fill="currentColor" fill-rule="evenodd"
                                                                d="M8.522 6.536a7.25 7.25 0 1 1 11.996 8.106l.83 1.328a1 1 0 0 1-.848 1.53h-5.044a7.25 7.25 0 0 1-6.389 3.498L9 21H3.5a1 1 0 0 1-.848-1.53l.83-1.328a7.25 7.25 0 0 1 5.04-11.606m2.372.151a7.253 7.253 0 0 1 5.393 8.813h2.409l-.261-.417a1 1 0 0 1 .123-1.219 5.25 5.25 0 1 0-7.664-7.177M8.895 19a1 1 0 0 1 .141-.004q.106.004.214.004A5.25 5.25 0 1 0 4 13.75c0 1.401.547 2.672 1.442 3.614a1 1 0 0 1 .123 1.219l-.26.417z" clip-rule="evenodd"></path>
                                                        </svg>${gizmo.num_conversations_str}
                                                    </div>
                                                </div>
                                            </div>
                                        </a>`).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('container').style.display = 'block';
    addCloseEventListeners();
    const beginChat = document.getElementById('beginChat');

    if (beginChat) {
      beginChat.addEventListener('click', async function (event) {
        event.preventDefault();
        //${data.gizmo.short_url}
        console.log('开始聊天按钮被点击');
        await gptsBeginTalk(data.gizmo.short_url);
      });
    }
  }
  function addCloseEventListeners() {
    const closeButton = document.getElementById('closeGpts');
    console.log('Close button found:', closeButton)
    const backdrop = document.querySelector('.fixed.inset-0');
    console.log('Backdrop found:', backdrop);

    if (closeButton) {
      closeButton.addEventListener('click', function (event) {
        console.log('Close button clicked');
        closePopover(backdrop);
      });
    }
  }

  function closePopover(backdrop) {
    // console.log('Closing popover');
    if (backdrop) {
      backdrop.style.display = 'none';
      document.getElementById('container').innerHTML = '';
      document.getElementById('container').style.display = 'none';
    }
  }

  function selectResult(id) {
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('container').style.opacity = 1;
    document.getElementById('container').style.zIndex = 1100;
    fetchData(id);
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }


  items.forEach(item => {
    item.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const targetElement = document.getElementById(targetId);
      // console.log(targetElement.offsetTop);
      targetElement.scrollIntoView({ behavior: 'smooth' });

      if (activeItem) {
        activeItem.classList.remove("active");
      }
      this.classList.add("active");
      activeItem = this;
    });
  });

  function addScrollListener() {
    const container = document.querySelector(".new-container");

    container.addEventListener("scroll", function () {
      let foundActive = false;
      items.forEach(item => {
        if (foundActive) return;
        const targetId = item.getAttribute("data-target");
        //console.log('tarId', targetId);
        const targetElement = document.getElementById(targetId);
        // console.log('tarE', targetElement);
        const scrollPosition = container.scrollTop + container.offsetTop;

        // 检查用户是否已滚动到该元素的位置
        if (scrollPosition >= targetElement.offsetTop && scrollPosition < targetElement.offsetTop + targetElement.offsetHeight) {
          if (activeItem) {
            activeItem.classList.remove("active");
          }
          item.classList.add("active");
          activeItem = item;
          foundActive = true; // 标记已找到活动项
        }
      });
    });
  }


});



