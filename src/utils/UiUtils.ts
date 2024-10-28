export class UiUtils {

    public static WipImage = "/static/media/gembase/concept.jpg";

    static getIcon(name: string | undefined): string {
        if (name === undefined) {
            return "";
        }

        const ix = name.lastIndexOf(".")
        if (ix === -1) {
            name += ".svg"
        }
        return `/static/media/gembase/home/v2/icons/${name}`;
    }

    static getFlagIcon(country: string): string {
        return `/static/media/gembase/flags/${country.toLowerCase()}.svg`;
    }

}