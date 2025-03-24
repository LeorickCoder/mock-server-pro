// 获取DOM元素
const methodSelect = document.getElementById('method');
const endpointInput = document.getElementById('endpoint');
const bodyContainer = document.getElementById('body-container');
const bodyTextarea = document.getElementById('body');
const sendButton = document.getElementById('send-request');
const responseElement = document.getElementById('response');
const statusElement = document.querySelector('.status');
const timeElement = document.querySelector('.time');
const endpointsContainer = document.getElementById('endpoints');

// 控制请求体输入框的显示隐藏
methodSelect.addEventListener('change', () => {
  const method = methodSelect.value;
  if (method === 'GET' || method === 'DELETE') {
    bodyContainer.style.display = 'none';
  } else {
    bodyContainer.style.display = 'block';
  }
});

// 初始化时根据选择的方法显示或隐藏请求体
if (methodSelect.value === 'GET' || methodSelect.value === 'DELETE') {
  bodyContainer.style.display = 'none';
}

// 发送请求
sendButton.addEventListener('click', async () => {
  const method = methodSelect.value;
  const endpoint = endpointInput.value;
  let body = null;
  
  // 重置响应区域
  responseElement.textContent = '发送请求中...';
  statusElement.textContent = '';
  timeElement.textContent = '';
  statusElement.className = 'status';
  
  // 准备请求体
  if (method !== 'GET' && method !== 'DELETE') {
    try {
      body = JSON.parse(bodyTextarea.value);
    } catch (e) {
      responseElement.textContent = `请求体解析错误: ${e.message}`;
      statusElement.textContent = '错误';
      statusElement.className = 'status error';
      return;
    }
  }
  
  // 记录开始时间
  const startTime = performance.now();
  
  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    // 计算请求时间
    const endTime = performance.now();
    const timeMs = (endTime - startTime).toFixed(0);
    timeElement.textContent = `${timeMs}ms`;
    
    // 获取响应数据
    const data = await response.json();
    
    // 更新响应区域
    statusElement.textContent = `${response.status} ${response.statusText}`;
    statusElement.className = response.ok ? 'status success' : 'status error';
    
    // 格式化JSON输出
    responseElement.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    // 计算请求时间
    const endTime = performance.now();
    const timeMs = (endTime - startTime).toFixed(0);
    timeElement.textContent = `${timeMs}ms`;
    
    // 显示错误
    statusElement.textContent = '请求错误';
    statusElement.className = 'status error';
    responseElement.textContent = `发生错误: ${error.message}`;
  }
});

// 获取API端点信息
async function fetchEndpoints() {
  try {
    const response = await fetch('/mock-info');
    
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data.routes) && data.routes.length > 0) {
      // 渲染端点列表
      const endpointsHtml = data.routes.map(route => {
        const methodClass = `method-${route.method.toLowerCase()}`;
        return `
          <div class="endpoint-item">
            <div class="endpoint-method ${methodClass}">${route.method.toUpperCase()}</div>
            <div class="endpoint-path">${route.path}</div>
          </div>
        `;
      }).join('');
      
      endpointsContainer.innerHTML = endpointsHtml;
    } else {
      endpointsContainer.innerHTML = '<p>没有找到可用的API端点。请在mocks目录中添加端点定义。</p>';
    }
  } catch (error) {
    endpointsContainer.innerHTML = `<p>无法获取API端点: ${error.message}</p>`;
    console.error('Error fetching endpoints:', error);
  }
}

// 页面加载时获取端点信息
fetchEndpoints(); 