import LZString from 'lz-string';
import ClientError from "@/core/errors/ClientError";

export default class GembaseUtils {

    static getEmailDomain(email: string): string {
        const at = '@'
        if (!email.includes(at)) {
            throw new ClientError(`Invalid email: ${email}`);
        }
        const atIndex = email.indexOf(at)
        return email.substring(atIndex + 1);
    }

    static insert<T>(arr: T[], item: T, index: number) {
        const tmpArr = [
            ...arr.slice(0, index),
            item,
            ...arr.slice(index)
        ];
        arr.length = 0;
        arr.push(...tmpArr);
    }

    static roundPrice(x: number) {
        if (x > 1000) {
            return Math.floor(x);
        }
        if (x == 0) {
            return 0;
        }
        let f = Math.floor(x);
        if (f < x) {
            f = f + 1 - 0.01;
        }
        return f;
    }

    static round(x: number, digits = 0) {
        return parseFloat(x.toFixed(digits));
    }

    static copy<T>(data: T): T {
        return JSON.parse(JSON.stringify(data)) as T;
    }

    static async sleep(ms: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static serverTimestamp(): number {
        return Date.now() / 1000;
    }

    static clientTimestamp(): number {
        return Date.now();
    }

    static currentYear(): number {
        const d = new Date();
        return d.getUTCFullYear();
    }

    static deltaSecondsFormat(deltaSeconds: number | undefined, always_hours = false, hideLetters = false) {
        if (deltaSeconds === undefined) {
            return "";
        }

        const hours   = Math.floor(deltaSeconds / 3600);
        const minutes = Math.floor((deltaSeconds - (hours * 3600)) / 60);
        const seconds = deltaSeconds - (hours * 3600) - (minutes * 60);

        const res: string[] = [];

        const h = hideLetters ? "" : "h";
        const m = hideLetters ? "" : "m";
        const s = hideLetters ? "" : "s";

        if (always_hours || hours > 0) {
            res.push(hours < 10 ? `0${hours}${h}` : `${hours}${h}`);
        }
        res.push(minutes < 10 ? `0${minutes}${m}` : `${minutes}${m}`);
        res.push(seconds < 10 ? `0${seconds}${s}` : `${seconds}${s}`);

        return res.join(":");
    }

    static serverTimestampToInputElementDate(timestamp: number | undefined | null) {
        if (timestamp === undefined || timestamp === null) {
            return "";
        }
        const date = GembaseUtils.serverTimestampToDate(timestamp);
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const res = `${date.getUTCFullYear()}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;
        return res;
    }

    static inputElementDateToServerTimestamp(dateStr: string) {
        const arr = dateStr.split("-");
        const timestamp = Date.UTC(parseInt(arr[0]), parseInt(arr[1]) - 1, parseInt(arr[2]));
        return timestamp / 1000;
    }

    static timestampToDate(timestamp: number | undefined): string {
        if (timestamp === undefined) {
            return "";
        }
        const date = new Date(Math.round(timestamp) * 1000);
        return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ", "+ date.toDateString();
    }

    static serverTimestampToDate(timestamp: number) {
        return new Date(Math.round(timestamp) * 1000);
    }

    static timestampDaysDiff(timestamp: number | null | undefined): number | undefined {
        if (timestamp === null || timestamp === undefined) {
            return undefined;
        }

        let diffMs = Date.now() - (timestamp * 1000);
        diffMs = diffMs / 1000 / 60 / 60 / 24;
        return Math.round(diffMs);
    }

    static timestampToShortDateTime(timestamp: number | null | undefined): string {
        if (timestamp === null || timestamp === undefined) {
            return "";
        }
        const date = new Date(Math.round(timestamp) * 1000);
        return `${date.getUTCDate().toString().padStart(2, "0")}.${(date.getUTCMonth() + 1).toString().padStart(2, "0")}.${date.getUTCFullYear()} ${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}:${date.getUTCSeconds().toString().padStart(2, "0")}`
    }

    static timestampToShortDate(timestamp: number | null | undefined): string {
        if (timestamp === null || timestamp === undefined) {
            return "";
        }
        const date = new Date(Math.round(timestamp) * 1000);
        return `${date.getUTCDate().toString().padStart(2, "0")}.${(date.getUTCMonth() + 1).toString().padStart(2, "0")}.${date.getUTCFullYear()}`
    }

    static unsecuredCopyToClipboard(text: string): void {
        const textArea: HTMLTextAreaElement = document.createElement("textarea") as HTMLTextAreaElement;

        document.body.appendChild(textArea);

        textArea.value = text;
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy')
        } catch(err) {
            console.error('Unable to copy to clipboard',err)
        }

        document.body.removeChild(textArea)
    }

    /**
     * Copies the text passed as param to the system clipboard
     * Check if using HTTPS and navigator.clipboard is available
     * Then uses standard clipboard API, otherwise uses fallback
     */
    static copyToClipboard(content: string) {
        if (window.isSecureContext && navigator.clipboard) {
            navigator.clipboard.writeText(content);
        } else {
            this.unsecuredCopyToClipboard(content);
        }
    }

    static async pasteFromClipboard(): Promise<string> {
        return await navigator.clipboard.readText();
    }

    static copyUrlToClipboard(url: string | undefined = undefined) {
        if (url === undefined) {
            url = window.location.href;
        }
        this.copyToClipboard(url);
    }

    static getRootUrl() {
        return location.protocol + '//' + location.host;
    }

    static getUrlWithoutParameters(pathname: string | undefined = "") {
        if (pathname === "" || pathname === undefined)
            return location.protocol + '//' + location.host + location.pathname;
        return location.protocol + '//' + location.host + pathname;
    }

    static encodeData(data: any): string {
        return btoa(JSON.stringify(data));
    }

    static compressData(data: any) {
        const data_json: string = JSON.stringify(data);
        const compressed: string = LZString.compressToEncodedURIComponent(data_json);
        return compressed;
    }

    static decompressData(data: string): any {
        const decompressed: string = LZString.decompressFromEncodedURIComponent(data);
        const data_json: string = JSON.parse(decompressed);
        return data_json;
    }

    static copyLink(getParameters: string) {
        const link: string = this.getUrlWithoutParameters() + getParameters;
        this.copyToClipboard(link);
    }

    static findGetParameter(parameterName: string): string | null {
        let result: string | null = null;
        let tmp: string[];

        location.search
            .substring(1)
            .split("&")
            .forEach(function (item) {
                tmp = item.split("=");
                if (tmp[0] === parameterName) {
                    result = decodeURIComponent(tmp[1]);
                }
            });

        return result;
    }

    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    static randomFromArray<T>(arr: Array<T>): T | undefined {
        if (arr.length === 0) {
            return undefined;
        }
        return arr[GembaseUtils.getRandomInt(0, arr.length)];
    }

    static shuffle(array: any[]) {
        let currentIndex = array.length,  randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    static isValidEmail(email: string | undefined): boolean {
        if (email === undefined) {
            return false;
        }
        const re = /^\S+@\S+\.\S+$/;
        return re.test(email);
    }

    static colorHexToCss(c: number): string {
        const r = c >> 16;
        const g = (c >> 8) & 0xff;
        const b = c & 0xff;

        return `#${GembaseUtils.pad(r.toString(16), 2)}${GembaseUtils.pad(g.toString(16), 2)}${GembaseUtils.pad(b.toString(16), 2)}`;
    }

    static colorCssToNumber(c: string): number {
        c = c.replaceAll("#", "");
        const r = parseInt(c[0] + c[1], 16);
        const g = parseInt(c[2] + c[3], 16);
        const b = parseInt(c[4] + c[5], 16);

        return (r << 16) | (g << 8) | b;
    }

    static colorNumberToRGB(c: number): [number, number, number] {
        const r = c >> 16;
        const g = (c >> 8) & 0xff;
        const b = c & 0xff;

        return [r, g, b];
    }

    static pad(s: string, n: number): string {
        let res = s;
        for (let i = s.length; i < n; ++i) {
            res = "0" + res;
        }
        return res;
    }

    static formatRating(value: number | undefined): string {
        if (value === undefined) {
            return "";
        }
        value /= 20;
        return `${value.toFixed(1)} / 5`;
    }

    static numberWithSeparator(x: number | undefined, separator = ",") {
        if (x === undefined) {
            return undefined;
        }
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }

    static formatNumber(value: number | undefined, maxM = true): string {
        if (value === undefined) {
            return "";
        }
        let sign = "";

        if (value < 0) {
            sign = "-";
        }
        if (value === 0) {
            return "0";
        }

        value = Math.abs(value);

        const M = 1000 * 1000;
        const B = 1000 * 1000 * 1000;

        if (value < 1000) {
            return sign + value.toString();
        }
        else if (value < M) {
            value = Math.round(value / 1000);
            if (value > 100) {
                value = Math.round(value / 10) * 10;
            }
            return sign + value.toString() + "k";
        }
        else if (maxM || value < B) {
            value = Math.round(value / M);
            if (value > 100) {
                value = Math.round(value / 10) * 10;
            }
            return sign + value.toString() + "M";
        }
        else {
            value = Math.round(value / B);
            if (value > 100) {
                value = Math.round(value / 10) * 10;
            }
            return sign + value.toString() + "B";
        }
    }

    static formatPercent(value: number | undefined): string {
        if (value === undefined) {
            return "";
        }
        return `${Math.round(value * 100)}%`;
    }

    static formatAge(valueFrom: number | undefined, valueTo: number | undefined): string {
        if (valueFrom === undefined || valueTo === undefined) {
            return "";
        }
        return `${valueFrom} - ${valueTo} yo`;
    }

    static formatLTV(value: number | undefined): string {
        if (value === undefined) {
            return "";
        }
        return `$${value} D30 LTV`;
    }

    static arrLast<T>(arr: T[]): T {
        return arr[arr.length - 1];
    }

    static upperFirst(str: string): string {
        return str[0].toUpperCase() + str.substring(1);
    }

    static loadScriptText(text: string, insertAsFirst = false) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.text = text;
        if (insertAsFirst) {
            const firstChild = document.getElementsByTagName("head")[0].firstChild;
            document.getElementsByTagName("head")[0].insertBefore(script, firstChild);
        } else {
            document.getElementsByTagName("head")[0].appendChild(script);
        }
    }

