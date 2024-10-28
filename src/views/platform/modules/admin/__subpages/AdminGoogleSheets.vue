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
                        <td><a :href="'https://docs.google.com/spreadsheets/d/' + item.sheet_id" target="_blank">{{item.name}}</a></td>
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

import {onMounted, ref} from "vue";
import EndpointRequest from "@/core/requests/EndpointRequest";
import {useFullscreenLoading} from "@/models/ui/FullscreenLoadingComposable";

const fullscreenLoading = useFullscreenLoading();

interface SheetData {
    name: string,
    sheet_id: string,
    dms_guid: string
}
const sheets = ref<SheetData[]>([]);

onMounted(async () => {
    fullscreenLoading.show();
    await EndpointRequest.process2<SheetData[]>("admin:get_sheets").then((response) => {
        sheets.value = response;
    });
    fullscreenLoading.hide();
});

async function update(data: SheetData) {
    fullscreenLoading.show();
    await EndpointRequest.process2("admin:update_dms_from_sheet", {
        name: data.name,
        update_sheet: true
    });
    fullscreenLoading.hide();
}

async function refresh(data: SheetData) {
    fullscreenLoading.show();
    await EndpointRequest.process2("admin:update_dms_from_sheet", {
        name: data.name,
        update_sheet: false
    });
    fullscreenLoading.hide();
}

</script>
