import AppConfig from "@/config/AppConfig";
import GembaseUtils from "@/utils/GembaseUtils";
import UserData from "@/models/user/UserData";

let __heapInitialized = false;

export function initHeap() {
    if (__heapInitialized) {
        return;
    }
    if (AppConfig.isProd) {
        GembaseUtils.loadScriptText(`
                window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};
                heap.load("332207305");
            `);
        __heapInitialized = true;
    }
}

export function setHeapUserData(user: UserData) {
    if (AppConfig.isProd) {
        if (!__heapInitialized) {
            initHeap();
        }
        // @ts-ignore
        window.heap.identify(user.guid);
        // @ts-ignore
        window.heap.addUserProperties({
            Name: user.name,
            email: user.email,
            company: user.dev_detail.title
        });
    }
}
