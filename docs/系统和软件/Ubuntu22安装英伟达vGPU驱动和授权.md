---
title: Ubuntu22安装英伟达vGPU驱动和授权
createTime: 2025/8/25 17:49:08
permalink: /article/wyip73af/
tags:
  - Linux
  - vGPU
  - NVIDIA
---

vGPU（Virtual GPU）技术允许多个虚拟机共享单个物理GPU资源，是虚拟化环境中的重要技术。本教程将指导您完成从驱动安装到授权配置的完整过程。

<!-- more -->

::: warning 重要提醒
vGPU驱动和授权配置需要管理员权限，请确保您具有sudo权限。安装过程中请严格按照步骤执行，避免系统损坏。
:::

## 系统要求

在开始安装之前，请确保您的系统满足以下要求：

- Ubuntu 22.04 LTS 系统
- 具有sudo权限的用户账户
- 支持vGPU的NVIDIA显卡
- 稳定的网络连接

## 安装步骤

:::: steps

1. **准备驱动文件**

   从VGPU驱动文件夹中找到 `Guest_Drivers` 文件夹，该文件夹内存放了所有系统的驱动离线安装包。我们只需要上传后缀为 `.deb` 的文件即可。

   ::: tip 文件位置
   通常驱动文件位于：`VGPU_Driver_Package/Guest_Drivers/Ubuntu/`
   :::

2. **更新系统软件包**

   在安装驱动之前，建议先更新系统软件包列表：

   ```bash
   # 更新软件包列表
   sudo apt update
   
   # 修复可能损坏的包依赖
   sudo apt --fix-broken install
   
   # 再次更新确保系统状态正常
   sudo apt update
   ```

3. **安装vGPU驱动**

   使用dpkg命令安装下载的驱动包：

   ```bash
   # 安装驱动（请替换为实际的驱动文件名）
   sudo dpkg -i nvidia-linux-grid-535_535.104.05_amd64.deb
   ```

   ::: note 文件名说明
   请将 `nvidia-linux-grid-535_535.104.05_amd64.deb` 替换为您实际下载的驱动文件名。
   :::

4. **验证驱动安装**

   安装完成后，使用以下命令验证驱动是否正确安装：

   ```bash
   nvidia-smi
   ```

   如果安装成功，您应该能看到GPU信息和驱动版本。
::::

# 获取vGPU授权
::: important 授权服务器
在执行此步骤之前，请确保您已经部署了vGPU授权服务器。可以参考相关教程部署授权服务。
:::

:::: steps

1. **下载授权令牌文件**

    ```bash
    wget --no-check-certificate \
    -O /etc/nvidia/ClientConfigToken/client_configuration_token_$(date '+%d-%m-%Y-%H-%M-%S').tok \
    https://您的授权服务器IP:端口/-/client-token
    ```
    ::: warning 注意事项
    - 请将 `您的授权服务器IP:端口` 替换为实际的授权服务器地址
    - 确保授权服务器可以正常访问
    :::

2. **重启授权服务**

   下载授权文件后，重启NVIDIA Grid守护进程：

   ```bash
   sudo service nvidia-gridd restart
   ```

3. **验证授权状态**

   使用以下命令检查授权是否成功：

   ```bash
   nvidia-smi -q | grep "License Status"
   ```

   或者查看详细信息：

   ```bash
   nvidia-smi -q
   ```

4. **重启系统**

   ::: danger 必须重启
   安装完成后，==必须重启系统== 以确保驱动完全生效！
   :::

   ```bash
   sudo reboot
   ```
::::

## 故障排除

### 常见问题

::: details 驱动安装失败
检查系统是否有冲突的显卡驱动，可能需要先卸载现有驱动：

```bash
sudo apt purge nvidia-*
sudo apt autoremove
```
:::

::: details 授权文件下载失败
- 检查网络连接
- 确认授权服务器地址正确
- 验证授权服务器是否正常运行
:::

::: details nvidia-smi命令无法识别
这通常表示驱动安装不完整，请重新安装驱动并重启系统。
:::

::: details 授权状态显示未授权
- 检查授权文件是否正确放置
- 确认授权服务器时间同步
- 重启nvidia-gridd服务
:::

## 相关资源

- [NVIDIA vGPU 官方文档](https://docs.nvidia.com/grid/)
- [Ubuntu 22.04 官方文档](https://ubuntu.com/server/docs)

::: tip 技术支持
如果在安装过程中遇到问题，建议查看系统日志文件：`/var/log/nvidia-installer.log`
:::

---

**安装完成后，您的系统就可以使用vGPU功能了！** 🎉

