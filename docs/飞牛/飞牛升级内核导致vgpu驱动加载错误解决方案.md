---
title: 飞牛升级内核导致vgpu驱动加载错误解决方案
createTime: 2025/10/25 09:22:45
permalink: /fn/vl4od1dm/
tags:
  - 飞牛OS
---

本文将详细介绍如何面对内核级升级造成自己安装的显卡驱动无法正常加载问题

<!-- more -->

:::: steps

1. **确认安装的驱动版本**

    首先需要得到当时你安装显卡的==确切版本=={.important}，最好是有源文件，上面有详细的版本号。例如 `NVIDIA-Linux-x86_64-535.230.02-grid.run`版本号就是`535.230.02`

    ::: warning 注意要点
    从这里起注意替换下面步骤命令中的版本号为你自己安装的驱动版本
    :::

2. **重新构建和安装DKMS[+DKMS]模块** 

    ```bash
    # 完全移除现有的DKMS模块
    sudo dkms remove nvidia/535.230.02 --all

    # 重新添加和构建
    sudo dkms add nvidia/535.230.02
    sudo dkms build nvidia/535.230.02
    sudo dkms install nvidia/535.230.02
    ```

    [+DKMS]:
        DKMS（Dynamic Kernel Module Support）是一个框架，用于在Linux系统中自动重建内核模块。


3. **更新initramfs[+initramfs]并加载模块**

    ```bash
    # 更新initramfs
    sudo update-initramfs -u

    # 手动加载NVIDIA模块
    sudo modprobe nvidia
    sudo modprobe nvidia_uvm
    sudo modprobe nvidia_drm
    sudo modprobe nvidia_modeset
    ```

    [+initramfs]:
        initramfs 是一个临时的根文件系统，它在 Linux 内核启动之后、真正的根文件系统被挂载之前被加载到内存中。它的主要任务是准备好必要的环境，以便内核能够成功挂载最终的根文件系统。
        
4. **验证驱动是否加载成功**

    最后输入`nvidia-smi`应当能够正常输出驱动信息，然后重启系统让飞牛能够正确识别显卡。
