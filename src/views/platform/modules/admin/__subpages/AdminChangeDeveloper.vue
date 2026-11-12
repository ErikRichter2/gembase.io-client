<template>
    <div class="w-full h-full">
        <div class="w-full h-full">
            <div class="gb-layout-tl">
                <div>Current developer: {{ useSessionStore().userData.dev_detail.title }}</div>
            </div>
            <div class="gb-layout-tl-row gap-1">
                <div>Search:</div>
                <div class="w-[400px] h-[30px]">
                    <platform-developer-search
                        :include-concepts="true"
                        data-tooltip="Search developer"
                        placeholder="Enter company name"
                        @on-hint-selected="(data) => (selectedDev = data)"
                        class="w-full h-full"
                    ></platform-developer-search>
                </div>
            </div>
            <div class="gb-layout-tl-row gap-2">
                <gb-button @click="onConfirm" class="gbc-bg-secondary" text="Confirm"></gb-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GbButton from '@/views/ui/buttons/GbButton.vue'
import { type DeveloperHint } from '@/models/portal/PortalDataTypes'
import PlatformDeveloperSearch from '@/views/platform/modules/__components/PlatformDeveloperSearch.vue'
import { useFullscreenLoading } from '@/models/ui/FullscreenLoadingComposable'
import { portalCommands } from '@/commands/portalCommands'
import ClientError from '@/errors/clientError'
import { useSessionStore } from '@/stores/SessionStore'

const selectedDev = ref<DeveloperHint>()
const fullscreenLoading = useFullscreenLoading()

async function onConfirm() {
    fullscreenLoading.show()
    if (selectedDev.value === undefined) {
        throw new ClientError(`Developer not set`)
    }
    await portalCommands.setMyDeveloper({
        dev_id_in_store: selectedDev.value.dev_id_in_store,
        store: selectedDev.value.store,
    })
    window.location.reload()
    fullscreenLoading.hide()
}
</script>
