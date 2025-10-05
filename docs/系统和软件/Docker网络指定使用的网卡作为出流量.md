---
title: Docker网络指定使用的网卡作为出流量
createTime: 2025/8/27 19:24:35
permalink: /article/jb45rscv/
tags:
  - Docker
  - 网络
  - Linux
---

本文将详细介绍如何配置Docker网络，使特定容器的出站流量通过指定的网卡进行路由。

<!-- more -->

## 概述

在某些场景下，我们需要让Docker容器的网络流量通过特定的网卡出站，比如：
- 多网卡环境下的流量分离
- 外网分流和旁路由配置
- 网络安全隔离需求
- 带宽管理和流量控制

本教程将通过创建自定义Docker网络和配置Linux路由表来实现这一需求。

::: tip 适用场景
- 多网卡服务器环境
- 需要网络流量分离的场景
- 旁路由或网络代理配置
- Docker容器网络精细化管理
:::

## 系统要求

在开始配置之前，请确保您的环境满足以下要求：

- Linux系统（支持iproute2工具）
- Docker已正确安装并运行
- 具有root权限或sudo权限
- 多网卡环境或需要指定出站网卡的场景

## 准备工作

### 确认网卡信息

首先需要确认要使用的网卡名称和网络配置：

```bash
# 查看所有网卡信息
ip a

# 查看路由表信息
ip route show
```

::: warning 重要提醒
请将以下命令中的 `ens224` 替换为您实际需要指定的网卡名称，将IP地址替换为您的实际网络配置。
:::
## 配置步骤

:::: steps

1. **创建自定义Docker网络**

   创建一个专用的Docker网络，只有连接到此网络的容器才会通过指定网卡路由：

   ```bash
   docker network create \
     --subnet=192.168.9.0/24 \
     --gateway=192.168.9.1 \
     mynet
   ```

   ::: note 网络配置说明
   - `--subnet`：指定容器网络的子网范围
   - `--gateway`：设置网关地址
   - `mynet`：自定义网络名称，可根据需要修改
   - 默认的Docker容器不会受到此配置影响
   :::

2. **定义自定义路由表**

   在系统路由表配置文件中添加新的路由表：

   ```bash
   echo "100 ens224rt" >> /etc/iproute2/rt_tables
   ```

   ::: tip 路由表说明
   - `100`：路由表ID（可选择1-252之间的数字）
   - `ens224rt`：路由表名称（建议使用网卡名+rt后缀）
   :::

3. **添加默认路由规则**

   为自定义路由表添加默认路由：

   ```bash
   ip route add default via 192.168.11.2 dev ens224 table ens224rt
   ```

   ::: warning 参数说明
   - `192.168.11.2`：指定网卡的网关地址，需要替换为实际值
   - `ens224`：目标网卡名称，需要替换为实际网卡
   - `ens224rt`：使用步骤2中定义的路由表名称
   :::

4. **配置路由规则**

   添加规则，使Docker网络的流量使用指定路由表：

   ```bash
   ip rule add from 192.168.9.0/24 table ens224rt
   ```

   ::: note 规则说明
   此规则指定来自192.168.9.0/24网段（即mynet网络）的流量使用ens224rt路由表。
   :::

5. **验证配置**

   检查路由表配置是否正确：

   ```bash
   ip route show table ens224rt
   ```

   ::: tip 预期输出
   应该看到类似以下的输出，表示配置正确：
   ```
   default via 192.168.11.2 dev ens224
   ```
   :::

::::

## 测试验证

### 网络分流测试

配置完成后，创建一个测试容器来验证网络分流是否正常工作：

```bash
# 创建测试容器
docker run -it --rm --network=mynet busybox:latest /bin/sh
```

在容器内执行以下测试命令：

```bash
# 测试网络连通性
ping -c 4 8.8.8.8

# 测试外网访问（如果配置了外网分流）
wget https://www.youtube.com/
```

::: tip 测试结果判断
- 如果是外网分流配置，能够正确下载index.html文件表示配置成功
- 如果无法访问，请检查外网分流配置（如旁路由设置）
- 可以通过 `ip route get 8.8.8.8` 命令查看流量走向
:::

### 验证流量路径

在宿主机上可以通过以下命令验证流量是否通过指定网卡：

