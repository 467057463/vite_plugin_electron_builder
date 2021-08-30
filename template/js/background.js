import { 
  app, 
  BrowserWindow, 
  protocol, 
  Notification, 
  session 
} from "electron";
import dayjs from "dayjs";
import path from 'path';
import os from 'os';
// import log from 'electron-log';
import createProtocol from './electron/createProtocol';
// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';


protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

const partition = 'persist:app_session'
let win;
async function createWindow () {
  win = new BrowserWindow({
    width: 900,
    height: 600,
    frame: false,
    show: false,
    title: import.meta.env.VITE_NAME + dayjs(),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      preload: path.join(__preload, 'test.js'),
      partition: partition,
      webviewTag: true,
    }
  })
  // const ses = session.fromPartition('persist:test_webview_session');
  // ses.setProxy({
  //   proxyRules:"socks5://127.0.0.1:1080"
  // })
  createProtocol('app', partition);  
  if(import.meta.env.DEV_SERVER_URL){
    win.loadURL(import.meta.env.DEV_SERVER_URL)
    win.webContents.openDevTools({mode: 'bottom'})
  } else {
    win.loadURL('app://./index.html')
  }

  // 加载完再显示窗口
  // 以免页面空白
  win.once('ready-to-show', () => {
    win.show();
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    if (win) win.show();
  }
});

app.whenReady().then(async () => {
  if(import.meta.env.DEV){
    // 加载本地插件
    const ses = session.fromPartition(partition);
    const vueDevToolsPath = path.join(
      os.homedir(),
      '/AppData/Local/Google/Chrome/User Data/Default/Extensions/ljjemllljcmogpfapbkkighbhhppjdbg/6.0.0.15_0'
    )
    await ses.loadExtension(vueDevToolsPath);
    
    // 自动下载插件
    // installExtension(VUEJS3_DEVTOOLS)
    //   .then((name) => console.log(`Added Extension:  ${name}`))
    //   .catch((err) => console.log('An error occurred: ', err));
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (import.meta.env.DEV) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

