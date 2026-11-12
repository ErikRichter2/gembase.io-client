<template>
    <div class="p-4 gb-layout-tl gap-2">
        <gb-button
            @click="onRebuild"
            :disabled="isActiveService !== undefined"
            class="gbc-bg-primary"
            text="Rebuild"
        ></gb-button>
        <table>
            <tr>
                <td>PID</td>
                <td>Status</td>
                <td>Step</td>
                <td>Started</td>
                <td>Ping</td>
            </tr>
            <tr v-for="service in services" :key="service.pid">
                <td>{{ service.pid }}</td>
                <td>{{ service.status }}</td>
                <td>
                    {{ service.service_data?.step_index }} / {{ service.service_data?.step_desc }}
                </td>
                <td>{{ GembaseUtils.timestampToShortDateTime(service.created) }}</td>
                <td>{{ GembaseUtils.timestampToShortDateTime(service.heartbeat) }}</td>
            </tr>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import GbButton from '@/views/ui/buttons/GbButton.vue'
import GembaseUtils from '@/utils/GembaseUtils'
import { useFullscreenLoading } from '@/models/ui/FullscreenLoadingComposable'
import { adminCommands, type IServiceData } from '@/commands/adminCommands'

const fullscreenLoading = useFullscreenLoading()

const services = ref<IServiceData[]>([])

let serviceTimer = 0

onMounted(async () => {
    fullscreenLoading.show()
    await getDataAsync()
    fullscreenLoading.hide()
    serviceTimer = window.setInterval(getDataAsync, 2 * 1000)
})

onUnmounted(() => {
    window.clearInterval(serviceTimer)
})

const isActiveService = computed(() => {
    return services.value.find((x) => x.finished === 0)
})

async function getDataAsync() {
    const response = await adminCommands.getServices()
    services.value.length = 0
    services.value = response.filter((x) => x.script.includes('platform_values_rebuild_service.py'))
}

async function onRebuild() {
    fullscreenLoading.show()
    await adminCommands.rebuildPlatformValues()
    services.value.length = 0
    for (let i = 0; i < 20; ++i) {
        if (services.value.length > 0 && isActiveService.value !== undefined) {
            break
        }
        await GembaseUtils.sleep(2 * 1000)
    }
    fullscreenLoading.hide()
}
</script>