    static loadScript(src: string, onLoad: (() => void) | null = null, insertAsFirst = false) {
        const script = document.createElement("script");
        if (onLoad !== null) {
            script.onload = onLoad;
        }

        script.async = true;
        script.defer = true;

        script.src = src;
        if (insertAsFirst) {
            const firstChild = document.getElementsByTagName("head")[0].firstChild;
            document.getElementsByTagName("head")[0].insertBefore(script, firstChild);
        } else {
            document.getElementsByTagName("head")[0].appendChild(script);
        }
    }

    static getBuildVersionAndTime(): {
        version: string;
        time: string;
    } | null {
        const buildVersion: string | undefined = process.env.GB_BUILD_VERSION;
        const buildTime: string | undefined = process.env.GB_BUILD_TIMESTAMP;

        if (buildTime !== undefined && buildVersion !== undefined) {
            return {
                version: buildVersion,
                time: buildTime
            }
        }

        return null;
    }

    static median(arr: number[]): number {
        if (arr.length === 0) {
            return 0;
        }
        if (arr.length === 1) {
            return arr[0];
        }

        const mid = Math.floor(arr.length / 2);
        const sortedArr = [...arr];
        sortedArr.sort((a, b) => a - b);

        if (arr.length % 2 === 0) {
            return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
        } else {
            return sortedArr[mid];
        }
    }

