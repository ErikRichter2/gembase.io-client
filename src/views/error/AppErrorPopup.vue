<script setup lang="ts">
import { errorDataView } from '@/main'
import GbPopup from '../ui/popups/GbPopup.vue'
import { defaultErrorMessage } from '@/errors/errorHandlerComposable'
import { appEnv } from '@/appEnv.ts'
</script>

<template>
    <GbPopup v-if="errorDataView !== undefined" :fixed="true" type="error">
        <div v-if="appEnv.isDev"></div>
        <div v-if="errorDataView.publicError !== undefined">
            <div>{{ errorDataView.publicError.message }}</div>
        </div>
        <div v-else-if="errorDataView.serverError !== undefined" class="text-sm">
            <div>Server Error</div>
            <div>Id: {{ errorDataView.serverError?.id }}</div>
            <div>Command: {{ errorDataView.serverError?.last_command_id }}</div>
            <div>Message: {{ errorDataView.serverError?.message }}</div>
            <div>Callstack: {{ errorDataView.serverError?.call_stack }}</div>
        </div>
        <div v-else>
            <div>{{ defaultErrorMessage }}</div>
        </div>
    </GbPopup>
</template>
