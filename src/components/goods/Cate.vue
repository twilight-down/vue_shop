<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>


  <!-- 卡片视图区域 -->
  <el-card>
    <el-row>
      <el-col>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-col>
    </el-row>

    <!-- 表格区域 -->
    <!-- data属性为表格数据源 columns -->
    <tree-table class="treeTable" :data="catelist" :columns="columns" 
    :selection-type= false :expand-type= false show-index index-text=" "
    border stripe>
    
    <!-- 是否有效 -->
    <template slot="isok" slot-scope="scope">
      <!-- {{scope.row}} -->
      <i class="el-icon-success" v-if="scope.row.cat_deleted=== false" style="color: lightgreen;" ></i>
      <i class="el-icon-error" v-else style="color: red;"></i>
    </template>


    <!-- 排序 -->
    <template slot="order" slot-scope="scope">
      <!-- {{scope.row}} -->
      <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
      <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
      <el-tag type="warning" size="mini" v-else>三级</el-tag>
    </template>



    <!-- 操作 -->
    <template slot="opt" slot-scope="scope">
      <!-- {{scope.row}} -->
      <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row)">
        编辑  
      </el-button>
      <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCateById(scope.row.cat_id)">
        删除
      </el-button>
    </template>

    </tree-table>

    <!-- 分页区域 -->
     <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>




  </el-card>

<!-- 添加分类对话框 -->
<el-dialog
  title="添加分类"
  :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
  <!-- 添加分类的表单 -->

  <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px" >
  <el-form-item label="分类名称: " prop="cat_name">
    <el-input v-model="addCateForm.cat_name"></el-input>
  </el-form-item>
  <el-form-item label="父级分类: " >

    <!-- options用于绑定数据源 -->
    <!-- props 用来指定配置对象 -->
    <!-- change-on-select 是否允许选择任意一级的选项 -->
    <!-- clearable 是否允许清空选项 -->
    <el-cascader
    clearable change-on-select
    v-model="selectedKeys"
    :options="parentCateList"
    :props="cascaderProps"
    @change="parentCateChange">
    </el-cascader>

  </el-form-item>
  </el-form>

  <!-- 底部编辑栏 -->
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>






<!-- 编辑区域 -->
<el-dialog
  title="编辑分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
  
 <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px" >
  <el-form-item label="分类名称: " prop="cat_name">
    <el-input v-model="editCateForm.cat_name"></el-input>
  </el-form-item>
  <!-- <el-form-item label="父级分类: " >

    <el-cascader
    clearable change-on-select
    v-model="selectedKeys"
    :options="parentCateList"
    :props="cascaderProps"
    @change="editParentCateChange">
    </el-cascader>

  </el-form-item> -->
  </el-form>

  <!-- 底部编辑栏 -->
  <span slot="footer" class="dialog-footer">
    <el-button @click="editCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCate">确 定</el-button>
  </span>
</el-dialog>

  </div>
</template>



