interface IColorOptions {
    textColor?: TwRawColor;
    glow?: TwRawColor;
    selected?: TwRawColor;
    hover?: TwRawColor;
    isNA?: boolean;
    defaultTextColor?: boolean;
    naTextColor?: boolean;
}

export class TwRawColor {
    r = 0;
    g = 0;
    b = 0;
    a = 100;

    constructor(r: number, g: number, b: number, a = 100) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static fromHex(color: string, a = 100) {
        color = color.replaceAll("#", "");
        if (color.length === 3) {
            color = `${color[0]}${color[0]}${color[1]}${color[1]}${color[2]}${color[2]}`;
        }
        const c = parseInt(color, 16);
        if (isNaN(c)) {
            throw new Error(`Unknown color ${color}`)
        }
        const r = c >> 16;
        const g = (c >> 8) & 0xff;
        const b = c & 0xff;
        return new TwRawColor(r, g, b, a);
    }

    toHexWithoutAlpha(): string {
        return `#${this.r.toString(16).padStart(2, "0")}${this.g.toString(16).padStart(2, "0")}${this.b.toString(16).padStart(2, "0")}`;
    }

    toCssRgb() {
        return `rgb(${this.r} ${this.g} ${this.b} / ${this.a}%)`;
    }

    toCssRgbOverrideAlpha(overrideAlpha: string) {
        return `rgb(${this.r} ${this.g} ${this.b} / ${overrideAlpha})`;
    }
}

export class TwNamedColor {
    names: string[];
    color: TwRawColor;
    options: IColorOptions | undefined;

    constructor(
        names: string | string[],
        color: TwRawColor | string,
        options: IColorOptions | undefined = undefined
    ) {
        if (!(names instanceof Array)) {
            this.names = [names];
        } else {
            this.names = names;
        }
        if (typeof color === "string") {
            this.color = TwRawColor.fromHex(color);
        } else {
            this.color = color;
        }

        this.options = options;
    }
}
