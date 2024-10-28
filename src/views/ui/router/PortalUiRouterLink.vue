<script setup lang="ts">
import {RoutesEnum} from "@/router/RoutesEnum";
import {LocationQueryRaw, RouteLocationRaw} from "vue-router";
import {computed} from "vue";
import {useRouterStore} from "@/core/router/RouterStore";

const props = defineProps<{
    name?: RoutesEnum;
    query?: LocationQueryRaw;
    to?: RouteLocationRaw;
    disabled?: boolean;
    replace?: boolean;
    replaceIfSamePage?: boolean;
    href?: string;
}>();

const finalTo = computed((): RouteLocationRaw => {
    if (props.to !== undefined) {
        return props.to;
    }

    const res: RouteLocationRaw = {};

    if (props.name !== undefined) {
        res["name"] = props.name;
    }
    if (props.query !== undefined) {
        res["query"] = props.query;
    }
    return res;
});

const finalReplace = computed(() => {
    if (props.replace) {
        return true;
    }
    if (props.replaceIfSamePage) {
        if (useRouterStore().isCurrentRoute(props.name)) {
            return true;
        }
    }
    return false;
});

</script>

<template>
    <template v-if="disabled === true">
        <slot></slot>
    </template>
    <template v-else-if="href !== undefined">
        <a :href="href">
            <slot></slot>
        </a>
    </template>
    <template v-else>
        <router-link :to="finalTo" :replace="finalReplace">
            <slot></slot>
        </router-link>
    </template>
</template>
