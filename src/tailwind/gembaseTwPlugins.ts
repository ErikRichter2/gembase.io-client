import {GB_PALETTE, gembaseColorConfig} from "./gembaseTwPalette";
import {TwNamedColor, TwRawColor} from "./gembaseTwData";

export default [
    ({ addUtilities, matchUtilities }) => {
        addUtilities(__layouts);

        addUtilities(__generateButtonsColors());

        const {glowUtilities, glowMatchUtilities} = __generateGlows();
        addUtilities(glowUtilities);
        matchUtilities(glowMatchUtilities);
    }
]

function __generateButtonsColors() {
    const res = {};

    const defaultTextColor = gembaseColorConfig.find((x) => x.options?.defaultTextColor === true);
    const naTextColor = gembaseColorConfig.find((x) => x.options?.naTextColor === true);

    const colors = [...gembaseColorConfig, ...[
        new TwNamedColor("admin", TwRawColor.fromHex(GB_PALETTE.WHITE), {
            textColor: TwRawColor.fromHex(GB_PALETTE.BLACK)
        }),
        new TwNamedColor("transparent", TwRawColor.fromHex(GB_PALETTE.WHITE, 0), {
            selected: TwRawColor.fromHex(GB_PALETTE.WHITE, 10),
            hover: TwRawColor.fromHex(GB_PALETTE.WHITE, 20)
        }),
        new TwNamedColor("transparent-10", TwRawColor.fromHex(GB_PALETTE.WHITE, 10), {
            selected: TwRawColor.fromHex(GB_PALETTE.WHITE, 30),
            hover: TwRawColor.fromHex(GB_PALETTE.WHITE, 20)
        })
    ]];

    colors.forEach((x) => {
        x.names.forEach((colorName) => {
            const className = `.gbc-bg-${colorName}`;
            res[className] = {
                backgroundColor: x.color.toCssRgb(),
                color: x.options?.textColor?.toHexWithoutAlpha() ?? defaultTextColor?.color.toHexWithoutAlpha()
            }
            res[`${className}[data-semi-transparent="true"]`] = {
                opacity: 0.5,
            }
            if (x.options?.selected !== undefined) {
                res[`${className}[data-selected="true"]`] = {
                    backgroundColor: x.options.selected.toCssRgb(),
                }
            }

            let hoverCss;
            if (x.options?.hover !== undefined) {
                hoverCss = {
                    backgroundColor: x.options.hover.toCssRgb()
                }
            } else {
                hoverCss = {
                    "--tw-brightness": "brightness(125%)",
                }
            }

            let glowFilter: object | undefined  = undefined;
            if (x.options?.glow !== undefined) {
                glowFilter = {
                    "--tw-gb-glow-size": "25px",
                    "--tw-drop-shadow": `drop-shadow(0 0 var(--tw-gb-glow-size) ${x.options.glow.toCssRgb()})`
                }
            }

            const filterCss = {
                "filter": "var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)"
            };

            res[`${className}[data-interactive]:hover`] = {
                ...hoverCss, ...filterCss
            }
            res[`${className}[data-interactive][data-glow="true"]:hover`] = {
                ...hoverCss, ...glowFilter, ...filterCss
            }
            res[`${className}[data-glow="true"]:not([data-selected="false"])`] = {
                ...glowFilter, ...filterCss
            }
            res[`${className}[data-interactive][data-glow="true"]:not([data-selected="false"]):hover`] = {
                ...hoverCss, ...glowFilter, ...filterCss
            }

            const colorNA = gembaseColorConfig.find((x) => x.options?.isNA === true);
            if (colorNA !== undefined) {
                hoverCss = {
                    "--tw-brightness": "brightness(100%)"
                }
                glowFilter = {
                    "--tw-gb-glow-size": "25px",
                    "--tw-drop-shadow": `drop-shadow(0 0 var(--tw-gb-glow-size) ${colorNA.options?.glow?.toCssRgb()})`
                }
                res[`${className}[data-na="true"]`] = {
                    backgroundColor: colorNA.color.toCssRgb(),
                    color: naTextColor?.color.toHexWithoutAlpha()
                }
                res[`${className}[data-na="true"][data-interactive]:hover`] = {
                    ...hoverCss, ...filterCss
                }
                res[`${className}[data-na="true"][data-glow="true"]`] = {
                    ...hoverCss, ...glowFilter, ...filterCss
                }
                res[`${className}[data-na="true"][data-interactive][data-glow="true"]:hover`] = {
                    ...hoverCss, ...glowFilter, ...filterCss
                }
            }
        });
    });

    return res;
}

