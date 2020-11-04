<template>
  <div>
     <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>



    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部提示区域 -->
      <el-alert  title="添加商品信息" type="info" center show-icon :closable="false"> </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>



      <!-- tab栏区域 -->
      <el-form :model="addForm" :rules="addFormRules" 
      ref="addFormRef" label-width="100px" label-position="top">
      <!-- label-position="top" 指定文本在输入框的上方 -->
        <el-tabs v-model="activeIndex" :tab-position="'left'" 
        :before-leave="beforeTabLeave" @tab-click="tabClicked">

          <!-- 基本信息对应表单 -->
          <el-tab-pane label="基本信息" name="0">
            <!-- label 标题名称 prop校验规则 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange">
                </el-cascader>
            </el-form-item>

          <!-- 商品参数对应表单 -->
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
               <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" 
                v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

            <!-- 商品属性对应表单 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData"
             :key="item.attr_id">
             <el-input v-model="item.attr_vals"></el-input>
             </el-form-item>
          </el-tab-pane>


          <!-- 商品图片对应模块 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的后台API地址 -->
            <!-- list-type="picture"> 表示一个带有图片缩略图的上传效果 -->
            <!-- upload 没有使用配置好的axios而是使用了他自己内部封装好的axios -->
            <!-- 所以我们要手动为他配置header -->
            <el-upload
              :action="uoloadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>


          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>


    </el-card>




    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%">
      <img :src="previewPath" alt="" class="previewImg">
      
    </el-dialog>



  </div>
</template>


<script>

import _ from 'lodash'

export default {
  data(){
    return{
      // 指定当前步骤为哪一步
      activeIndex: '0',
      // 添加表单的数据对象
      addForm:{
        goods_name:'',
        goods_price:0,
        goods_weight:0,
        goods_number:0,
        // 商品所属的分类数组
        goods_cat:[],
        // 图片的数组
        pics:[],
        //商品详情描述
        goods_introduce:'',
        // 包含参数或属性的id值和value值
        attrs:[]


      },
      // 添加表单的验证规则
      addFormRules:{
        goods_name:[
          {required:true ,message:'请输入商品名称', trigger:'blur'}
        ],
        goods_price:[
           {required:true ,message:'请输入商品价格', trigger:'blur'}
        ],
        goods_weight:[
          {required:true ,message:'请输入商品重量', trigger:'blur'}
        ],
        goods_number:[
          {required:true ,message:'请输入商品数量', trigger:'blur'}
        ],
        goods_cat:[
          {required:true ,message:'请选择商品分类', trigger:'blur'}
        ]
      },
      // 商品分类列表数据
      catelist:[],
      // 级联选择器配置信息
      cateProps:{
        label:'cat_name',
        value:'cat_id',
        children:'children',
        expandTrigger:'click',
        
      },
      // 动态参数列表数据
      manyTableData:[],
      // 静态属性列表数据
      onlyTableData:[],
      // 图片上传地址
      uoloadURL:'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的header请求头对象
      headerObj:{
        Authorization:window.sessionStorage.getItem('token')
      },
      // 预览图片存储的实际地址
      previewPath:'',
      // 控制图片预览窗口的显示与隐藏
      previewDialogVisible:false

    }
  },
  created(){
    this.getCateList()
  },
  methods:{
    // 获取商品信息
    async getCateList(){
      const {data:res} = await this.$http.get('categories')
      if(res.meta.status!==200){
        return this.$message.error('商品信息获取失败')
      }
      this.catelist=res.data
      this.$message.success('商品信息获取成功')
    },
    // 级联选择器选中项变化发生的处理函数
    handleChange(){
      // console.log(this.addForm.goods_cat);
      if(this.addForm.goods_cat.length!==3){
        this.addForm.goods_cat=[]
      }
    },
    // 切换tab表单时触发 判断是否可以前往下一项内容
    beforeTabLeave(activeName,oldActiveName){
      // console.log(activeName,oldActiveName);
      if(oldActiveName ==='0' && this.addForm.goods_cat.length!==3){
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 表格选中时触发
    async tabClicked(){ 
      // console.log(this.activeIndex);
      // 证明访问的是动态参数面板
      if(this.activeIndex ==='1'){
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,
        {params:{sel: 'many'}})
      
        if(res.meta.status!==200){
          // console.log(res);
          return this.$message.error('获取动态参数失败')
        }

      // console.log(res.data);
      // 将字符串形式的attr_vals标签用空格作为间隔分割为数组并将值重新赋值回去
      res.data.forEach(item=>item.attr_vals= item.attr_vals.length === 0 ? [] : item.attr_vals.split(' '))
      this.manyTableData=res.data
      console.log(this.manyTableData);

      }else if(this.activeIndex === '2'){
        // 证明访问的是静态属性面板
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,
        {params:{sel: 'only'}})
        if(res.meta.status!==200){
          return this.$message.error('获取静态属性失败')
        }
        // 将获取到的静态数据保存
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file){
      console.log(file);
      this.previewPath=file.response.data.url
      this.previewDialogVisible=true
    },
    // 处理移除图片的操作
    handleRemove(file){
      // console.log(file);
      // 获取将要删除的图片的临时路径
      const filePath=file.response.data.tmp_path
      // 从pics数组中找到这个图片对应的索引值  x为数组中(pic数组)的每一项 findIndex接收一个回调函数
      const i = this.addForm.pics.findIndex(x=>x.pic === filePath)
      // 调用splice方法移除这一项
      this.addForm.pics.splice(i,1)
      console.log(this.addForm);
    },
    // 监听图片上传成功的事件
    handleSuccess(response){
      console.log(response);
      // 拼接的到一个图片信息对象 pic为临时存储的虚拟路径
      const picInfo = { pic:response.data.tmp_path}
      // 将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm);
    },
    // 添加商品
    add(){
      console.log(this.addForm);
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid){
          return this.$message.error('请填写必要的商品内容')
        }    
      
      // 执行添加的业务逻辑
      // 接口文档要求goods_cat是一个字符串 
      // 但是级联选择器v-model要求绑定的是一个数组
      // 所以我们需要深拷贝一份
      // lodash cloneDeep(obj)
      const form = _.cloneDeep(this.addForm)
      form.goods_cat = form.goods_cat.join(',')
      // 处理静态参数
      this.manyTableData.forEach(item =>{
        const newInfo={
          attr_id:item.attr_id,
          attr_value:item.attr_vals.join(' ')
        }
        this.addForm.attrs.push(newInfo)
      })
      // 处理动态属性
      this.onlyTableData.forEach(item =>{
        const newInfo={
          attr_id: item.attr_id,
          attr_values: item.attr_vals
        }
        this.addForm.attrs.push(newInfo)
      })
      // form 是在之前拷贝出来的 现在的form还没有attrs属性 因此需要进行赋值操作
      form.attrs=this.addForm.attrs
      console.log(form);

      // 发起请求添加商品
      // 商品名称必须是唯一的 不能重复
      const {data:res} = await this.$http.post('goods',form)
      if(res.meta.status!==201){
        console.log(res);
        return this.$message.error('添加商品失败,请输入正确的商品信息')

      }
        this.$message.success('添加商品成功')
        // 添加成功 进行跳转
        this.$router.push('/goods')
        

      })
    }
    

  },
  computed:{
    // 获取对应商品的id
    cateId(){
      if(this.addForm.goods_cat.length===3){
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>



<style lang="less" scoped>
.el-checkbox{
  margin: 0  10px 0 0 !important;
}
.previewImg{
  width: 100%;
}
.btnAdd{
  margin-top: 15px;
}
</style>