    static toggleArr<T>(arr: T[] | null | undefined, item: T) {
        if (arr !== null && arr !== undefined) {
            if (arr.includes(item)) {
                GembaseUtils.removeFromArr(arr, item);
            } else {
                GembaseUtils.addToArrUnique(arr, item);
            }
        }
    }

    static removeFromArr<T>(arr: T[] | null | undefined, item: T): T[] | null | undefined {
        if (arr === null) {
            return arr;
        }
        if (arr === undefined) {
            return arr;
        }
        if (arr.includes(item)) {
            const ix = arr.indexOf(item);
            arr.splice(ix, 1);
        }

        return arr;
    }

    static addToArrUnique<T>(arr: T[], item: T): T[] {
        if (!arr.includes(item)) {
            arr.push(item);
        }

        return arr;
    }

    static compareArr<T>(arr1: T[], arr2: T[]) {
        if (arr1.length != arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; ++i) {
            if (!arr2.includes(arr1[i])) {
                return false;
            }
        }
        for (let i = 0; i < arr2.length; ++i) {
            if (!arr1.includes(arr2[i])) {
                return false;
            }
        }
        return true;
    }

    static compareObjObj(obj1: object | null | undefined, obj2: object | null | undefined) {
        if (obj1 === undefined) {
            obj1 = null;
        }
        if (obj2 === undefined) {
            obj2 = null;
        }
        if (obj1 != null && obj2 == null) {
            return false;
        } else if (obj1 == null && obj2 != null) {
            return false;
        } else if (obj1 != null && obj2 != null) {
            const obj1json = JSON.stringify(obj1);
            const obj2json = JSON.stringify(obj2);

            return obj1json === obj2json;
        }
        return true;
    }

