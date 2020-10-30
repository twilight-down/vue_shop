<template>
    <el-container class="home-container">
      <!-- 头部区域 -->
    <el-header>
      <div>
        <!-- <img src="../assets/heima.png" alt=""> -->
        <img src="../assets/hui.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button> 
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
     <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744" text-color="#fff"  active-text-color="#409EFF" 
        :unique-opened="true"  :collapse="isCollapse" :collapse-transition="false"	:router="true"
        :default-active="activePath">
          <!-- 一级菜单 -->
            <el-submenu :index="item.id+''"  v-for="item in menulist" :key="item.id">
              <!-- 一级菜单模板区域 -->
             <template slot="title">
               <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
             </template>         
                <!-- 二级菜单 -->       
                <!-- router 是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转 -->
               <el-menu-item :index="'/'+ subitem.path" v-for="subitem in item.children" 
               :key="subitem.id" @click="saveNavState('/'+ subitem.path)">
                <template slot="title">
                  <!-- 图标 -->
                    <i class="el-icon-menu"></i>
                    <!-- 文本 -->
                    <span>{{subitem.authName}}</span>
                </template>  
                </el-menu-item>  
               
      </el-submenu>
    </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>

</template>

<script >
    export default {
      data(){
        return {
          // 左侧菜单数据 从后端获取并且绑定在左侧菜单中（通过两个for循环）
          menulist:[],
          iconsObj:{
            '125':'iconfont icon-user',
            '103':'iconfont icon-tijikongjian',
            '101':'iconfont icon-shangpin',
            '102':'iconfont icon-danju',
            '145':'iconfont icon-baobiao',
          },
          isCollapse:false,
          //被激活的链接地址
          activePath:''
          }
      },
        created() {
            this.getMenuList(),
            this.activePath=window.sessionStorage.getItem('activePath')
        },
        methods: {
            logout() {
                window.sessionStorage.clear();
                this.$router.push('/login');
            },
            //获取所有的菜单
            async getMenuList() {
                const { data: res } = await this.$http.get('menus');
                // this.$message 是挂载在prototype原型上的一个方法 用于获取信息'success', 'warning', 'info', 'error'的信息
                if(res.meta.status!=200) return this.$message.error(res.meta.msg);
                this.menulist=res.data;
                // console.log(res.data);
                // console.log(typeof this.$message);
            },
            //点击按钮切换菜单的折叠和展开
            toggleCollapse(){
              this.isCollapse=!this.isCollapse;
            },
            //保存链接的激活状态
            saveNavState(activePath){
              window.sessionStorage.setItem('activePath',activePath);
              this.activePath=activePath;
            }
        }
    } 
</script>




<style lang="less" scoped>
.home-container{
  height: 100%;
}
.el-header{
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div{
    display: flex;
    align-items: center;
    > img{
      border-radius: 60px;
    }
    span{
      margin-left: 15px;
    }
  }
}
.el-aside{
  background-color: #333744;
  .el-menu{
    border: none;
  }
}
.el-main{
  background-color: #EAEDF1;
}
.iconfont{
  margin-right: 10px;
}
  .toggle-button{
    background-color: #4A5064;
    color: #fff;
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    letter-spacing: .3em;
    cursor: pointer;
  }
</style>