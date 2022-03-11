<template>
  <div style="padding:20px;">
    <div><h1>{{msg}}</h1></div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: '欢迎使用MT-WMS系统'
    }
  },
  methods: {

  },
  mounted: function(){
    var env = this
    if(env.$store.has_agent_perm){
      this.$router.push({path:'/system/company'})
    }else{
      this.$router.push({path:'/dash'})
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only 
<style scoped>
</style>
-->