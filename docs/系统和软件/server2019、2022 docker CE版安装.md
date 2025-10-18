---
title: server2019、2022 docker CE版安装
createTime: 2025/3/21 20:20:40
permalink: /Windows/ub2kd7vh/
tags:
  - Docker
  - Windows
  - Docker CE
---

Docker CE版为社区维护版本，与Windows上的Docker Desktop最大区别是去除了图形化控制面板，所有Docker相关操作全部需要使用命令行，与Linux版本操作方式基本相同。去除图形界面后体积变得非常小，资源消耗也非常低，安装成功率接近100%。

<!-- more -->

## 概述

Docker CE版为社区维护版本，与Windows上的Docker Desktop最大区别是去除了图形化控制面板，所有Docker相关操作全部需要使用命令行，与Linux版本操作方式基本相同。去除图形界面后体积变得非常小，资源消耗也非常低，安装成功率接近100%。

### 适用场景

- Windows Server 2019/2022 环境
- 需要轻量级Docker运行环境
- 习惯使用命令行操作的用户
- 服务器环境部署容器应用

### Docker CE vs Docker Desktop

| 特性 | Docker CE | Docker Desktop |
|------|-----------|----------------|
| **图形界面** | ❌ 纯命令行 | ✅ 图形化界面 |
| **资源占用** | 极低 | 较高 |
| **安装复杂度** | 手动安装 | 一键安装 |
| **适用用户** | 专业用户 | 普通用户 |
| **功能完整性** | 核心功能 | 完整功能 |

::: tip 安装方式
本教程采用**手动安装**方式，优点是可以离线安装，兼容性强。缺点是需要输入一些命令，非一键安装。
:::

## 系统要求

### 环境要求

- **操作系统**：Windows Server 2019 RTM 或 Windows Server 2022
- **权限要求**：管理员权限
- **网络要求**：可访问Docker官方下载站点（或已下载安装包）

::: warning 版本要求
注意事项：Windows Server 2019版本必须为RTM版本
:::

### 前置准备

- [ ] 确认系统版本符合要求
- [ ] 准备管理员权限的PowerShell
- [ ] 下载Docker CE安装包
- [ ] 确保系统稳定运行

## 安装流程概述

Docker CE的安装包含以下主要步骤：

1. **下载Docker镜像** - 获取Docker CE安装包
2. **启用容器功能** - 在Windows中启用容器支持
3. **部署Docker文件** - 配置Docker运行环境
4. **配置环境变量** - 设置系统PATH变量
5. **启动Docker服务** - 注册并启动Docker守护进程

## 步骤一：下载Docker镜像

### 获取安装包

前往Docker官方下载页面获取最新版本：

