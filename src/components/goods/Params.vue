<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>




    <el-card>
      <!-- 头部的警告区域 -->
      <!-- closable 控制右侧关闭按钮的显示与隐藏 -->
      <!-- show-icon 控制左侧小图标的显示与隐藏 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数"  type="warning" :closable="false" show-icon>
      </el-alert>
  
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品选择框的级联选择框 -->
          <!--options 可选项数据源，键名可通过 Props 属性配置 -->
          <!-- props 级联选择器配置信息在data处定义 -->
          <el-cascader  clearable 
              v-model="selectedCateKeys"
              :options="catelist"
              :props="cateProps"
              @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>


      <!-- tab页签区域 -->
      <!-- label 选项卡标题 -->
      <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <!-- many 代表获取的是动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button type="primary" size="mini" 
          :disabled="isBtnDisable" @click="addDialogVisible=true">添加参数</el-button>

           <!-- 动态参数表格 -->
          <el-table :data="manyTableDate" border stripe>
          <!-- 展开行 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <!-- 循环渲染tag标签 -->
              <!-- 将数组渲染为tag标签 -->
              <el-tag v-for="(item,i) in scope.row.attr_vals" 
              :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
              <!-- 输入文本框 -->
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)">
              </el-input>
              <!-- 添加的按钮 -->
              <el-button v-else class="button-new-tag" size="small" 
              @click="showInput(scope.row)">+ New Tag</el-button>
              
            </template>
          </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作" >
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>

          </el-table>
        </el-tab-pane>
      

          <!-- 添加静态属性的面板 -->
          <!-- only 代表的是获取静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
           <el-button type="primary" size="mini"
           :disabled="isBtnDisable" @click="addDialogVisible=true">添加属性</el-button>

            <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
          <!-- 展开行 -->
            <el-table-column type="expand">
            <template slot-scope="scope">
              <!-- 循环渲染tag标签 -->
              <!-- 将数组渲染为tag标签 -->
              <el-tag v-for="(item,i) in scope.row.attr_vals" 
              :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
              <!-- 输入文本框 -->
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)">
              </el-input>
              <!-- 添加的按钮 -->
              <el-button v-else class="button-new-tag" size="small" 
              @click="showInput(scope.row)">+ New Tag</el-button>
              
            </template>
          </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作" >
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>

          </el-table>
        </el-tab-pane>
      </el-tabs>


    </el-card>



    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加参数对话框 -->
      <el-form :model="addForm" :rules="addFormRuls" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
      <el-button @click="addDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>



      <!-- 修改参数的对话框 -->
    <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加参数对话框 -->
      <el-form :model="editForm" :rules="editFormRuls" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>





  </div>
</template>


