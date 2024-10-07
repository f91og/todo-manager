const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron');
const path = require('path');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();

let win;
let db;
let isAlwaysOnTop = true;  // 默认窗口总是在最前
let isDocked = false;      // 窗口是否悬挂状态
let originalBounds = null; // 存储窗口原来的大小和位置

function createWindow() {
    win = new BrowserWindow({
        width: 300,
        height: 400,
        frame: false,
        transparent: true,
        alwaysOnTop: isAlwaysOnTop,
        resizable: false,
        skipTaskbar: true,
        frame: false, 
        resizable: true, // 允许调整窗口大小
        roundedCorners: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;
    win.setPosition(width - 300, height - 400);
    win.loadFile('index.html');
}

function initDatabase() {
    const homeDir = os.homedir();
    const dbPath = path.join(homeDir, '.todos.db');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database', err);
        } else {
            db.run(`
                CREATE TABLE IF NOT EXISTS todos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    text TEXT,
                    done BOOLEAN
                )`, (err) => {
                if (err) {
                    console.error('Error creating table', err);
                }
            });
        }
    });
}

ipcMain.handle('get-todos', (event) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM todos", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

ipcMain.handle('add-todo', (event, text) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO todos (text, done) VALUES (?, ?)", [text, false], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, text: text, done: false });
            }
        });
    });
});

ipcMain.handle('update-todo', (event, id, newText) => {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE todos SET text = ? WHERE id = ?`, [newText, id], function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
});


ipcMain.handle('toggle-todo', (event, id, done) => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE todos SET done = ? WHERE id = ?", [done, id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

ipcMain.handle('window-dock', () => {
    if (isDocked) {
        // 还原窗口大小和内容
        win.setBounds(originalBounds);
        isDocked = false;
    } else {
        // 获取屏幕尺寸并悬挂到右边
        const { width } = screen.getPrimaryDisplay().bounds;
        originalBounds = win.getBounds();  // 存储原窗口尺寸

        // 悬挂到屏幕右边，保持原窗口的高度
        win.setBounds({
            x: width - 25,       // 悬挂到屏幕右边，减去窄宽度的部分
            y: originalBounds.y,  // 保持原来的Y位置
            width: 25,            // 宽度缩小，容纳"Todo"
            height: 50  // 保持原窗口高度不变
        });
        isDocked = true;
    }
});


app.whenReady().then(() => {
    initDatabase();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