    static compareStrStr(obj1: string | null | undefined, obj2: string | null | undefined) {
        if (obj1 != null && obj2 == null) {
            return false;
        } else if (obj1 == null && obj2 != null) {
            return false;
        } else if (obj1 != null && obj2 != null) {
            return obj1 === obj2;
        }
        return true;
    }

    static toJsonSafe(obj: object | null | undefined): string | null {
        if (obj === null || obj === undefined) {
            return null;
        }
        return JSON.stringify(obj);
    }

    /**
     * Returns a hash code from a string
     * @param  {String} str The string to hash.
     * @return {Number}    A 32bit integer
     * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
     */
    static hashCode(str: string) {
        let hash = 0;
        for (let i = 0, len = str.length; i < len; i++) {
            const chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    static guid(): string {
        return crypto.randomUUID();
    }

    static copyright(): string {
        return `© ${GembaseUtils.currentYear()} Gembase.io, s.r.o.`;
    }

    static getApiUrl(): string {
        return import.meta.env.VITE_APP_API_URL;
    }

    static mapGet<T, U>(map: Map<T, U>, key: T): U {
        const res = map.get(key);
        if (res === undefined) {
            throw new ClientError(`Key not found in map`);
        }
        return res;
    }

    static parseNumberSafe(val?: string | null): number | undefined {
        if (val === undefined || val === null || val === "") {
            return undefined;
        }
        return parseInt(val);
    }

    static isNotEmptyString(str: string | undefined | null): boolean {
        if (str === undefined || str === null) {
            return false;
        }

        if (str.trim() === "") {
            return false;
        }

        return true;
    }

    static interpolateColor(colorFrom: string, colorTo: string, ratio: number): string {
        const rgb1 = GembaseUtils.colorCssToNumber(colorFrom);
        const rgb2 = GembaseUtils.colorCssToNumber(colorTo);

        const [r1, g1, b1] = GembaseUtils.colorNumberToRGB(rgb1);
        const [r2, g2, b2] = GembaseUtils.colorNumberToRGB(rgb2);

        const q = 1-ratio;
        const rr = Math.round(r1 * ratio + r2 * q);
        const rg = Math.round(g1 * ratio + g2 * q);
        const rb = Math.round(b1 * ratio + b2 * q);

        const res = `#${rr.toString(16).padStart(2, "0")}${rg.toString(16).padStart(2, "0")}${rb.toString(16).padStart(2, "0")}`;
        return res;
    }

}
