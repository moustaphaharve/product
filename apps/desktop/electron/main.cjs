const { app, BrowserWindow, Menu, shell, ipcMain } = require("electron");
const path = require("node:path");

const isDev = process.env.NODE_ENV === "development";

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#0A0A0A",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    trafficLightPosition: { x: 14, y: 14 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once("ready-to-show", () => win.show());

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  buildMenu(win);
}

function buildMenu(win) {
  const isMac = process.platform === "darwin";

  const template = [
    ...(isMac
      ? [
          {
            label: "Product",
            submenu: [
              { label: "About Product", role: "about" },
              { type: "separator" },
              {
                label: "Settings…",
                accelerator: "Cmd+,",
                click: () => win.webContents.send("menu", "open-settings"),
              },
              {
                label: "Check for Updates…",
                click: () => win.webContents.send("menu", "check-for-updates"),
              },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    {
      label: "File",
      submenu: [
        {
          label: "New Project",
          accelerator: isMac ? "Cmd+N" : "Ctrl+N",
          click: () => win.webContents.send("menu", "new-project"),
        },
        {
          label: "Open Project…",
          accelerator: isMac ? "Cmd+O" : "Ctrl+O",
          click: () => win.webContents.send("menu", "open-project"),
        },
        { type: "separator" },
        {
          label: "Import…",
          click: () => win.webContents.send("menu", "import"),
        },
        {
          label: "Export…",
          accelerator: isMac ? "Cmd+E" : "Ctrl+E",
          click: () => win.webContents.send("menu", "export"),
        },
        { type: "separator" },
        {
          label: "Close Project",
          accelerator: isMac ? "Cmd+W" : "Ctrl+W",
          click: () => win.webContents.send("menu", "close-project"),
        },
        ...(isMac ? [] : [{ type: "separator" }, { role: "quit" }]),
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        {
          label: "Find",
          accelerator: isMac ? "Cmd+F" : "Ctrl+F",
          click: () => win.webContents.send("menu", "find"),
        },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Toggle Sidebar",
          accelerator: isMac ? "Cmd+B" : "Ctrl+B",
          click: () => win.webContents.send("menu", "toggle-sidebar"),
        },
        {
          label: "Toggle Drawer",
          accelerator: isMac ? "Cmd+J" : "Ctrl+J",
          click: () => win.webContents.send("menu", "toggle-drawer"),
        },
        { type: "separator" },
        {
          label: "Viewport Preset",
          submenu: [
            {
              label: "Default",
              click: () =>
                win.webContents.send("menu", "viewport-preset:default"),
            },
            {
              label: "Top-down",
              click: () =>
                win.webContents.send("menu", "viewport-preset:top"),
            },
            {
              label: "Side",
              click: () =>
                win.webContents.send("menu", "viewport-preset:side"),
            },
          ],
        },
        { type: "separator" },
        { role: "togglefullscreen" },
        { role: "reload", visible: isDev },
        { role: "toggleDevTools", visible: isDev },
      ],
    },
    {
      label: "Project",
      submenu: [
        {
          label: "Rename",
          click: () => win.webContents.send("menu", "rename-project"),
        },
        {
          label: "Duplicate",
          click: () => win.webContents.send("menu", "duplicate-project"),
        },
        {
          label: "Version History",
          click: () => win.webContents.send("menu", "version-history"),
        },
        { type: "separator" },
        {
          label: "Export Build Package",
          click: () => win.webContents.send("menu", "export"),
        },
        {
          label: "Delete",
          click: () => win.webContents.send("menu", "delete-project"),
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Documentation",
          click: () => shell.openExternal("https://github.com/mousmous1/product"),
        },
        {
          label: "Keyboard Shortcuts",
          accelerator: isMac ? "Cmd+/" : "Ctrl+/",
          click: () => win.webContents.send("menu", "shortcuts"),
        },
        {
          label: "Report a Bug",
          click: () =>
            shell.openExternal(
              "https://github.com/mousmous1/product/issues/new",
            ),
        },
        {
          label: "Community",
          click: () =>
            shell.openExternal(
              "https://github.com/mousmous1/product/discussions",
            ),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.handle("app:get-platform", () => process.platform);

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