```bash
# 查看网卡流量统计
watch -n 1 'cat /proc/net/dev | grep ens224'

# 使用tcpdump监控指定网卡流量
tcpdump -i ens224 -n
```
## 开机自动配置

由于网络相关设置默认没有持久保存，系统重启后会恢复默认配置。我们可以通过创建系统服务来实现开机自动配置路由表。

### 创建配置脚本

:::: steps

1. **创建路由配置脚本**

   创建脚本文件 `/usr/local/bin/ens224rt.sh`：

   ```bash
   sudo nano /usr/local/bin/ens224rt.sh
   ```

   脚本内容如下：

   ```bash
   #!/bin/bash
   # Docker网络路由配置脚本
   # 添加自定义路由表和规则
   
   # 等待网络完全启动
   sleep 5
   
   # 添加路由规则
   ip route add default via 192.168.11.2 dev ens224 table ens224rt
   ip rule add from 192.168.9.0/24 table ens224rt
   
   # 记录配置结果
   echo "$(date): Docker routing configured" >> /var/log/docker-routing.log
   ```

2. **设置脚本权限**

   ```bash
   sudo chmod +x /usr/local/bin/ens224rt.sh
   ```

3. **创建系统服务**

   创建服务文件 `/etc/systemd/system/ens224rt.service`：

   ```bash
   sudo nano /etc/systemd/system/ens224rt.service
   ```

   服务配置内容：

   ```ini
   [Unit]
   Description=Custom routing for Docker 192.168.9.0/24 via ens224
   After=network-online.target
   Wants=network-online.target
   
   [Service]
   Type=oneshot
   ExecStart=/usr/local/bin/ens224rt.sh
   RemainAfterExit=yes
   User=root
   
   [Install]
   WantedBy=multi-user.target
   ```

4. **启用服务**

   ```bash
   # 重新加载systemd配置
   sudo systemctl daemon-reload
   
   # 启用服务开机自启
   sudo systemctl enable ens224rt.service
   
   # 测试服务启动
   sudo systemctl start ens224rt.service
   
   ```

::::

## 故障排除

### 常见问题

::: details 路由规则不生效
**可能原因：**
- 网卡名称错误
- 网关地址配置错误
- 路由表ID冲突

**解决方案：**
```bash
# 检查网卡状态
ip link show

# 检查路由表
ip route show table all

# 删除错误的规则重新配置
ip rule del from 192.168.9.0/24 table ens224rt
ip route del default via 192.168.11.2 dev ens224 table ens224rt
```
:::

::: details 容器无法访问外网
**可能原因：**
- 指定网卡没有外网访问权限
- 防火墙阻止了流量转发
- DNS配置问题

**解决方案：**
```bash
# 检查网卡连通性
ping -I ens224 8.8.8.8

# 检查防火墙规则
iptables -L -n

# 测试DNS解析
nslookup google.com
```
:::

::: details 系统重启后配置丢失
**可能原因：**
- 系统服务没有正确启用
- 脚本权限不足
- 服务启动时机过早

**解决方案：**
```bash
# 检查服务状态
systemctl status ens224rt.service

# 查看服务日志
journalctl -u ens224rt.service

# 手动测试脚本
/usr/local/bin/ens224rt.sh
```
:::

### 清理配置

如需移除配置，可以执行以下命令：

```bash
# 删除路由规则
ip rule del from 192.168.9.0/24 table ens224rt
ip route del default via 192.168.11.2 dev ens224 table ens224rt

# 删除Docker网络
docker network rm mynet

# 停用并删除系统服务
sudo systemctl stop ens224rt.service
sudo systemctl disable ens224rt.service
sudo rm /etc/systemd/system/ens224rt.service
sudo rm /usr/local/bin/ens224rt.sh

# 从路由表文件中移除条目
sudo sed -i '/ens224rt/d' /etc/iproute2/rt_tables
```

## 相关资源

- [Docker网络官方文档](https://docs.docker.com/network/)
- [Linux路由表配置指南](https://man7.org/linux/man-pages/man8/ip-route.8.html)
- [iproute2工具使用手册](https://wiki.linuxfoundation.org/networking/iproute2)

---

**配置完成后，您的Docker容器就可以通过指定网卡进行网络通信了！** ::carbon:checkmark-filled =16px /green::