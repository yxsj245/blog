---
title: CentOS搭建PPTP服务端
createTime: 2025/8/06 19:04:11
permalink: /article/bh216sag/
tags:
  - Linux
  - VPN
  - PPTP
  - CentOS
---

点对点隧道协议（PPTP）是建立在PPP（Point to Point）点对点协议上的VPN隧道技术。

<!-- more -->

## 概述

点对点隧道协议（PPTP）是建立在PPP（Point to Point）点对点协议上的VPN隧道技术。当远程用户要访问公司专用网时，可采用PPTP网络接入方式，用户先拨号到PPTP Server建立PPP连接，然后通过PPTP协商建立一条用户到服务器的"隧道"，接着通过PPP协议的NCP协商，为用户分配一个网段内IP，用户可以使用分配到的IP进行局域网内的通信。

::: danger 安全警告
本文档仅用于示例和操作指引，请您根据实际需要操作。使用PPTP服务存在安全隐患，您需要考虑由此产生的影响及问题。
:::

::: warning 重要提醒
本协议属于VPN，因此如果您部署的是云服务器，请确保服务商是否允许搭建或提前咨询服务商说明用途，避免产生误解。本文章只提供搭建此VPN教程。
:::

## 系统要求

在开始安装之前，请确保您的系统满足以下要求：

- CentOS 7 系统
- 具有sudo权限的用户账户  
- 支持开放TCP:1723端口
- 稳定的网络连接
## 安装步骤

:::: steps

