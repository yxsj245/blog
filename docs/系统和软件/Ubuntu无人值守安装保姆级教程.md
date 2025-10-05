---
title: Ubuntu无人值守安装保姆级教程
createTime: 2025/3/23 19:17:01
permalink: /article/a0ddd64h/
tags:
  - Ubuntu
  - Linux
---

本文将详细介绍如何制作Ubuntu无人值守安装镜像，实现系统的自动化部署。

<!-- more -->

## 概述

Ubuntu无人值守安装（Autoinstall）是一种自动化安装方式，通过预先配置的文件实现系统的无人干预安装。这种方式特别适用于批量部署服务器或标准化环境配置。

::: tip 适用场景
- 批量服务器部署
- 标准化环境配置
- 减少人工干预和错误
- 提高部署效率
:::

## 系统要求

在开始制作无人值守安装镜像之前，请确保您具备以下条件：

- Ubuntu 20.04 LTS 或更高版本的ISO镜像
- SSH远程连接工具
- ISO编辑工具（如软碟通UltraISO）
- 已安装的Ubuntu系统（用于获取配置模板）
## 准备工作

### 所需工具

在开始制作无人值守安装镜像之前，请准备以下工具：

- **SSH远程连接工具** - 用于远程管理服务器
- **[软碟通（UltraISO）](https://ultraiso.net/)** - ISO镜像编辑工具
- **Ubuntu ISO镜像** - 官方原版安装镜像

### 获取配置模板

:::: steps

1. **安装一次标准Ubuntu系统**

   首先使用原版ISO镜像正常安装一次Ubuntu系统，这将生成默认的配置文件。

2. **获取配置文件**

   安装完成后，通过SSH连接到系统，进入安装日志目录：

   ```bash
   cd /var/log/installer/
   ```

   下载 `autoinstall-user-data` 文件并重命名：

   ```bash
   cp autoinstall-user-data user-data
   ```

   ::: tip 文件说明
   这个文件包含了系统安装时的所有配置信息，我们将基于此文件进行自定义修改。
   :::

::::

## 配置文件定制

### 参考文档

::: note 官方文档
可参考 [Ubuntu Autoinstall 官方文档](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html) 了解完整的配置参数说明。
:::

### 关键配置项修改

以下是推荐修改的主要配置项，您可以根据实际需求进行调整：

#### 1. 镜像源配置

为了提高安装速度，建议修改为国内镜像源：

```yaml
mirror-selection:
  primary:
  - uri: http://mirrors.aliyun.com/ubuntu/ # 修改为合适的镜像源
```

::: tip 镜像源选择
- 阿里云：`http://mirrors.aliyun.com/ubuntu/`
- 清华大学：`https://mirrors.tuna.tsinghua.edu.cn/ubuntu/`
- 中科大：`https://mirrors.ustc.edu.cn/ubuntu/`
:::

#### 2. 用户账户和主机名配置

```yaml
identity:
  # 主机名称
  hostname: esxivm 
  # 密码（必须使用SHA-512加密算法）
  password: $6$rounds=4096$RiF02tKVFQfhDzfC$vCdWs8Q5IAPSClY4eNaWlyAVrPLNONxlSOA4D0V2H
  realname: esxivm
  # 账户名
  username: esxivm
```

::: warning 密码加密
密码必须使用SHA-512加密算法。您可以使用以下命令生成加密密码：
```bash
openssl passwd -6 -salt $(openssl rand -base64 6) your_password
```
:::

#### 3. 时区设置

```yaml
timezone: "Asia/Shanghai"
```

#### 4. 磁盘分区配置

以下配置将系统盘全部划分给根目录：

```yaml
storage:
  layout:
    name: direct
  config:
    - path: /dev/sda
      ptable: gpt
      wipe: superblock-recursive
      type: disk
      id: disk-sda
    - device: disk-sda
      size: 100%FREE
      type: partition
      id: partition-0
    - fstype: ext4
      volume: partition-0
      type: format
      id: format-0
    - path: /
      device: format-0
      type: mount
      id: mount-0
```

::: note 磁盘配置说明
- 使用GPT分区表
- 将整个磁盘分配给根分区
- 使用ext4文件系统
- 根据实际需求可调整分区方案
:::


## 制作无人值守安装镜像

### 步骤一：创建meta-data文件

:::: steps

1. **创建空的meta-data文件**

   ::: important 重要提示
   创建一个名为 `meta-data` 的空文件，内容为空，==不需要后缀名！==
   :::

   ```bash
   touch meta-data
   ```

   这个文件是Cloud-init配置的一部分，虽然内容为空，但必须存在。

::::

### 步骤二：修改启动菜单

:::: steps

1. **打开ISO镜像**

   使用软碟通（UltraISO）打开Ubuntu原版ISO镜像文件。

2. **定位启动配置文件**

   在ISO镜像中找到 `boot/grub/grub.cfg` 启动菜单配置文件。

3. **修改启动参数**

   找到包含 `linux /casper/vmlinuz autoinstall` 的行，在该行末尾空一格添加：

   ```bash
   ds='nocloud;s=/cdrom/' ---
   ```

   ::: warning 注意事项
   - 在 `autoinstall` 后面空一格再添加参数
   - ==记得保留末尾的三个短横线 `---`==
   - 参数格式：`ds='nocloud;s=/cdrom/'`
   :::

   ![启动菜单修改示例](https://pic1.zhimg.com/80/v2-c431df4d3336e361f490b93994da432d_720w.png)

4. **保存修改**

   将修改后的 `grub.cfg` 文件重新上传到ISO镜像的原有目录，选择替换原文件。

::::

### 步骤三：添加配置文件

:::: steps

1. **准备配置文件**

   确保您已经准备好以下两个文件：
   - `meta-data`（空文件）
   - `user-data`（修改后的无人值守配置文件）

2. **添加文件到ISO根目录**

   将 `meta-data` 和修改后的 `user-data` 文件放到ISO镜像的根目录下。

   ![配置文件放置位置](https://picx.zhimg.com/80/v2-57d418adc3e495ba173de02d86ca1bf4_720w.png)

   ::: tip 文件位置
   两个配置文件必须放在ISO镜像的根目录（顶级目录），不能放在子文件夹中。
   :::

::::

### 步骤四：保存镜像

:::: steps

1. **保存修改后的ISO镜像**

   在软碟通中，点击 **文件** → **另存为** 保存修改后的ISO镜像文件。

   ![保存ISO镜像](https://picx.zhimg.com/80/v2-44d4b03a4c67ddcad2055597aab49361_720w.png)

2. **选择保存位置和文件名**

   建议使用有意义的文件名，如：`ubuntu-20.04-autoinstall.iso`

   ::: tip 命名建议
   - 包含Ubuntu版本号
   - 标注为autoinstall版本
   - 便于后续识别和管理
   :::

::::

## 测试和验证

### 安装测试

制作完成后，建议先在虚拟机中测试无人值守安装镜像：

:::: steps

1. **创建测试虚拟机**

   在虚拟化平台（如VMware、VirtualBox）中创建新的虚拟机。

2. **挂载无人值守镜像**

   将制作好的无人值守ISO镜像挂载到虚拟机。

3. **启动安装过程**

   启动虚拟机，观察安装过程是否自动进行。

4. **验证安装效果**

   正常情况下，如果成功进入无人值守安装阶段，不会出现图形界面（GUI），安装过程会自动完成。

   ![无人值守安装效果](https://pic1.zhimg.com/80/v2-71ad13bd4a00d7eada771970dee3554b_720w.png)

   ::: tip 成功标志
   - 安装过程无需人工干预
   - 不出现安装向导界面
   - 系统按照配置文件自动完成安装
   :::

::::

### 常见问题排查

::: details 安装过程中出现GUI界面
这通常表示无人值守配置没有生效，可能的原因：
- `grub.cfg` 文件修改不正确
- 配置文件路径不对
- `user-data` 文件格式错误
:::

::: details 安装失败或报错
检查以下几个方面：
- 确认 `user-data` 文件YAML格式正确
- 检查密码加密是否使用SHA-512
- 验证磁盘配置是否与实际硬件匹配
:::

::: details 网络配置问题
如果安装后网络不通：
- 检查镜像源配置是否正确
- 确认网络接口配置
- 验证DNS设置
:::

---

**制作完成后，您就拥有了一个可以自动化部署的Ubuntu安装镜像！** ::carbon:checkmark-filled =16px /green::