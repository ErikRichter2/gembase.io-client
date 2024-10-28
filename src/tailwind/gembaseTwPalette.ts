import {TwNamedColor, TwRawColor} from "./gembaseTwData";

export enum GB_PALETTE {
    WHITE = "#ffffff",
    GRAY_800 = "#cdcdcd",
    GRAY_750 = "#b7b7b7",
    GRAY_700 = "#929292",
    GRAY_600 = "#606060",
    GRAY_500 = "#434343",
    GRAY_300 = "#333333",
    BLACK = "#000000",
    DIM_MAGENTA = "#d3277c",
    MAGENTA = "#ff00ff",
    ORANGE = "#ffb204",
    YELLOW = "#ffdb00",
    YELLOW_GOLD = "#cce944",
    GREEN_GEM = "#00f199",
    OCEAN = "#00d5d5",
    DIM_OCEAN = "#00afaf",
    CHART_BLUE = "#98a4d7",
    LIGHT_VIOLET = "#8e7cc3",
    VIOLET_BLUE = "#9900ff",
    VIOLET = "#674ea7",
    VIOLET_GRAY = "#565674",
    DARK_VIOLET = "#534078",
    NIGHT_VIOLET_LIGHT = "#37305f",
    NIGHT_VIOLET = "#221836",
    DARK_BLUE = "#222432",
    NIGHT_VIOLET_DARK = "#151521",
}

export const gembaseColorConfig: TwNamedColor[] = [
    new TwNamedColor(["primary", "orange"], GB_PALETTE.ORANGE, {
        textColor: TwRawColor.fromHex(GB_PALETTE.BLACK),
        glow: TwRawColor.fromHex(GB_PALETTE.YELLOW, 50)
    }),
    new TwNamedColor(["secondary", "violet"], GB_PALETTE.VIOLET, {
        glow: TwRawColor.fromHex(GB_PALETTE.MAGENTA, 75),
        selected: TwRawColor.fromHex(GB_PALETTE.LIGHT_VIOLET),
    }),
    new TwNamedColor(["alert", "magenta"], GB_PALETTE.MAGENTA, {
        glow: TwRawColor.fromHex(GB_PALETTE.MAGENTA, 100)
    }),
    new TwNamedColor(["node", "dark-violet"], GB_PALETTE.DARK_VIOLET, {
        glow: TwRawColor.fromHex(GB_PALETTE.MAGENTA, 75),
        selected: TwRawColor.fromHex(GB_PALETTE.LIGHT_VIOLET),
    }),
    new TwNamedColor("light-violet", GB_PALETTE.LIGHT_VIOLET),
    new TwNamedColor("yellow", GB_PALETTE.YELLOW),
    new TwNamedColor("ocean", GB_PALETTE.OCEAN),
    new TwNamedColor("dim-ocean", GB_PALETTE.DIM_OCEAN),
    new TwNamedColor("dim-magenta", GB_PALETTE.DIM_MAGENTA),
    new TwNamedColor("dark-blue", GB_PALETTE.DARK_BLUE),
    new TwNamedColor("violet-blue", GB_PALETTE.VIOLET_BLUE),
    new TwNamedColor("night-violet", GB_PALETTE.NIGHT_VIOLET),
    new TwNamedColor("night-violet-light", GB_PALETTE.NIGHT_VIOLET_LIGHT),
    new TwNamedColor("night-violet-dark", GB_PALETTE.NIGHT_VIOLET_DARK),
    new TwNamedColor("violet-gray", GB_PALETTE.VIOLET_GRAY),
    new TwNamedColor("gray-300", GB_PALETTE.GRAY_300, {
        naTextColor: true
    }),
    new TwNamedColor("gray-500", GB_PALETTE.GRAY_500),
    new TwNamedColor("gray-600", GB_PALETTE.GRAY_600),
    new TwNamedColor("gray-700", GB_PALETTE.GRAY_700),
    new TwNamedColor("gray-750", GB_PALETTE.GRAY_750),
    new TwNamedColor("gray-800", GB_PALETTE.GRAY_800),
    new TwNamedColor("black", GB_PALETTE.BLACK),
    new TwNamedColor("white", GB_PALETTE.WHITE, {
        defaultTextColor: true
    }),
    new TwNamedColor("na", GB_PALETTE.GRAY_750, {
        glow: TwRawColor.fromHex(GB_PALETTE.GRAY_750, 40),
        isNA: true
    })
];