function __generateGlows() {
    const glowUtilities = {};

    const classPrefix = ".gb-glow-"

    gembaseColorConfig.forEach((x) => {
        x.names.forEach((colorName) => {
            glowUtilities[`${classPrefix}${colorName}`] = {
                "--tw-gb-glow-opacity": "100%",
                "--tw-gb-glow-size": "25px",
                "--tw-gb-glow-color": x.color.toCssRgbOverrideAlpha("var(--tw-gb-glow-opacity)"),
                "--tw-drop-shadow": "drop-shadow(0 0 var(--tw-gb-glow-size) var(--tw-gb-glow-color))",
                filter: "var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)"
            }
        });
    });

    [25, 50, 75, 100].forEach((x) => {
        glowUtilities[`${classPrefix}opacity-${x}`] = {
            "--tw-gb-glow-opacity": `${x}%`
        }
    });

    const sizes = {
        "sm": "20px",
        "md": "25px",
        "lg": "30px",
    }

    for (const sizeName in sizes) {
        glowUtilities[`${classPrefix}size-${sizeName}`] = {
            "--tw-gb-glow-size": `${sizes[sizeName]}`
        }
    }

    const glowMatchUtilities = {
        'gb-glow-size': (value) => {
            return {
                "--tw-gb-glow-size": value,
            }
        },
    }

    return {glowUtilities, glowMatchUtilities};
}

const __layouts = {
    '.gb-layout-tl':        {'@apply flex flex-col justify-start items-start': {}},
    '.gb-layout-tc':        {'@apply flex flex-col justify-start items-center': {}},
    '.gb-layout-tr':        {'@apply flex flex-col justify-start items-end': {}},
    '.gb-layout-ml':        {'@apply flex flex-col justify-center items-start': {}},
    '.gb-layout':           {'@apply flex flex-col justify-center items-center': {}},
    '.gb-layout-mr':        {'@apply flex flex-col justify-center items-end': {}},
    '.gb-layout-bl':        {'@apply flex flex-col justify-end items-start': {}},
    '.gb-layout-bc':        {'@apply flex flex-col justify-end items-center': {}},
    '.gb-layout-br':        {'@apply flex flex-col justify-end items-end': {}},
    '.gb-layout-tl-row':    {'@apply flex flex-row justify-start items-start': {}},
    '.gb-layout-ml-row':    {'@apply flex flex-row justify-start items-center': {}},
    '.gb-layout-bl-row':    {'@apply flex flex-row justify-start items-end': {}},
    '.gb-layout-tc-row':    {'@apply flex flex-row justify-center items-start': {}},
    '.gb-layout-row':       {'@apply flex flex-row justify-center items-center': {}},
    '.gb-layout-bc-row':    {'@apply flex flex-row justify-center items-end': {}},
    '.gb-layout-tr-row':    {'@apply flex flex-row justify-end items-start': {}},
    '.gb-layout-mr-row':    {'@apply flex flex-row justify-end items-center': {}},
    '.gb-layout-br-row':    {'@apply flex flex-row justify-end items-end': {}},
    '.gb-layout-l-between': {'@apply flex flex-col justify-between items-start': {}},
    '.gb-layout-c-between': {'@apply flex flex-col justify-between items-center': {}},
    '.gb-layout-r-between': {'@apply flex flex-col justify-between items-end': {}},
    '.gb-layout-t-between': {'@apply flex flex-row justify-between items-start': {}},
    '.gb-layout-m-between': {'@apply flex flex-row justify-between items-center': {}},
    '.gb-layout-b-between': {'@apply flex flex-row justify-between items-end': {}},
    '.gb-layout-full': {'@apply w-full h-full': {}},
}

