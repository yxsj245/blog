---
title: 飞牛ESXI迁移物理机或物理机迁移ESXI
createTime: 2025/3/24 19:44:30
permalink: /fn/nuza0qnl/
tags:
  - 飞牛OS
  - ESXI
  - 系统迁移
---

本文将详细介绍飞牛OS与ESXI虚拟机之间的双向迁移方法，包括从ESXI迁移到物理机和从物理机迁移到ESXI的完整流程。

<!-- more -->

## 概述

系统迁移是将操作系统从一种环境转移到另一种环境的过程。在飞牛OS的使用场景中，经常需要在物理机和ESXI虚拟机之间进行迁移，以满足不同的部署需求。

### 迁移场景

- **ESXI → 物理机**：将虚拟机中的飞牛OS迁移到物理硬件上运行
- **物理机 → ESXI**：将物理机上的飞牛OS迁移到ESXI虚拟环境中

### 技术原理

本教程采用两种不同的技术方案：
- **RDM（Raw Device Mapping）**：用于ESXI到物理机的迁移
- **VMDK虚拟磁盘**：用于物理机到ESXI的迁移

::: tip 前置准备
在开始迁移之前，建议先阅读 [飞牛系统盘迁移（大盘迁小盘）](/notes/fn/nte9xel0/) 教程，了解基本的系统文件迁移方法。
:::

## 系统要求

### 硬件要求

- **源系统**：正常运行的飞牛OS系统
- **目标环境**：ESXI服务器或物理机硬件
- **存储空间**：足够容纳系统数据的存储设备

### 软件要求

- ESXI 6.0 或更高版本
- 支持RDM功能的ESXI环境
- Linux环境（用于物理机到ESXI的迁移）
- QEMU工具包

::: warning 重要提醒
迁移过程中请务必备份重要数据，虽然迁移过程相对安全，但任何系统级操作都存在数据丢失的风险。
:::

## 方案一：ESXI迁移到物理机

### 技术原理

使用RDM（Raw Device Mapping）技术，将物理硬盘直接映射给虚拟机，虚拟机对硬盘的所有操作都会直接作用于物理硬盘，实现无损迁移。

::: note RDM技术说明
RDM简单理解就是直接把物理硬盘的分区以及内容直通给虚拟机，虚拟机对这个硬盘的所有操作都会一比一的复制到这个硬盘，操作起来非常简单，很适合这个迁移场景。
:::

### 迁移步骤

:::: steps

