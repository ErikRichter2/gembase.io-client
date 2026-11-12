import router from '@/router'
import GbUtils from '@/utils/GembaseUtils'
import { onMounted, ref, watch, type Ref } from 'vue'
import type { LocationQuery } from 'vue-router'

export interface IQuery {
    [key: string]: string | undefined
}

export function useQueryModel<T extends IQuery>(
    data: IQuery,
    onChange?: (params?: { currentQuery?: T; prevQuery?: T }) => void,
) {
    const query: Ref<T> = ref(data) as Ref<T>

    function __fromQueryToModel() {
        const routerQuery = router.currentRoute.value.query
        for (const [key, value] of Object.entries(router.currentRoute.value.query)) {
            if (value !== undefined && value !== null) {
                if (typeof value === 'string') {
                    ;(query as Ref<IQuery>).value[key] = value
                }
            }
        }

        if (onChange !== undefined) {
            onChange({
                currentQuery: GbUtils.copy(routerQuery) as T,
            })
        }
    }

    function __fromModelToQuery() {
        const currentRoute = router.currentRoute.value
        const prevQuery = GbUtils.copy(currentRoute.query)
        const routerQuery: LocationQuery = {}
        for (const [key, value] of Object.entries(currentRoute.query)) {
            if (query.value[key] !== undefined && query.value[key] !== null) {
                routerQuery[key] = value
            }
        }
        for (const [key, value] of Object.entries(GbUtils.copy(query.value))) {
            if (value !== undefined && value !== null) {
                routerQuery[key] = value.toString()
            }
        }

        router.replace({ path: currentRoute.path, query: routerQuery })

        if (onChange !== undefined) {
            onChange({
                currentQuery: GbUtils.copy(routerQuery) as T,
                prevQuery: prevQuery as T,
            })
        }
    }

    onMounted(() => {
        __fromQueryToModel()
        __fromModelToQuery()
    })

    watch(
        () => query.value,
        () => __fromModelToQuery(),
        { deep: true },
    )

    watch(
        () => router.currentRoute.value,
        () => {
            __fromQueryToModel()
        },
        { deep: true },
    )

    return { query }
}
