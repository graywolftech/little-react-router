import { JSDOM } from 'jsdom';

export const jsdom = new JSDOM();

// I *need* this code to run before any react testing stuff is imported since the exports
// are conditional based on the presence of "document" as a global variable
// a bit annoying but this works

// @ts-ignore
global.window = jsdom.window;
global.document = jsdom.window.document;
global.navigator = jsdom.window.navigator;
global.getComputedStyle = jsdom.window.getComputedStyle;
// @ts-ignore
global.requestAnimationFrame = null;
