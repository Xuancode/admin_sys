<template>
  <div class="item_select">
    <el-select
      v-model="itemValue"
      placeholder="无项目"
      clearable
      class="filter-item"
      style="width: 130px"
      @change="handleChange"
    >
      <el-option
        v-for="(item, index) in items"
        :key="index"
        :label="item.item_name"
        :value="item.item_id"
      />
    </el-select>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getItemIndex, setItemIndex } from '@/utils/auth'
import store from '@/store'

export default {
  name: 'ItemSelect',
  data() {
    return {
      itemValue: null
    }
  },
  computed: {
    ...mapState({
      items: state => state.user.items
    })
  },
  mounted() {
    const index = getItemIndex() ? getItemIndex() : 0
    if (this.items.length > 0) {
      if (this.items[index]) {
        this.itemValue = this.items[index].item_id
        this.setIndex(index)
      } else {
        this.itemValue = this.items[0].item_id
        this.setIndex(0)
      }
    }
  },
  methods: {
    handleChange(value) {
      let index = 0
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i]
        if (item.item_id === value) {
          index = i
          break
        }
      }
      this.setIndex(index)
    },
    async setIndex(index) {
      setItemIndex(index)
      await store.dispatch('user/changeItem', index)
    }
  }
}
</script>

<style lang="scss" scoped>
.item_select {
  float: right;
}
</style>
