// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

new Vue({
  el: '#app',
  data() {
    return {
      message: 'Hello Vue!'
    }
  },
  mounted() {
    console.log(this.message)
    console.log(this._data.message)
  }
})

