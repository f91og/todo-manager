import { app, BrowserWindow, ipcMain, globalShortcut, screen } from 'electron';
import * as path from 'path';
import * as os from 'os';
import * as sqlite3 from 'sqlite3';

// 类型声明
let win: BrowserWindow | null = null;
let db: sqlite3.Database;
let isAlwaysOnTop: boolean = true;  // 默认窗口总是在最前
let isDocked: boolean = false;      // 窗口是否悬挂状态
let originalBounds: Electron.Rectangle | null = null; // 存储窗口原来的大小和位置

// 创建窗口
function createWindow(): void {
    win = new BrowserWindow({
        width: 300,
        height: 400,
        frame: false,
        transparent: true,
        alwaysOnTop: isAlwaysOnTop,
        resizable: true, // 允许调整窗口大小
        skipTaskbar: true,
        roundedCorners: false,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win.setPosition(width - 300, height - 400);
    win.loadFile(path.join(__dirname, '../renderer/index.html'));

    // 当窗口关闭时，清除 win 对象
    win.on('closed', () => {
        win = null;
    });
}

// 初始化数据库
function initDatabase(): void {
    const homeDir: string = os.homedir();
    const dbPath: string = path.join(homeDir, '.todos.db');
    db = new sqlite3.Database(dbPath, (err: Error | null) => {
        if (err) {
            console.error('Error opening database', err);
        } else {
            db.run(`
                CREATE TABLE IF NOT EXISTS todos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    text TEXT,
                    done BOOLEAN
                )`, (err: Error | null) => {
                if (err) {
                    console.error('Error creating table', err);
                }
            });
        }
    });
}

// 获取所有Todo
ipcMain.handle('get-todos', (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM todos", (err: Error | null, rows: any[]) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

// 添加Todo
ipcMain.handle('add-todo', (event: Electron.IpcMainInvokeEvent, text: string): Promise<{ id: number, text: string, done: boolean }> => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO todos (text, done) VALUES (?, ?)", [text, false], function (err: Error | null) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this!.lastID, text, done: false });
            }
        });
    });
});

// 更新Todo
ipcMain.handle('update-todo', (event: Electron.IpcMainInvokeEvent, id: number, newText: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE todos SET text = ? WHERE id = ?", [newText, id], (err: Error | null) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
});

// 切换Todo的完成状态
ipcMain.handle('toggle-todo', (event: Electron.IpcMainInvokeEvent, id: number, done: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE todos SET done = ? WHERE id = ?", [done, id], (err: Error | null) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

// 窗口悬挂和恢复功能
ipcMain.handle('window-dock', (): void => {
    if (win) {
        if (isDocked) {
            // 还原窗口大小和内容
            win.setBounds(originalBounds!);
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
                height: 50            // 保持固定高度
            });
            isDocked = true;
        }
    }
});

app.whenReady().then(() => {
    initDatabase();
    createWindow();
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        if (win != null) {
            win.webContents.toggleDevTools();
        }
    });
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
