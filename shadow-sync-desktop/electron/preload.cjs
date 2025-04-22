/* eslint-env node */
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {});
