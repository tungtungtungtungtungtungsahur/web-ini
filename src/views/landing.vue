<template>
    <div class="overlay">
      <img src="/barbek2.png" alt="Logo" class="logo" />
      <button class="start-btn" @click="goToSignin">MULAI</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      goToSignin() {
        this.$router.push('/signin');
      },
    },
  };
  </script>
  
  <style scoped>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100%;
    background-color: #1a2b35;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px;
    overflow-y: auto;
  }
  
  .logo {
    width: 140px;
    height: auto;
    margin-bottom: 32px;
  }
  
  .start-btn {
    width: 100%;
    max-width: 400px;
    padding: 14px;
    background-color: black;
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
  }
  
  .start-btn:hover {
    background-color: #222;
  }
  </style>