[Docker CE下载地址](https://download.docker.com/win/static/stable/x86_64/)

::: tip 版本选择
建议下载页面最下方的最新版本，确保获得最新功能和安全更新。
:::

## 步骤二：启用容器功能

### 启用Windows容器支持

:::: steps

1. **打开PowerShell**

   以管理员权限打开PowerShell

2. **启用容器功能**

   ```powershell
   Install-WindowsFeature -Name Containers
   ```

3. **重启系统**

   ```powershell
   Restart-Computer -Force
   ```

   ::: warning 重启提醒
   系统将自动重启以完成容器功能的启用，请保存好当前工作。
   :::

::::

## 步骤三：部署Docker文件

### 创建目录结构

:::: steps

1. **创建Docker主目录**

   在C盘"Program Files"目录创建docker文件夹，并将下载的Docker文件拷贝至此目录：

   ```
   路径：C:\Program Files\Docker
   ```

2. **创建配置目录**

   在系统数据目录创建Docker配置文件夹：

   ```
   路径：C:\ProgramData\Docker\config
   ```

3. **创建配置文件**

   在config目录下创建daemon.json文件：

   ```
   路径：C:\ProgramData\Docker\config\daemon.json
   ```

4. **编写配置内容**

   在daemon.json文件中写入以下内容：

   ```json
   {
     "insecure-registries": []
   }
   ```

::::

### 目录结构验证

完成后的目录结构应如下所示：

![Docker目录结构1](https://picx.zhimg.com/80/v2-c29268c38f93580f891e370b57b6cb5b_720w.png)

![Docker目录结构2](https://pica.zhimg.com/80/v2-a1da34b6619a1e80f22c46d6a718bd64_720w.png)

![配置文件内容](https://picx.zhimg.com/80/v2-9b053733afd64762807b91fdb0ccd76c_720w.png)

## 步骤四：配置环境变量

### 添加系统PATH

:::: steps

1. **添加环境变量**

   将Docker安装目录添加到系统环境变量Path中：

   ```
   C:\Program Files\Docker
   ```

   ![环境变量配置](https://picx.zhimg.com/80/v2-3b7f8ceb6dcb72e458abace306be1dd8_720w.png)

2. **验证环境变量**

   在CMD中输入以下命令验证配置：

   ```cmd
   docker
   ```

   正确输出应如下所示：

   ![环境变量验证](https://pica.zhimg.com/80/v2-fca770ea0b73cabe7e8ff86e0e682e09_720w.png)

::::

::: warning 配置检查
如果输出"未知命令"错误，请检查环境变量配置是否正确。
:::

## 步骤五：启动Docker服务

### 注册并启动服务

:::: steps

1. **注册Docker服务**

   在CMD中执行以下命令：

   ```cmd
   dockerd --register-service
   ```

2. **启动Docker服务**

   通过任务管理器启动Docker服务：

   - 打开任务管理器
   - 切换到"服务"选项卡
   - 找到"docker"服务

   ![任务管理器服务](https://picx.zhimg.com/80/v2-3c666704251cbd28167e6e070a7d9b5f_720w.png)

   右键点击"docker"服务，选择"启动"：

   ![启动Docker服务](https://pic1.zhimg.com/80/v2-4a3d435b87367b698b450886d3766b22_720w.png)

3. **验证服务状态**

   出现进程PID则代表服务启动成功。

::::

::: tip 安装完成
至此Docker CE安装完毕！系统会自动创建一个虚拟网卡用于Docker联网以及内部通信。
:::

![虚拟网卡创建](https://pic1.zhimg.com/80/v2-2d6633bd6aeb8d10087b648d9aa6f9b8_720w.png)

## 故障排除

### 常见问题

::: details CMD输入docker报错"未知命令"
**可能原因：**
- Docker文件未上传到对应目录
- 环境变量路径配置错误
- 环境变量未生效

**解决方案：**
1. 检查Docker文件是否正确放置在`C:\Program Files\Docker`目录
2. 验证环境变量PATH中是否包含Docker目录路径
3. 重启命令提示符或重新登录系统
:::

::: details 重启后容器启动报错
**可能原因：**
- Docker服务未设置为开机自启
- 容器配置问题
- 依赖服务未启动

**解决方案：**
1. 检查Docker服务是否已运行
2. 设置Docker服务为自动启动
3. 检查容器配置和依赖关系
:::

::: details Docker服务启动失败
**可能原因：**
- 安装步骤不完整
- 系统权限不足
- 端口冲突

**解决方案：**
1. 重新检查安装过程是否全部正确无误
2. 确认以管理员权限运行
3. 检查端口占用情况
:::

## 验证安装

### 基本功能测试

安装完成后，可以通过以下命令验证Docker是否正常工作：

```cmd
# 查看Docker版本
docker --version

# 查看Docker信息
docker info

# 运行测试容器
docker run hello-world
```

### 服务状态检查

```cmd
# 检查Docker服务状态
sc query docker

# 查看Docker进程
tasklist | findstr docker
```

## 最佳实践

### 安全配置

1. **定期更新**：保持Docker版本更新，获取最新安全补丁
2. **网络安全**：合理配置防火墙规则，限制不必要的网络访问
3. **权限管理**：避免使用过高权限运行容器
4. **镜像安全**：使用官方或可信的镜像源

### 性能优化

- **资源限制**：为容器设置合适的CPU和内存限制
- **存储优化**：使用适当的存储驱动和卷管理
- **网络配置**：根据需要选择合适的网络模式
- **日志管理**：配置合适的日志驱动和轮转策略

### 运维建议

- **监控告警**：设置容器和服务的监控告警
- **备份策略**：定期备份重要的容器数据和配置
- **文档记录**：记录容器配置和部署信息
- **版本管理**：使用标签管理不同版本的镜像

## 相关资源

- [Docker命令大全 | 菜鸟教程](https://www.runoob.com/docker/docker-command-manual.html)
- [Docker官方文档](https://docs.docker.com/)
- [Windows容器文档](https://docs.microsoft.com/en-us/virtualization/windowscontainers/)

---

**通过手动安装Docker CE，您可以在Windows Server上获得轻量级的容器化环境！** ::carbon:checkmark-filled =16px /green::