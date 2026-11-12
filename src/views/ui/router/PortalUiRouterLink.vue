<script setup lang="ts">
import { type LocationQueryRaw, type RouteLocationRaw } from 'vue-router'
import { computed } from 'vue'
import router from '@/router'
import type { IQuery } from '@/router/queryModelComposable'

const props = defineProps<{
    path?: string
    query?: string
    queryRecords?: IQuery
    to?: RouteLocationRaw
    disabled?: boolean
    replace?: boolean
    replaceIfSamePage?: boolean
    href?: string
}>()

const finalTo = computed((): RouteLocationRaw => {
    if (props.to != null) {
        return props.to
    }

    const route: {
        path: string
        query: LocationQueryRaw
    } = {
        path: '',
        query: {},
    }

    if (props.path != null) {
        route.path = props.path
    }
    if (props.queryRecords != null) {
        for (const [key, value] of Object.entries(props.queryRecords)) {
            console.log(`${key}: ${value}`)
            if (value != null) {
                route.query[key] = value
            } else {
                delete route.query[key]
            }
        }
    }
    return route
})

const finalReplace = computed(() => {
    if (props.replace) {
        return true
    }
    if (props.replaceIfSamePage) {
        if (router.currentRoute.value.path === props.path) {
            return true
        }
    }
    return false
})
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