1. **配置RDM硬盘直通**

   在ESXI环境中为虚拟机配置RDM硬盘直通：

   - 将目标物理硬盘连接到ESXI主机
   - 在虚拟机配置中添加RDM硬盘
   - 选择物理硬盘进行直通映射

   ::: tip 参考教程
   详细的RDM配置方法可以参考B站教程：[RDM硬盘直通教程](https://www.bilibili.com/video/BV1tD4y1r7Lp/?share_source=copy_web&vd_source=6fdda38be5eb9fcf9f074fd04e9bf9ae&t=712)
   :::

2. **迁移系统文件**

   使用系统文件迁移工具将飞牛OS系统完整复制到RDM硬盘：

   ```bash
   # 参考飞牛系统盘迁移教程进行操作
   # 确保所有系统文件、配置和数据都正确复制
   ```

   ::: important 迁移要点
   - 确保分区表正确复制
   - 验证引导分区完整性
   - 检查系统配置文件
   :::

3. **移除RDM硬盘映射**

   在虚拟机配置中移除RDM硬盘映射（保留物理硬盘数据）：

   - 关闭虚拟机
   - 在虚拟机设置中移除RDM硬盘
   - 确认物理硬盘数据完整

4. **物理机部署**

   将RDM硬盘安装到目标物理机：

   - 关闭ESXI主机或安全移除硬盘
   - 将硬盘安装到目标物理机
   - 配置BIOS引导顺序
   - 启动物理机验证系统正常运行

::::

### 验证迁移结果

迁移完成后，验证以下项目：

- [ ] 系统正常启动
- [ ] 网络配置正确
- [ ] 存储设备识别正常
- [ ] 应用程序运行正常
- [ ] 数据完整性检查

## 方案二：物理机迁移到ESXI

### 技术原理

通过创建VMDK虚拟磁盘文件，使用NBD（Network Block Device）技术将VMDK文件挂载为块设备，然后将物理机系统迁移到虚拟磁盘中，最后在ESXI中创建虚拟机使用该VMDK文件。

### 迁移步骤

:::: steps

1. **安装必要工具**

   在Linux环境中安装QEMU工具包：

   ```bash
   # 更新软件包列表
   sudo apt update
   
   # 安装QEMU工具
   sudo apt install qemu-kvm qemu-utils
   ```

   ::: note 工具说明
   - `qemu-kvm`：QEMU虚拟化工具
   - `qemu-utils`：QEMU实用工具，包含qemu-img和qemu-nbd
   :::

2. **创建VMDK虚拟磁盘**

   创建适当大小的VMDK虚拟磁盘文件：

   ```bash
   # 创建20GB的VMDK虚拟磁盘
   sudo qemu-img create -f vmdk -o subformat=monolithicSparse disk.vmdk 20G
   ```

   **参数说明：**
   - `-f vmdk`：指定格式为VMDK
   - `-o subformat=monolithicSparse`：指定精简置备的单文件格式
   - `disk.vmdk`：输出文件名
   - `20G`：虚拟磁盘的最大容量为20GB

   ::: tip 容量建议
   建议VMDK文件大小略大于源系统的实际使用空间，确保有足够空间容纳所有数据。
   :::

3. **加载NBD内核模块**

   加载NBD（Network Block Device）内核模块：

   ```bash
   # 加载NBD内核模块
   sudo modprobe nbd
   ```

4. **挂载VMDK到NBD设备**

   将VMDK文件连接到NBD设备：

   ```bash
   # 将VMDK文件连接到/dev/nbd0
   sudo qemu-nbd -c /dev/nbd0 -f vmdk disk.vmdk
   ```

   **参数说明：**
   - `-c /dev/nbd0`：将VMDK文件连接到/dev/nbd0
   - `-f vmdk`：指定文件格式为VMDK

5. **验证挂载状态**

   确认VMDK文件已正确挂载：

   ```bash
   # 查看挂载的设备
   lsblk
   ```

   ![NBD设备挂载状态](https://picx.zhimg.com/80/v2-52f2eec3507fccdd655b43efa7b2f2ef_720w.png)

   ::: note 设备显示说明
   使用lsblk命令时，可能会看到很多NBD设备（如nbd0、nbd1、nbd2...nbd15）。这是因为Linux内核的NBD模块会预创建多个设备节点以支持多个NBD连接，这是正常现象。
   :::

6. **迁移系统文件**

   按照 [飞牛系统盘迁移（大盘迁小盘）](/notes/fn/nte9xel0/) 教程对NBD设备进行分区并克隆系统文件：

   ```bash
   # 对/dev/nbd0进行分区
   # 克隆源系统到目标分区
   # 更新引导配置
   ```

   ::: important 重要提示
   完成系统文件克隆后，务必先执行取消挂载操作，再进行后续步骤。
   :::

7. **取消挂载NBD设备**

   系统迁移完成后，取消NBD设备挂载：

   ```bash
   # 取消挂载NBD设备
   sudo qemu-nbd -d /dev/nbd0
   ```

8. **部署到ESXI**

   将VMDK文件上传到ESXI并创建虚拟机：

   - 将disk.vmdk文件上传到ESXI数据存储
   - 创建新的虚拟机
   - 将上传的VMDK文件作为虚拟机硬盘
   - 配置虚拟机硬件参数
   - 启动虚拟机验证系统运行

::::

### 验证迁移结果

迁移完成后，在ESXI虚拟机中验证：

- [ ] 虚拟机正常启动
- [ ] 网络配置正确
- [ ] 存储设备识别正常
- [ ] 虚拟化驱动工作正常
- [ ] 应用程序运行正常

## 故障排除

### 常见问题

::: details RDM硬盘无法识别
**可能原因：**
- 硬盘未正确连接到ESXI主机
- ESXI主机不支持该硬盘类型
- 硬盘已被其他系统占用

**解决方案：**
1. 检查硬盘物理连接
2. 在ESXI主机中确认硬盘可见
3. 重新扫描存储设备
4. 检查硬盘兼容性
:::

::: details NBD设备挂载失败
**可能原因：**
- NBD内核模块未加载
- 设备节点被占用
- VMDK文件格式错误

**解决方案：**
```bash
# 检查NBD模块状态
lsmod | grep nbd

# 重新加载NBD模块
sudo modprobe -r nbd
sudo modprobe nbd

# 使用其他NBD设备节点
sudo qemu-nbd -c /dev/nbd1 -f vmdk disk.vmdk
```
:::

::: details 系统迁移后无法启动
**可能原因：**
- 引导分区配置错误
- 硬件驱动不兼容
- 分区表损坏

**解决方案：**
1. 检查引导配置文件
2. 更新硬件驱动程序
3. 修复分区表
4. 重新安装引导程序
:::

### 性能优化建议

**ESXI虚拟机优化：**
- 分配足够的内存和CPU资源
- 启用虚拟化CPU功能
- 使用VMXNET3网络适配器
- 启用VMware Tools

**物理机优化：**
- 更新硬件驱动程序
- 优化存储设备配置
- 调整系统性能参数

## 最佳实践

### 迁移前准备

:::: steps

1. **数据备份**
   完整备份源系统的重要数据

2. **兼容性检查**
   确认目标环境的硬件兼容性

3. **资源规划**
   评估目标环境的资源需求

4. **测试环境**
   在测试环境中先进行迁移验证

::::

### 迁移后维护

- **定期备份**：建立定期备份策略
- **监控系统**：监控系统性能和稳定性
- **更新维护**：及时更新系统和驱动程序
- **文档记录**：记录迁移过程和配置信息

## 相关资源

- [飞牛系统盘迁移（大盘迁小盘）](/notes/fn/nte9xel0/)
- [RDM硬盘直通教程](https://www.bilibili.com/video/BV1tD4y1r7Lp/)

---

**通过合理选择迁移方案，您可以轻松实现飞牛OS在不同环境间的迁移！** ::carbon:checkmark-filled =16px /green::