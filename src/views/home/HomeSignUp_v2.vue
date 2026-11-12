<template>
    <register-by-email
        :show-sign-in="true"
        @close="router.push(HOME_ROUTES.HOME_SIGN_IN)"
    ></register-by-email>
</template>

<script setup lang="ts">
import router from '@/router'
import { HOME_ROUTES } from '@/router/routes/HomeRoutes'
import RegisterByEmail from '@/views/home/__components/RegisterByEmail.vue'
</script>
