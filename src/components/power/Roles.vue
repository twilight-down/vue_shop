<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>




      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe >
        <!-- 展开列      使用expand指定为展开页 -->
        <el-table-column type="expand">

          <template slot-scope="scope">
            <el-row :class="['bdbottom' ,i1=== 0 ? 'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id" >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
               <el-tag closable @close="removeRightById(scope.row,item1.id)"> {{item1.authName}}</el-tag>
               <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row :class="[i2===0 ? '':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id" >
                  
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>

        </el-table-column>
        <!-- 索引列       使用index指定为索引页-->
        <el-table-column type="index" ></el-table-column>
        <el-table-column label="角色名称" prop="roleName" ></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc" ></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>

      </el-table>
    </el-card>



<!-- 添加用户的对话框 -->
      <el-dialog title="添加角色"
        :visible.sync="addDialogVisible" width="50%"
        @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <!-- addForm是数据绑定 addFormRules是规则绑定 -->
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px" >
            <el-form-item label="角色名称" prop="roleName" >
              <el-input v-model="addForm.roleName" ></el-input>
            </el-form-item>
             <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="addForm.roleDesc"></el-input>
            </el-form-item>
          </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole()">确 定</el-button>
        </span>
      </el-dialog>


 



    <!-- 修改角色区域  -->
      <el-dialog
      title="修改用户" :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px" >
            <el-form-item label="角色名称" prop="roleName" >
              <el-input v-model="editForm.roleName" ></el-input>
            </el-form-item>
             <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="editForm.roleDesc"></el-input>
            </el-form-item>
      </el-form>     
       <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>






    <!-- 分配权限区域 -->
      <el-dialog title="分配权限" :visible.sync="setRightDialogVisible"
       width="50%" @close="setRightDialogClosed">
    <!-- 树形控件 -->
    <el-tree :data="rightslist" :props="treeProps" ref="treeRef"
    show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys"></el-tree>
    <span slot="footer" class="dialog-footer">
      <el-button @click="setRightDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="allotRights">确 定</el-button>
    </span>
  </el-dialog>


  </div>
</template>


