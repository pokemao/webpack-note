<template>
    <div>
        hello {{count}}
    </div>
</template>

<script setup>
import {ref} from 'vue'
const count = ref(0)
</script>


