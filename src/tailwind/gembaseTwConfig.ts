import {gembaseColorConfig} from "./gembaseTwPalette";
import gembaseTwPlugins from "./gembaseTwPlugins";

const __colors = {
    "current": "currentcolor",
    "transparent": "transparent",
    "inherit": "inherit"
};

gembaseColorConfig.forEach((x) => {
    x.names.forEach((y) => {
        __colors[y] = x.color.toHexWithoutAlpha();
    });
});

export default {
    content: [
        './src/**/*.{js,jsx,ts,tsx,vue}',
    ],
    theme: {
        extend: {
            borderRadius: {
                inherit: "inherit",
                circle: "50%"
            },
            screens: {
                "cl": {"raw": "(min-height: 1000px) or (max-width: 800px)"}
            },
            maxHeight: {
                inherit: "inherit"
            }
        },
        colors: __colors
    },
    plugins: gembaseTwPlugins,
}
