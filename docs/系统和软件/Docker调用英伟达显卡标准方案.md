---
title: Docker调用英伟达显卡标准方案
createTime: 2025/8/25 19:29:32
permalink: /article/hblgf90x/
tags:
  - Docker
  - NVIDIA
  - GPU
---

本文将详细介绍如何使用NVIDIA Container Toolkit在Docker容器中调用英伟达显卡，实现GPU加速应用的容器化部署。

<!-- more -->

## 概述

NVIDIA Container Toolkit 是一个工具集，它允许在 Docker 或其他容器运行时（如 containerd、Podman）中轻松地运行支持 GPU 加速的容器。它本质上是容器运行时和主机上的 NVIDIA GPU 驱动程序之间的"桥梁"。

### 主要特性

- **无缝体验**：使用简单的命令行标志（如 `--gpus all`）即可启用 GPU 支持，无需复杂的挂载命令
- **环境一致性**：确保容器内的 CUDA 等环境与主机驱动兼容，避免了版本冲突问题  
- **安全隔离**：仍然遵循容器的安全模型，可以对容器可访问的 GPU 设备进行精细控制
- **生态兼容**：不仅支持 Docker，还支持 containerd、Podman、Kubernetes 等主流容器生态系统
- **广泛适用**：是所有基于 NVIDIA GPU 的容器应用（如深度学习训练、推理、科学计算、图形渲染）的基础依赖

::: tip 适用场景
- 深度学习模型训练和推理
- 科学计算和数值模拟
- 图形渲染和视频处理
- 加密货币挖矿
- GPU加速的数据处理
:::

## 系统要求

在开始安装之前，请确保您的环境满足以下要求：

- Linux系统（Ubuntu 18.04+ 或 CentOS 7+）
- NVIDIA GPU 硬件
- 已安装NVIDIA GPU驱动程序
- Docker已正确安装并运行
- 具有sudo权限的用户账户

::: important 前置条件
请确保您已经成功安装了NVIDIA GPU驱动程序。如果尚未安装，可以参考 [Ubuntu22安装英伟达vGPU驱动和授权](/article/wyip73af/) 教程。
:::

::: warning 网络要求
安装过程需要从NVIDIA官方仓库下载软件包，请确保：
- 网络连接正常
- 能够访问NVIDIA官方源
- 如在国内环境，建议使用科学上网或配置全局代理
:::
## 安装步骤

:::: steps

1. **添加NVIDIA Container Toolkit仓库**

   首先添加NVIDIA官方仓库的GPG密钥和软件源：

   ```bash
   # 添加GPG密钥
   curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
     sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
   
   # 添加软件源
   curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
     sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
     sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
   ```

   ::: tip GPG密钥说明
   GPG密钥用于验证软件包的完整性和来源，确保下载的软件包未被篡改。
   :::

2. **更新软件包列表并安装**

   更新APT软件包列表并安装NVIDIA Container Toolkit：

   ```bash
   # 更新软件包列表
   sudo apt-get update
   
   # 安装NVIDIA Container Toolkit
   sudo apt-get install -y nvidia-container-toolkit
   ```

   ::: note 安装内容
   此步骤将安装以下组件：
   - `nvidia-container-toolkit`：核心工具包
   - `libnvidia-container1`：运行时库
   - `nvidia-container-runtime`：容器运行时
   :::

3. **配置Docker运行时（可选）**

   将Docker配置为默认使用NVIDIA运行时：

   ```bash
   sudo nvidia-ctk runtime configure --runtime=docker
   ```

   ::: warning 配置说明
   - 此步骤是可选的，但建议执行以获得最佳体验
   - 配置后所有容器都可以通过 `--gpus` 参数访问GPU
   - 如果不执行此步骤，需要在运行容器时手动指定运行时
   :::

4. **重启Docker服务**

   重启Docker服务以使配置生效：

   ```bash
   sudo systemctl restart docker
   ```

   验证Docker服务状态：

   ```bash
   sudo systemctl status docker
   ```

::::

## 验证安装

### 基础验证

安装完成后，验证NVIDIA Container Toolkit是否正常工作：

```bash
# 检查nvidia-ctk工具
nvidia-ctk --version

# 验证Docker可以识别GPU
docker run --rm --gpus all nvidia/cuda:11.8-base-ubuntu20.04 nvidia-smi
```

