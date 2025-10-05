---
title: 飞牛虚拟机开启IOMMU硬件直通
createTime: 2025/4/03 19:35:10
permalink: /fn/m1rgqzmd/
tags:
  - 飞牛OS
  - 虚拟机
---

本文将详细介绍如何在飞牛OS中开启IOMMU硬件直通功能，解决虚拟机硬件直通的配置问题。

<!-- more -->

## 概述

IOMMU（Input-Output Memory Management Unit）是一种硬件功能，允许虚拟机直接访问物理硬件设备，实现硬件直通。在飞牛OS中，即使主板BIOS已开启IOMMU选项，系统可能仍显示未启用，这通常是因为内核参数配置不正确导致的。

### 什么是IOMMU硬件直通

- **Intel VT-d**：Intel的虚拟化技术，支持设备直通
- **AMD-Vi**：AMD的IOMMU实现，提供类似功能
- **硬件直通**：允许虚拟机独占使用物理硬件设备
- **性能优势**：接近原生硬件性能，特别适用于GPU直通

::: tip 适用场景
- 虚拟机GPU直通（游戏、渲染）
- 网卡直通（高性能网络）
- 存储设备直通
- 其他PCIe设备直通
:::

## 系统要求

在开始配置之前，请确保您的环境满足以下要求：

### 硬件要求

- **CPU支持**：Intel VT-d 或 AMD-Vi 技术
- **主板支持**：BIOS/UEFI中有IOMMU相关选项
- **内存**：建议8GB以上（用于宿主机和虚拟机）

### 软件要求

- 飞牛OS系统
- SSH访问权限
- 管理员权限

::: warning 前置条件
请确保在主板BIOS/UEFI设置中已经开启了以下选项：
- Intel VT-d（Intel平台）或 AMD-Vi（AMD平台）
- Virtualization Technology
- IOMMU Support
:::

## 常见问题说明

很多用户遇到的问题是：明明主板已经开启了IOMMU选项，但飞牛OS仍然显示IOMMU未启用。这主要是因为飞牛OS默认没有在内核启动参数中启用IOMMU功能。

## 配置步骤

:::: steps

1. **开启飞牛OS的SSH服务**

   首先需要在飞牛OS管理界面中开启SSH服务：

   ![开启SSH服务](https://pic1.zhimg.com/80/v2-8f4ca313f46cd0556b92b6836d354b17_720w.png)

   ::: tip SSH连接信息
   - 默认端口：22
   - 用户名：通常为admin或root
   - 密码：飞牛OS管理员密码
   :::

2. **SSH登录并获取管理员权限**

   使用SSH工具连接到飞牛OS，然后切换到管理员模式：

   ```bash
   # 切换到管理员模式
   sudo -i
   ```

   ::: note 密码输入
   输入密码时不会显示字符，这是正常的安全机制。输入完成后直接按回车键即可。
   :::

3. **编辑GRUB配置文件**

   使用nano编辑器打开GRUB配置文件：

   ```bash
   nano /etc/default/grub
   ```

   找到 `GRUB_CMDLINE_LINUX_DEFAULT` 行，在引号内添加IOMMU参数。

4. **添加IOMMU内核参数**

   根据您的CPU类型添加相应的参数：

   **Intel处理器：**
   ```bash
   intel_iommu=on iommu=pt
   ```

   **AMD处理器：**
   ```bash
   amd_iommu=on iommu=pt
   ```

   ![GRUB配置示例](https://picx.zhimg.com/80/v2-3f643e7b64632085037fa9fcded08657_720w.png)

   ::: important 参数说明
   - `intel_iommu=on` 或 `amd_iommu=on`：启用IOMMU功能
   - `iommu=pt`：设置IOMMU为直通模式，提供更好的性能
   :::

5. **保存配置文件**

   完成编辑后，保存并退出nano编辑器：

   ```bash
   # 保存并退出的步骤：
   # 1. 按 Ctrl+X
   # 2. 按 Y 确认保存
   # 3. 按 Enter 确认文件名
   ```

6. **更新内核配置并重启**

   执行以下命令更新GRUB配置和内核：

   ```bash
   # 更新GRUB配置
   sudo update-grub
   
   # 更新initramfs
   sudo update-initramfs -u -k all
   
   # 重启系统
   sudo reboot
   ```

   ::: warning 重启提醒
   系统重启后，IOMMU功能才会生效。请确保保存了所有重要工作。
   :::

::::

## 验证配置

### 检查IOMMU状态

重启完成后，可以通过以下方法验证IOMMU是否成功启用：

```bash
# 检查IOMMU是否启用
dmesg | grep -i iommu

# 检查IOMMU组
find /sys/kernel/iommu_groups/ -type l

# 查看可直通的设备
lspci -nn
```

### 飞牛OS界面确认

在飞牛OS的虚拟机管理界面中，您应该能看到IOMMU硬件直通功能已经启用：

![IOMMU启用成功](https://pic1.zhimg.com/80/v2-0344566a9dbd76e9a2e8b12d26d8ec52_720w.png)

::: tip 成功标志
- 虚拟机创建界面显示硬件直通选项
- 可以看到可直通的PCIe设备列表
- 系统日志中显示IOMMU相关信息
:::

## 故障排除

### 常见问题

::: details IOMMU仍未启用
**可能原因：**
- BIOS/UEFI中IOMMU选项未开启
- 内核参数添加位置错误
- CPU不支持IOMMU功能

**解决方案：**
```bash
# 检查CPU是否支持IOMMU
grep -E "(vmx|svm)" /proc/cpuinfo

# 检查当前内核参数
cat /proc/cmdline

# 重新编辑GRUB配置
nano /etc/default/grub
```
:::

::: details 设备无法直通
**可能原因：**
- 设备被宿主机驱动占用
- IOMMU组配置问题
- 设备不支持直通

**解决方案：**
```bash
# 查看设备IOMMU组
lspci -nn | grep -i vga
find /sys/kernel/iommu_groups/ -type l | grep <设备ID>

# 解绑设备驱动（谨慎操作）
echo "<设备ID>" > /sys/bus/pci/devices/<设备路径>/driver/unbind
```
:::

::: details 虚拟机性能不佳
**可能原因：**
- 未启用直通模式
- 内存配置不当
- CPU亲和性设置问题

**解决方案：**
- 确保使用 `iommu=pt` 参数
- 为虚拟机分配足够的内存
- 配置CPU核心绑定
:::

### 恢复默认配置

如需恢复到默认配置：

```bash
# 编辑GRUB配置
sudo nano /etc/default/grub

# 移除IOMMU参数，恢复原始配置
# 更新配置
sudo update-grub
sudo update-initramfs -u -k all
sudo reboot
```

## 使用建议

### 最佳实践

1. **设备选择**：优先选择独立的PCIe设备进行直通
2. **内存配置**：为宿主机保留足够内存（建议至少2GB）
3. **CPU配置**：合理分配CPU核心，避免过度分配
4. **驱动管理**：确保虚拟机中安装正确的设备驱动

### 性能优化

```bash
# 启用大页内存（可选）
echo 'vm.nr_hugepages=1024' >> /etc/sysctl.conf

# 设置CPU调度策略（可选）
echo 'kernel.sched_rt_runtime_us=-1' >> /etc/sysctl.conf
```

---

**配置完成后，您就可以在飞牛OS中使用IOMMU硬件直通功能了！** ::carbon:checkmark-filled =16px /green::

## 参考来源

本文参考自：[飞牛OS虚拟机已经发布，那么如何开启iommu硬件直通 - 晓旭博客](https://www.xiaoxu.vip/archives/207.html)，编写时有改动。