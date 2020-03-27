<template>
  <div class="hello" @click="changeMsg">
      <img src="../assets/logo.png">
    <h1>{{ nested.msg }}</h1>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
        nested: {
          msg: 'Hello Vue!'
        }
    }
  },
  methods: {
    changeMsg() {
      this.nested.msg = 'Hello World!'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
  cursor: pointer;
}
</style>