<script>
export default {
  data(){
    return{
      // 查询条件 type目录等级 pagenum默认显示第几页 pagesize 一页显示多少天数据
      queryInfo:{
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist:[],
      // 总数据条数
      total:0,
      // 为table指定列的定义
      columns:[
        {
          // label表示列标题名称
          label:'分类名称',
          // prop表示	对应列内容的属性名
          prop:'cat_name'
        },{
          label:'是否有效',
          // type 列类型 表示将当前列定义为模板列
          type:'template',
          // 表示当前这一列使用的模板名称
          template:'isok'
        },{
          label:'排序',
          // type 列类型 表示将当前列定义为模板列
          type:'template',
          // 表示当前这一列使用的模板名称
          template:'order'
        },{
          label:'操作',
          // type 列类型 表示将当前列定义为模板列
          type:'template',
          // 表示当前这一列使用的模板名称
          template:'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible:false,
      // 添加分类的表单数据对象
      addCateForm:{
        // 将要添加的分类的名称
        cat_name:'',
        // 父级分类的id 0代表没有父级分类 1代表有一个父级 2代表有两个父级也就是第三级最后一级
        cat_pid: 0,
        // 分类的等级，默认(0)要添加的是一级分类
        cat_level: 0

      },
      // 添加分类表单的验证规则
      addCateFormRules:{
        cat_name:[
          {
            required:true,
            message:'请输入分类名称',
            trigger:'blur'
          },
        ]
      },
      // 编辑分类表单验证规则
      editCateFormRules:{
         cat_name:[
          {
            required:true,
            message:'请输入分类名称',
            trigger:'blur'
          },
        ]
      },
      // 父级分类的列表 用于作为数据源绑定数据
      parentCateList:[],
      // 指定级联选择器的配置对象
      cascaderProps:{
        value:'cat_id',
        label	:'cat_name',
        children:'children',
        expandTrigger:'hover'

      },
      // 选中的父级分类的id数组
      selectedKeys:[],
      // 控制分类表单编辑的显示与隐藏
      editCateDialogVisible : false,
      // 
      editCateForm:{
        // 将要修改的分类的名称
        cat_name:'',
        // 父级分类的id 0代表没有父级分类 1代表有一个父级 2代表有两个父级也就是第三级最后一级
        cat_pid: 0,
        // 分类的等级，默认(0)要添加的是一级分类
        cat_level: 0
      }
      


    }
  },
  created(){
    this.getCateList()
  },
  methods:{

    // 获取商品分类数据
    async getCateList(){
      const {data:res} = await this.$http.get('categories',{params:this.queryInfo})
      if(res.meta.status!==200){
        return this.$message.error('查询商品信息失败')
      }
      // console.log(res);
      // 将获取到的商品信息存储在catelist中
      this.catelist=res.data.result
      // 为总数据条数赋值
      this.total=res.data.total
    },

    // 监听pagesize改变事件
    handleSizeChange(newSize){
      this.queryInfo.pagesize=newSize
      this.getCateList()
    },

    // 监听pagenum的改变
    handleCurrentChange(newPage){
      this.queryInfo.pagenum=newPage
      this.getCateList()
    },

    // 点击添加按钮显示添加分类对话框
    showAddCateDialog(){
      // 先获取父级分类数据列表
      this.getParentCateList()
      // 再显示添加分类对话框
      this.addCateDialogVisible=true
    },

    // 获取父级分类的数据列表
    async getParentCateList(){
      // type:2 一共有三级列表 最后一个列表不需要被显示 他没有子列表
      const {data:res} = await this.$http.get('categories',{params:{
        type:2
      }})
      if(res.meta.status!==200){
        return this.$message.error('获取父级分类数据失败')
      }
      // 将获取到的数据进行保存
      this.parentCateList=res.data
      // console.log(res.data);
    },
    // 选项发生变化触发这个函数
    parentCateChange(){
      console.log(this.selectedKeys);
      // 如果selectedKeys  数组中的length大于0则代表选中了父级分类
      // 如果等于0则代表没有选中任何分类
      if(this.selectedKeys.length>0){
        // 父级分类的id
        this.addCateForm.cat_pid= this.selectedKeys[this.selectedKeys.length-1]
        // 为当前分类等级赋值
        this.addCateForm.cat_level= this.selectedKeys.length
        return
      }else{
        // 父级分类的id
         this.addCateForm.cat_pid=0
        //  为当前分类的等级赋值
         this.addCateForm.cat_level=0
      }
    },
    // 点击按钮添加分类
    addCate(){
      this.$refs.addCateFormRef.validate(async valid =>{
        if(!valid) return
        // console.log('1');
        const {data:res} = await this.$http.post('categories',this.addCateForm)
        if(res.meta.status!==201){
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件 重置表单数据
    addCateDialogClosed(){
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys=[]
      this.addCateForm.cat_pid=0
      this.addCateForm.cat_level=0
    },
    // 点击按钮显示编辑对话框
    showEditCateDialog(data){
      // console.log(data);
      // 显示对话框之前显示对应选中内容的id
      this.getParentCateList()
      this.editCateForm.cat_pid=data.cat_id
      this.editCateForm.cat_name=data.cat_name
      this.editCateDialogVisible = true
    },
    // // 编辑选项发生变化触发这个函数
    // editParentCateChange(){
    //   console.log(this.selectedKeys);
    //   // 如果selectedKeys  数组中的length大于0则代表选中了父级分类
    //   // 如果等于0则代表没有选中任何分类
    //   if(this.selectedKeys.length>0){
    //     // 父级分类的id
    //     this.editCateForm.cat_pid= this.selectedKeys[this.selectedKeys.length-1]
    //     // 为当前分类等级赋值
    //     this.editCateForm.cat_level= this.selectedKeys.length
    //     return
    //   }else{
    //     // 父级分类的id
    //      this.editCateForm.cat_pid=0
    //     //  为当前分类的等级赋值
    //      this.editCateForm.cat_level=0
    //   }
    // },
    // 点击确定 编辑用户信息
    editCate(){
      this.$refs.editCateFormRef.validate(async valid =>{
        if(!valid) return
        // console.log('1');
        const {data:res} = await this.$http.put(`categories/${this.editCateForm.cat_pid}`,{
        cat_name:this.editCateForm.cat_name})
        if(res.meta.status!==200){
          // console.log(this.editCateForm.cat_pid);
          // console.log(this.editCateForm.cat_name);
          // console.log(res.meta.status);
          return this.$message.error('更新分类失败！')
        }
        this.$message.success('更新分类成功')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 关闭表单时清空数据
    editCateDialogClosed(){
      this.$refs.editCateFormRef.resetFields()
      // this.selectedKeys=[]
      // this.editCateForm.cat_pid=0
      // this.editCateForm.cat_level=0
    },
    // 根据id删除对应商品
    async deleteCateById(id){
      // console.log(id);
       const confirmResult= await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
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

        const{data:res}= await this.$http.delete('categories/'+id)
        if(res.meta.status !== 200){
          return this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.getCateList()
    }

  }
}
</script>


<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}

</style>