<script>
export default {
  data(){
    return{
      // 商品分类列表
      catelist:[],
      // 指定级联选择器的配置对象
      cateProps:{
        value:'cat_id',
        label	:'cat_name',
        children:'children',
        expandTrigger:'hover',
        // change-on-select 已经被废弃可以使用checkStrictly来代替
        checkStrictly:true
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys:[],
      // 被激活的页签的名称
      activeName:'many',
      // 动态参数数据
      manyTableDate:[],
      // 静态属性数据
      onlyTableData:[],
      // 控制添加对话框的显示与隐藏
      addDialogVisible:false,
      // 添加参数的表单数据对象
      addForm:{
        arrr_name:''

      },
      // 添加表单的验证规则对象
      addFormRuls:{
        attr_name:[{
          required:true,
          message:'请输入参数名称',
          trigger:'blur'
        }]
      },
      // 控制修改参数对话框的显示与隐藏
      editDialogVisible:false,
      // 修改的表单数据对象
      editForm:{},
      // 修改表单的验证规则
      editFormRuls:{
        attr_name:[{
          required:true,
          message:'请输入参数名称',
          trigger:'blur'
        }]
      },
      
      


    }
  },
  created(){
    // 获取所有的商品分类列表
    this.getCateList()
  },
  methods:{
    // 获取所有的商品分类列表
    async getCateList(){
      const{data:res} = await this.$http.get('categories')
      if(res.meta.status!==200){
        return this.$message.error('获取商品信息失败!')
      }
      // console.log(res);
      this.catelist=res.data
    },


    // 级联选择框选项变换时触发
    handleChange(){
      this.getParamsData()
    },
    // tab 页签的点击事件处理函数 点击切换页签
    handleTabClick(){
      this.getParamsData()
      // console.log(this.activeName);
    },


    // 获取参数列表数据
    async getParamsData(){
      // console.log(this.selectedCateKeys);
      // 如果数组长度不为三则代表没有选中三级分类
      if(this.selectedCateKeys.length!==3){
        this.selectedCateKeys=[]
        this.manyTableDate=[]
        this.onlyTableData=[]
        return
      }
      // 没有被return 证明选中的是三级分类
      // 根据所选分类的id和当前所处的面板获取对应的参数
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
        params:{
          sel:this.activeName
        }}) 
        if(res.meta.status!==200){
          return this.$message.error('获取参数列表失败')
        }
        // 将字符串分割为数组
        // 判断字符串是否为空 若为空则可避免出现一个空白数组
        res.data.forEach(item=>{
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') :[]
          // 控制文本框的显示与隐藏
          item.inputVisible=false
          // 文本框输入的值
          item.inputValue=''
        })
        // console.log(res.data);

        // 对数据进行判断 是动态参数还是静态属性
        // 并且将他们进行分类
        if(this.activeName=='many'){
          this.manyTableDate=res.data
        }
        this.onlyTableData=res.data

    },
    // 监听对话框的关闭事件
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
     addParams(){
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return
        const{data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
          attr_name:this.addForm.attr_name,
          attr_sel:this.activeName
        })
        if(res.meta.status!==201){
          return this.$message.error('添加列表失败')
        }
        this.$message.success('添加列表成功')
        this.addDialogVisible=false
        this.getParamsData()
      })
    },
    // 点击按钮显示修改对话框
    async showEditDialog(attr_id){
      // 查询当前参数信息
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{params:{
        attr_sel:this.activeName
      }})
      if(res.meta.status!==200){
        // console.log(res.meta.status);
          return this.$message.error('获取参数信息失败')
        }
        this.$message.success('获取参数信息成功')
        this.editForm=res.data 
        this.editDialogVisible=true

    },
    // 关闭表单时将内容置空
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮，修改参数信息
    editParams(){
      this.$refs.editFormRef.validate(async valid=>{
        if(!valid) return
        const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
          attr_name : this.editForm.attr_name,
          attr_sel : this.activeName
        })
        if(res.meta.status!==200){
        // console.log(res.meta.status);
          return this.$message.error('修改参数信息失败')
        }
        this.$message.success('修改参数信息成功')
        this.getParamsData()
        this.editDialogVisible=false
      })
    },
    // 根据id删除对应参数项
    async removeParams(attr_id){
      const confirmResult= await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        // 如果用户取消删除则返回一个cancle字符串
        // 如果用户确认删除则返回值为一个confirm字符串
          // console.log(confirmResult);
          if(confirmResult!=='confirm'){
            return this.$message.info('已取消删除')
          }

        const{data:res}= await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if(res.meta.status !== 200){
          return this.$message.error('删除参数失败')
        }
        this.$message.success('删除参数成功')
        this.getParamsData()
    },
    // 文本框失去焦点或按下enter键时触发
     handleInputConfirm(row){
      if(row.inputValue.trim().length === 0){
        row.inputValue=''
        row.inputVisible=false
        return
      }
      // 如果没有return则说明输入了内容
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue=''
      row.inputVisible=false

      // 需要发起请求将数据保存在数据库中
      this.saveAttrVals(row)
      
    },
    // 将对attr_vals的操作保存到数据库中
    async saveAttrVals(row){
       // 需要发起请求将数据保存在数据库中
      const{data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if(res.meta.status!==200){
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功')
    },
    // 点击按钮展示文本输入框 
    showInput(row){
      row.inputVisible = true
      // 当inputVisible被改为true时界面还未渲染完成 
      // 此时执行$refs.saveTagInput.$refs.input.focus()
      // 必定报错 所以使用nextTick等页面渲染完成再去执行
      // 让文本框自动获得焦点
      // $nextTick方法的作用，就是当页面上元素被重新渲染之后，才会指定回电函数中的代码
      this.$nextTick(_ => {
        // 通过refs获得了DOM对象 调用focus获得了焦点
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    // 删除对应的参数可选项
    handleClose(i,row){
      // console.log(row);
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    }


  },

  computed:{
    // 如果按钮需要被禁用则返回true否则返回true
    isBtnDisable(){
      if(this.selectedCateKeys.length!==3){
        return true
      }
      return false
    },
    // 当前选中的三级分类的id
    cateId() {
      if(this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
      
    },
    // 动态计算标题文本
    titleText(){
      if(this.activeName=='many'){
        return '动态参数'
      }
        return '静态属性'
    }
  }   
}
</script>


<style lang="less" scoped>

.cat_opt{
  margin :15px 10px;
}
.el-tag{
  margin: 10px;
}
.input-new-tag{
  width: 120px;
}

</style>