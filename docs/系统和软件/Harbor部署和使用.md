---
title: Harbor部署和使用
createTime: 2025/10/18 19:35:00
permalink: /article/ylg1cioz/
tags:
  - Linux
  - Docker
  - Harbor
---

Harbor是一个开源的企业级容器镜像仓库，旨在帮助用户存储、管理和分发Docker容器镜像，提供安全性、可扩展性和多租户支持。

<!-- more -->

![](https://raw.githubusercontent.com/goharbor/website/master/docs/img/readme/harbor_logo.png)

## 概述
Harbor是由VMware开发的云原生制品仓库，扩展了开源Docker Registry，增加了许多企业所需的功能，如安全性、身份管理和访问控制。

Harbor 是一个开源可信的云原生注册表项目，用于存储、签名和扫描内容。Harbor 通过添加用户通常需要的功能（例如安全性、身份和管理）来扩展开源 Docker Distribution。使用更靠近构建和运行环境的注册表可以提高镜像传输效率。Harbor 支持在注册表之间复制镜像，还提供用户管理、访问控制和活动审计等高级安全功能。

Harbor 由[云原生计算基金会](https://cncf.io/) （CNCF） 托管。如果您是一个希望帮助塑造云原生技术发展的组织，请考虑加入 CNCF。有关谁参与以及 Harbor 如何发挥作用的详细信息，请阅读 CNCF [公告](https://www.cncf.io/blog/2018/07/31/cncf-to-host-harbor-in-the-sandbox/)。

## 前置准备
- [ ] 安装Docker（本文不再赘述，可自行搜索安装）
- [ ] 安装Docker-compose（本文不再赘述，可自行搜索安装）

## 部署
:::: steps

1. **下载官方安装脚本**

    [https://github.com/goharbor/harbor/releases](https://github.com/goharbor/harbor/releases)
    ![](https://pic-private.zhihu.com/v2-05761e58522d3dcab1377d587c576ba3~resize:1440:q75.png?source=1f5c5e47&expiration=1760791438&auth_key=1760791438-0-0-d55022e57c0039287b617fa21d79ec5f&protocol=v2&sampling=False&animatedImagePlayCount=1&overTime=60&incremental=False&sceneCode=article_draft_web&animatedImageAutoPlay=False&retryCount=3&precoder=False&draft_token=1962966977720086594)

    若您网络在中国大陆以外可以使用在线安装包，反则可以使用离线安装包，方法一样。然后上传到设备中。

2. **修改配置文件**

    - 进入`harbor`文件夹中
    - 重命名`harbor.yml.tmpl`文件为`harbor.yml`
    - 修改`harbor.yml`文件中以下的值
    ```yml
    hostname: reg.mydomain.com #第五行 修改为本机IP地址，若是公网服务器可修改为公网服务器IP
    # https如果没有涉及可直接注释全部 13-20行。如果需要请将域名ssl证书上传，否则将会部署失败
    https:
        # https port for harbor, default is 443
        port: 443
        # The path of cert and key files for nginx
        certificate: /your/certificate/path
        private_key: /your/private/key/path
        # enable strong ssl ciphers (default: false)
        # strong_ssl_ciphers: false
    ```

3. **[HTTPS可忽略]修改Docker配置文件增加私有仓库白名单**

    修改`/etc/docker/daemon.json` 添加字段
    ```json
    	"insecure-registries": ["127.0.0.1"],
    ```
    `127.0.0.1`如果不是Harbor本机推送镜像就修改为Harbor本机IP

4. **执行安装脚本**

    进入`harbor`文件夹中运行`./install.sh`将会自动拉取镜像和创建容器，等待即可
::::

## 使用
Harbor的使用实际上非常简单，个人可以用作私有仓库和镜像代理缓存功能

### 私有仓库
这个教程非常多，本人不再过多赘述，可以参考下面UP主视频
[【harbor安装和使用全流程避坑指南】8:18](https://www.bilibili.com/video/BV17SRRY8Eny?vd_source=6fdda38be5eb9fcf9f074fd04e9bf9ae)

### 镜像代理缓存
如果你想将日常使用的镜像在拉取的时候进行缓存共局域网内其他设备直接拉取
:::: steps
1. **创建代理仓库**

![](https://pic-private.zhihu.com/v2-a5d87e7870c8d780ff84ca638930c1a6~resize:1440:q75.png?source=1f5c5e47&expiration=1760794619&auth_key=1760794619-0-0-821bf91f2c0880b0d6e3d7949be39474&protocol=v2&sampling=False&animatedImagePlayCount=1&overTime=60&incremental=False&sceneCode=article_draft_web&animatedImageAutoPlay=False&retryCount=3&precoder=False&draft_token=1962966977720086594)

2. **创建项目**

![](https://pic-private.zhihu.com/v2-e2f1170d64330de5659112a89b0b25e5~resize:1440:q75.png?source=1f5c5e47&expiration=1760794745&auth_key=1760794745-0-0-01a4933af88fc044226e98e86d2b14f9&protocol=v2&sampling=False&animatedImagePlayCount=1&overTime=60&incremental=False&sceneCode=article_draft_web&animatedImageAutoPlay=False&retryCount=3&precoder=False&draft_token=1962966977720086594)

::::
然后使用`docker pull <IP>/项目名/镜像名`命令拉取的时候`harbor`会同时缓存，其他设备再次拉取`harbor`会先检测仓库源镜像是否有更新，如果没有则直接从`harbor`上下载。
例如我要拉取`xiaozhu674/gameservermanager:latest`镜像使用命令`docker pull 192.168.11.12/xiaozhu674/gameservermanager:latest`
![](https://pic-private.zhihu.com/v2-3eb4bea555d391189d5d29bd234627c3~resize:1440:q75.png?source=1f5c5e47&expiration=1760794954&auth_key=1760794954-0-0-c40e7f1df190bab5d1d73c8fb7f02600&protocol=v2&sampling=False&animatedImagePlayCount=1&overTime=60&incremental=False&sceneCode=article_draft_web&animatedImageAutoPlay=False&retryCount=3&precoder=False&draft_token=1962966977720086594)

### 镜像自动拉取缓存
适用于定时从指定仓库拉取或更新缓存到`harbor`
![](https://pic-private.zhihu.com/v2-d736a4663629d7e5e2459e22e8de3a93~resize:1440:q75.png?source=1f5c5e47&expiration=1760795130&auth_key=1760795130-0-0-791b145a09407a3710e8799949df3ee5&protocol=v2&sampling=False&animatedImagePlayCount=1&overTime=60&incremental=False&sceneCode=article_draft_web&animatedImageAutoPlay=False&retryCount=3&precoder=False&draft_token=1962966977720086594)

::: note
`源资源过滤器-名称:`这里填写你要拉取的镜像名称（不含tag）

`Tag:`填写对应镜像的`tag`

如果要拉取的是docker官方镜像就将名称填写为`library/<名称>`例如`library/python`就相当于`docker pull python`
:::

## 扩展用法
你可以将局域网内设备的docker镜像源直接填写到`harbor`地址然后使用正常拉取镜像方式，不用加任何参数以及IP地址就可以很快的拉取。
如果想拉取其他个人镜像可以创建一个`other`项目，然后在拉取的时候在镜像名前加`other`例如 `docker pull other/xiaozhu674/gameservermanager:latest` 然后就可以将`xiaozhu674/gameservermanager:latest`镜像缓存到`other`项目中，其他人直接使用`docker pull other/xiaozhu674/gameservermanager:latest`就可以拉取。

## 相关资源

- [harbor官方文档](https://goharbor.cn/)
- [Harbor私服镜像库安装教程（超详细）](https://blog.csdn.net/weixin_49862903/article/details/138197662)