<script>
export default {
  data(){
    return {
      // 所有角色列表数据
      rolelist:[],
      // 所有权限的数据 同时也是树形控件所绑定的数据
      rightslist:[],
      addForm:{
        roleName:'',
        roleDesc:''
      },
      editForm:{},
      // 控制添加角色信息的显示与隐藏
      addDialogVisible:false,
      // 控制编辑角色信息的显示与隐藏
      editDialogVisible:false,
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible:false,
      addFormRules:{
        roleName:[
          {
            required:true,
            message:'请输入角色名称',
             trigger:'blur'
          },{
            min:2,
            max:10,
            message:'请输入2到十位的角色名称',
            trigger:'blur'
          }
        ],
        roleDesc:[
          {
            required:false,
            message:'请输入角色描述',
             trigger:'blur'
          },{
            min:5,
            max:20,
            message:'角色描述长度在5-20个字符串之间',
            trigger:'blur'
          }
        ]
      },
      editFormRules:{
        roleName:[
          {
            required:true,
            message:'请输入用户名',
            trigger:'blur'
          },{
            min:3,
            max:10,
            message:'用户名的长度在三到十个字符串之间',
            trigger:'blur'
          }
        ],
        roleDesc:[
          {
            required:false,
            message:'请输入角色描述',
             trigger:'blur'
          },{
            min:5,
            max:20,
            message:'角色描述长度在5-20个字符串之间',
            trigger:'blur'
          }
        ]
      },
      // 树形控件的绑定对象
      treeProps:{
        // label代表我们看到哪个属性
        // children代表父子节点通过哪个属性进行嵌套的
        label:'authName',
        children:'children'

      },
      // 默认选中的节点id值数组
      defKeys:[],
      // 即将分配权限的角色id
      roleId:''
      
    }
  },
  created(){
    this.getRolesList()
  },
  methods:{
    // 获取所有角色的列表
    async getRolesList(){
     const {data:res} = await this.$http.get('roles')
     if(res.meta.status !== 200) {
       return this.$message.error('获取角色列表失败')
     }
     this.rolelist=res.data
    //  console.log(this.rolelist);

    },
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加用户
    addRole(){
      //  console.log('1');
      this.$refs.addFormRef.validate(async valid=>{
        // console.log(valid);
        // 预检验失败
        if(!valid) return
        // 预校验成功可以发起添加用户的请求
        const { data : res } = await this.$http.post('roles', this.addForm)
        if(res.meta.status!==201){
          this.$message.error('用户添加失败')
        }
        this.$message.success('添加用户成功!')
        // 隐藏添加用户的对话框
        this.addDialogVisible=false
        // 重新获取用户的列表
        this.getRolesList()
      })
    },
    // 显示编辑角色对话框
    async showEditDialog(id){
      // console.log(id);
      this.editDialogVisible=true
      const {data:res} = await this.$http.get('roles/'+id)
      if(res.meta.status!==200){
        return this.$message.error('查询用户信息失败')
      }
      // console.log('查询成功');
      this.editForm=res.data
    },
    // 重置表单中的角色信息
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    // 确认更新角色信息
    editRoleInfo(){
      this.$refs.editFormRef.validate(async valid=>{
        // console.log(this.editForm);
      if(!valid) return
      // 这里的id 是roleId
      const { data:res } = await this.$http.put('roles/'+this.editForm.roleId,
      {
        roleName:this.editForm.roleName,
        roleDesc:this.editForm.roleDesc
      })
      // console.log(res);
      if (res.meta.status !== 200) {
         return this.$message.error('更新角色信息失败')
        }
        this.$message.success('更新角色信息成功')
        // 隐藏添加用户的对话框
        this.editDialogVisible=false
        // 重新获取用户的列表
        this.getRolesList()
    })
    },
    // 根据id删除对应角色
    async removeRoleById(id){
      // console.log(id);
      const confirmResult= await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        // 点击确认返回消息为confirm
        // 点击取消返回消息为cancel
        // console.log(confirmResult);
        if(confirmResult !=='confirm'){
          return this.$message.info('已取消删除')
        }
        const {data:res}= await this.$http.delete('roles/'+id)
        // console.log(res);
        if(res.meta.status!==200){
          return this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.getRolesList()

    },
    // 根据id删除对应的权限
    async removeRightById(role,rightId) {
      // console.log(role); 一个object对象包含所有的角色列表信息 权限全部嵌套在三个children属性中
      // 弹框提示用户是否删除
      const confirmResult= await this.$confirm('此操作将永久删除该用户的权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)  
        if(confirmResult!=='confirm'){
          return this.$message.info('删除已取消')
        }
        const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status!==200){
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        // this.getRolesList() 会发生整个页面的重新渲染 
        // 返回的data是一个最新的数据我们只需要把data重新赋值就可以达到局部渲染的作用
        role.children=res.data
    },
    // 展示分配权限对话框
    async showSetRightDialog(role){
      this.roleId=role.id
      // 获取所有权限的数据
      const {data:res}= await this.$http.get('rights/tree')
      if(res.meta.status!==200){
        return this.$message.error('获取权限列表失败')
      }
      // 获取到的权限数据保存data中
      this.rightslist=res.data
      // 递归获取三级节点的id 并将其保存到defKeys中
      this.getLeafKeys(role,this.defKeys)
      
      this.setRightDialogVisible=true
    },
    // 通过递归的形式，获取角色下所有三级权限的id,并保存到数组defKeys中
    getLeafKeys(node,arr){
      // 如果当前node节点不包含children属性则代表他是一个三级节点
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item=>this.getLeafKeys(item,arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed(){
      this.defKeys=[]
    },
    // 点击为角色添加权限
    async allotRights(){
      // 展开运算符...  将一个数组转为用逗号分隔的参数序列
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys);
      const idStr =  keys.join(',')
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status!==200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible=false
    }
    
  }
  
}
</script>




<style lang="less" scoped>
.el-tag{
  margin: 7px;
}

.bdtop{
  border-top: 1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>