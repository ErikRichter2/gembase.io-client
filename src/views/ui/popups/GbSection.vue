<script setup lang="ts">

</script>

<template>
    <div class="gb-layout-tl gap-2">
        <div class="pl-2 pr-2">
            <slot name="header"></slot>
        </div>
        <div class="gb-inner-window">
            <slot name="content"></slot>
        </div>
        <div class="pl-2 pr-2 w-full">
            <slot name="footer"></slot>
        </div>
    </div>
</template>
