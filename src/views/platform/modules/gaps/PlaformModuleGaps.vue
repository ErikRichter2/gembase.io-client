<script setup lang="ts">

import GapsSearch from "@/views/platform/modules/gaps/__components/GapsSearch.vue";
import GapsResults from "@/views/platform/modules/gaps/__components/GapsResults.vue";
import {useRouterQuery} from "@/core/router/query/RouterQueryComposable";
import {GapsQueryParams} from "@/models/portal/gaps/GapsQueryParams";

const routerQuery = useRouterQuery<GapsQueryParams>();

</script>

<template>
    <gaps-results v-if="routerQuery.query.value.show === 'results'"></gaps-results>
    <gaps-search v-else></gaps-search>
</template>