::: tip 预期结果
如果安装成功，应该能看到：
- `nvidia-ctk` 版本信息
- 容器内显示的GPU信息与主机一致
:::

### 运行测试容器

使用官方CUDA镜像进行更详细的测试：

```bash
# 运行CUDA设备查询
docker run --rm --gpus all nvidia/cuda:11.8-devel-ubuntu20.04 \
  sh -c "cd /usr/local/cuda/samples/1_Utilities/deviceQuery && make && ./deviceQuery"

# 运行简单的CUDA计算测试
docker run --rm --gpus all nvidia/cuda:11.8-devel-ubuntu20.04 \
  sh -c "echo 'GPU加速测试' && nvidia-smi && nvcc --version"
```

## 使用示例

### 基本用法

以下是一些常见的Docker GPU使用示例：

```bash
# 使用所有GPU
docker run --rm --gpus all nvidia/cuda:11.8-base-ubuntu20.04 nvidia-smi

# 使用指定数量的GPU
docker run --rm --gpus 2 nvidia/cuda:11.8-base-ubuntu20.04 nvidia-smi

# 使用指定的GPU设备
docker run --rm --gpus '"device=0,1"' nvidia/cuda:11.8-base-ubuntu20.04 nvidia-smi

# 限制GPU内存使用
docker run --rm --gpus all --memory=4g nvidia/cuda:11.8-base-ubuntu20.04 nvidia-smi
```

### 深度学习框架示例

```bash
# 运行PyTorch容器
docker run --rm --gpus all -it pytorch/pytorch:latest python -c \
  "import torch; print(f'CUDA available: {torch.cuda.is_available()}'); print(f'GPU count: {torch.cuda.device_count()}')"

# 运行TensorFlow容器
docker run --rm --gpus all -it tensorflow/tensorflow:latest-gpu python -c \
  "import tensorflow as tf; print('GPU devices:', tf.config.list_physical_devices('GPU'))"
```

### Docker Compose配置

在 `docker-compose.yml` 中使用GPU：

```yaml
version: '3.8'
services:
  gpu-service:
    image: nvidia/cuda:11.8-base-ubuntu20.04
    command: nvidia-smi
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

## 故障排除

### 常见问题

::: details 容器无法识别GPU
**可能原因：**
- NVIDIA驱动未正确安装
- Docker服务未重启
- Container Toolkit配置错误

**解决方案：**
```bash
# 检查NVIDIA驱动
nvidia-smi

# 重启Docker服务
sudo systemctl restart docker

# 重新配置运行时
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```
:::

::: details "nvidia-smi"命令未找到
**可能原因：**
- 使用了错误的基础镜像
- 镜像中未包含NVIDIA工具

**解决方案：**
```bash
# 使用官方CUDA镜像
docker run --rm --gpus all nvidia/cuda:11.8-base-ubuntu20.04 nvidia-smi

# 或在自定义镜像中安装CUDA工具包
```
:::

::: details GPU内存不足
**可能原因：**
- 多个容器同时使用GPU
- GPU内存泄漏
- 容器内存限制设置不当

**解决方案：**
```bash
# 检查GPU使用情况
nvidia-smi

# 限制容器GPU内存使用
docker run --rm --gpus all --memory=2g your-image

# 清理未使用的容器
docker container prune
```
:::

### 卸载Container Toolkit

如需完全卸载NVIDIA Container Toolkit：

```bash
# 停止所有使用GPU的容器
docker stop $(docker ps -q --filter "label=gpu")

# 卸载软件包
sudo apt-get remove --purge nvidia-container-toolkit nvidia-container-runtime libnvidia-container1

# 删除配置文件
sudo rm -rf /etc/nvidia-container-runtime/
sudo rm /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo rm /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

# 重启Docker服务
sudo systemctl restart docker
```

## 相关资源

- [NVIDIA Container Toolkit官方文档](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/overview.html)
- [NVIDIA Docker Hub镜像](https://hub.docker.com/r/nvidia/cuda)
- [Docker GPU支持文档](https://docs.docker.com/config/containers/resource_constraints/#gpu)
- [Kubernetes GPU支持](https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/)

---

**安装完成后，您就可以在Docker容器中使用NVIDIA GPU进行加速计算了！** ::carbon:checkmark-filled =16px /green::