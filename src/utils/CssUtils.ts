export default class CssUtils {
    static getCssVariableValue(variableName) {
        try {
            let hex = getComputedStyle(document.documentElement).getPropertyValue(variableName);
            if ( hex && hex.length > 0 ) {
                hex = hex.trim();
            }
            return hex;
        } catch {
            return "";
        }
    }
}