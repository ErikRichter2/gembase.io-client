import {IQueryData} from "@/core/router/query/QueryData";
import {useRouterStore} from "@/core/router/RouterStore";
import {computed} from "vue";

export function useRouterQuery<T extends IQueryData>() {

    const __routerStore = useRouterStore();

    const query = computed(() => {
        return __routerStore.currentRoute.value.query as T
    });

    const replace = async (data: T) => {
        await __routerStore.setQueryData(data, {replace: true});
    }

    const merge = async (data: T) => {
        const res: IQueryData = {};

        for (const k in query.value) {
            res[k] = query.value[k];
        }

        for (const k in data) {
            const val = data[k];
            if (val !== undefined) {
                res[k] = val;
            }
        }

        await replace(res as T);
    }

    const push = async (data: T) => {
        await __routerStore.setQueryData(data);
    }

    const remove = async (data: T) => {
        const toRemove: string[] = [];
        for (const k in data) {
            if (data[k] === undefined) {
                toRemove.push(k);
            }
        }
        await __routerStore.removeQueryKey(toRemove);
    }

    const getMerge = (data: T) => {
        return __routerStore.getMergeQueryWithCurrent(data);
    }

    return {query, replace, push, getMerge, remove, merge}
}