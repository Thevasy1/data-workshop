<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
@import './styles/global.css';

/* 强制覆盖所有 el-select 输入框白底 */
.el-select .el-input__wrapper {
  background-color: #0f2130 !important;
  border: 1px solid rgba(86, 190, 255, 0.12) !important;
  box-shadow: none !important;
}
.el-select .el-input__wrapper.is-focus {
  border-color: #3d9cff !important;
  box-shadow: 0 0 0 1px rgba(61, 156, 255, 0.2) !important;
}
</style>