1. **安装PPTP服务**

   使用yum包管理器安装PPTP相关软件包：

   ```bash
   sudo yum install -y ppp pptpd
   ```

   ![PPTP安装成功](https://pic1.zhimg.com/80/v2-e34b4694a3b73031df04966580660a82_720w.png?source=d16d100b)

   ::: tip 安装成功标志
   如上图所示的回显表示PPTP服务端安装成功。
   :::

2. **设置网关和IP范围**

   编辑PPTP配置文件，设置VPN网关和客户端IP地址池：

   ```bash
   sudo vi /etc/pptpd.conf
   ```

   取消以下两行的注释（删除行首的`#`）：

   ```bash
   localip 192.168.0.1
   remoteip 192.168.0.234-238,192.168.0.245
   ```

   ::: note 配置说明
   - `localip`：VPN网关地址
   - `remoteip`：VPN拨号时分配给客户端的地址段
   - 确保网关和分配地址处于同一个IP段
   :::

3. **修改DNS配置（可选）**

   编辑PPP选项配置文件，设置DNS服务器：

   ```bash
   sudo vi /etc/ppp/options.pptpd
   ```

   找到并取消注释以下行，修改为阿里云DNS：

   ```bash
   ms-dns 223.5.5.5
   ms-dns 223.6.6.6
   ```

   ![DNS配置示例](https://picx.zhimg.com/80/v2-8e9b71e1169c6c317f676e652b7335aa_720w.png?source=d16d100b)

   ::: tip DNS服务器
   223.5.5.5和223.6.6.6是阿里云的公共DNS服务器地址，您可以根据需要调整为其它公共DNS服务地址。
   :::

4. **创建VPN用户**

   编辑用户认证文件，添加VPN用户账号：

   ```bash
   sudo vi /etc/ppp/chap-secrets
   ```

   按照以下格式添加用户（每行一个用户）：

   ```bash
   # 用户名    服务类型    密码    分配IP
   username    pptpd      password    *
   ```

   ![用户配置示例](https://pic1.zhimg.com/80/v2-14edf364aa39d249dfb4cd9fc90d00b5_720w.png?source=d16d100b)

   ::: tip IP分配说明
   - `*` 代表自动分配IP，支持多用户同时连接
   - 如需固定IP，可将`*`替换为具体IP地址
   - 自动分配的IP可能会随时变动
   :::

5. **设置MTU（建议）**

   设置最大传输单元以优化网络性能：

   ```bash
   sudo vi /etc/ppp/ip-up
   ```

   在文件末尾添加以下内容：

   ```bash
   ifconfig ppp0 mtu 1472
   ```

   ![MTU配置示例](https://pic1.zhimg.com/80/v2-3f8efc59bb6f0592bdad97e290d5176d_720w.png?source=d16d100b)

   ::: note 为什么设置MTU
   虽然不设置MTU也能正常使用，但设置合适的MTU值可以避免潜在的网络问题。
   :::

6. **开启内核网络转发**

   启用IP转发功能，允许数据包在网络接口间转发：

   ```bash
   sudo vi /etc/sysctl.conf
   ```

   添加以下配置：

   ```bash
   net.ipv4.ip_forward = 1
   ```

   使配置生效：

   ```bash
   sudo sysctl -p
   ```

   ![网络转发配置](https://pica.zhimg.com/80/v2-19af7d53a98d88fbae5e5f07c4f83d12_720w.png?source=d16d100b)

::::

## 配置防火墙和NAT

:::: steps

1. **安装防火墙服务（如已安装可跳过）**

   ```bash
   sudo yum install iptables-services
   ```

2. **配置NAT规则**

   设置网络地址转换规则，确保VPN客户端可以访问外网：

   **设置MASQUERADE规则：**

   ```bash
   sudo iptables -t nat -A POSTROUTING -s 192.168.0.0/24 -j MASQUERADE
   ```

   **设置SNAT规则（可选）：**

   ```bash
   sudo iptables -t nat -A POSTROUTING -s 192.168.0.0/255.255.255.0 -j SNAT --to-source <外网网卡IP>
   ```

   ::: note 外网IP获取
   - 使用 `ifconfig` 命令查看外网网卡IP
   - 大部分云服务器采用VPC网络，网卡显示的通常为内网IP
   - 此规则将VPN流量转发至外网网卡，确保VPN用户可以正常联网
   :::

3. **保存防火墙设置**

   ```bash
   sudo service iptables save
   ```

4. **允许客户端互相通信（可选）**

   如需要VPN客户端之间可以互相访问，添加以下规则：

   ```bash
   sudo iptables -A FORWARD -s 192.168.0.0/24 -d 192.168.0.0/24 -j ACCEPT
   ```

::::

## 启动和管理服务

:::: steps

1. **重启PPTP服务**

   ::: important 重要提醒
   如果对PPTP配置文件做修改（包括增加用户），必须重启服务才能生效。绝大部分用户后期连接失败都是因为没有重启PPTP服务。
   :::

   ```bash
   sudo systemctl restart pptpd
   ```

2. **设置开机自启动**

   设置PPTP和防火墙服务开机自动启动：

   ```bash
   # 设置PPTP服务开机自启
   sudo systemctl enable pptpd.service
   
   # 设置防火墙服务开机自启
   sudo systemctl enable iptables.service
   ```

::::
## 故障排除

### 常见问题

::: details yum安装pptpd提示没有软件包
这通常是由于yum源配置问题导致的，需要更换yum源：

**步骤1：进入yum源目录**
```bash
cd /etc/yum.repos.d
```

**步骤2：安装wget工具**
```bash
sudo yum install wget -y
```

**步骤3：下载新的CentOS-Base.repo文件**
```bash
sudo wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```

**步骤4：清除缓存并生成新缓存**
```bash
sudo yum clean all
sudo yum makecache
```

**步骤5：安装epel扩展源**
```bash
sudo yum install -y epel-release
```

**步骤6：再次更新缓存**
```bash
sudo yum clean all
sudo yum makecache
```
:::

## 客户端连接

### CentOS客户端连接

:::: steps

1. **安装PPTP客户端软件包**

   ```bash
   sudo yum install -y ppp pptp pptp-setup
   ```

   ![PPTP客户端安装](https://picx.zhimg.com/80/v2-884164826dba6177af11f5e572cb12f1_720w.png?source=d16d100b)

2. **连接VPN服务端**

   使用以下命令创建并启动VPN连接：

   ```bash
   pptpsetup --create test --server <服务器IP> --username <用户名> --password <密码> --encrypt --start
   ```

   ![VPN连接成功](https://picx.zhimg.com/80/v2-1e11c759d707214bfe9e15667bc79a93_720w.png?source=d16d100b)

   ::: tip 连接成功标志
   显示上图内容代表连接成功。
   :::

3. **验证连接状态**

   当系统提示已分配客户端地址时，可以查看ppp0网卡：

   ```bash
   ifconfig | grep -A 10 ppp
   ```

   ![网卡状态查看](https://picx.zhimg.com/80/v2-fc5aa8a0b2bda15603615e0885aac465_720w.png?source=d16d100b)

4. **添加默认路由（可选）**

   如需通过VPN访问外网，可添加默认路由：

   ```bash
   sudo ip route replace default dev <PPTP连接名称>
   ```

   ![路由配置](https://picx.zhimg.com/80/v2-a4a2a7bc5069bede7e35edbc4c72baf8_720w.png?source=d16d100b)

::::

### Windows客户端连接

进入 **设置** → **网络和Internet** → **VPN** → **添加VPN连接**，按照以下信息配置：

![Windows VPN配置](https://picx.zhimg.com/80/v2-b2c180fa9e1b6738cda6ebdc4d0c682f_720w.png?source=d16d100b)

::: tip 连接提示
按照上图配置后，通常可以直接连接成功，无需其他特殊设置。
:::

### Android客户端连接

::: warning 兼容性说明
由于Android 13以后系统已移除PPTP连接支持，大部分新款Android手机和iPhone均无法使用PPTP协议，暂无解决方案。

目前已知鸿蒙系统仍支持此连接协议。
:::

**配置步骤：**
设置 → 更多连接 → VPN → 添加VPN网络 → 类型选择PPTP → **切记勾选加密PPP**

## 连接问题排查

### Windows连接问题

::: details 连接失败问题
**问题1：点击连接后立即显示错误**

![连接失败示例](https://pica.zhimg.com/80/v2-a4570afabb4b28878ff1b715d208477e_720w.png?source=d16d100b)

- 通常是配置PPTP后没有重启服务导致
- 解决方案：重启PPTP服务

**问题2：连接后一直卡在"正在连接"**
- 确保云服务器安全组已开放TCP:1723端口
- 检查系统防火墙是否放通相关端口
:::

### Android连接问题

::: details Android连接断开问题
**常见解决方案：**
1. 确认勾选"加密PPP连接"选项
2. 多次尝试连接（可能是协议兼容问题，通常第二次连接会成功）
3. 如仍无法连接，可能是系统兼容性问题，暂无完美解决方案
:::

---

**配置完成后，您的PPTP VPN服务器就可以正常使用了！** ::carbon:checkmark-filled =16px /green::