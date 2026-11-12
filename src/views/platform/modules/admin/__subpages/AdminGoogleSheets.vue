<template>
    <div class="w-full h-full">
        <div class="w-full h-full">
            <table class="table">
                <thead>
                    <tr>
                        <th>Sheet</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="item in sheets" :key="item.name">
                        <tr>
                            <td>
                                <a
                                    :href="
                                        'https://docs.google.com/spreadsheets/d/' + item.sheet_id
                                    "
                                    target="_blank"
                                    >{{ item.name }}</a
                                >
                            </td>
                            <td>
                                <button @click="update(item)">Update</button>
                            </td>
                            <td>
                                <button @click="refresh(item)">Refresh</button>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFullscreenLoading } from '@/models/ui/FullscreenLoadingComposable'
import { adminCommands, type ISheetData } from '@/commands/adminCommands'

const fullscreenLoading = useFullscreenLoading()

const sheets = ref<ISheetData[]>([])

onMounted(async () => {
    fullscreenLoading.show()
    sheets.value = await adminCommands.getSheets()
    fullscreenLoading.hide()
})

async function update(data: ISheetData) {
    fullscreenLoading.show()
    await adminCommands.updateDmsFromSheet({
        name: data.name,
        update_sheet: true,
    })
    fullscreenLoading.hide()
}

async function refresh(data: ISheetData) {
    fullscreenLoading.show()
    await adminCommands.updateDmsFromSheet({
        name: data.name,
        update_sheet: false,
    })
    fullscreenLoading.hide()
}
</script>
