const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("product", {
  platform: () => ipcRenderer.invoke("app:get-platform"),
  onMenu: (cb) => {
    const handler = (_event, command) => cb(command);
    ipcRenderer.on("menu", handler);
    return () => ipcRenderer.removeListener("menu", handler);
  },
});
