<script setup lang="ts">

import {PortalConstants} from "@/models/portal/PortalConstants";
import {RoutesEnum} from "@/router/RoutesEnum";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import {useRouterStore} from "@/core/router/RouterStore";
import IGembaseRouteMeta from "@/router/IGembaseRouteMeta";

function getDesc() {
    const meta = useRouterStore().getCurrentRouteMeta<IGembaseRouteMeta>();
    if (meta?.moduleId !== undefined) {
        return PortalConstants.getModule(meta.moduleId).desc;
    }
    return "";
}

</script>

<template>
    <div class="gb-layout w-full h-full">
        <div class="gb-inner-window !p-7">
            <div class="gb-layout gap-5">
                <div class="text-[1.3em] font-bold">
                    {{useRouterStore().getCurrentRouteMeta<IGembaseRouteMeta>()?.title}} coming soon …
                </div>
                <div class="text-[0.8em]">
                    {{getDesc()}}
                </div>
                <router-link :to="useRouterStore().getRoutePath(RoutesEnum.PORTAL_GUIDE)">
                    <gb-button class="gbc-bg-primary" icon="home" text="Return home …"></gb-button>
                </router-link>
            </div>
        </div>
    </div>
</template>
