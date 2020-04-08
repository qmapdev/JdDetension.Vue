<template>
  <div>
    <Header />
    <Footer />
    <Menu />
  </div>
</template>

<script>
import Header from "../components/common/header.vue";
import Footer from "../components/common/footer.vue";
import Menu from "../components/common/menu.vue";

export default {
  name: "Home",
  components: {
    Header,
    Footer,
    Menu
  }
};
</script>
